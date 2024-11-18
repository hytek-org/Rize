import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabTaskIcon } from './navigation/TabBarIcon';
import CustomAlert from '@/components/CustomAlert';
const NOTIFICATIONS_KEY = 'notificationsTimes';
const hours = Array.from({ length: 24 }, (_, i) => i);

type NotificationSchedulerProps = {
  visible: boolean;
  onClose: () => void;
  templateId: number;
};

const NotificationScheduler: React.FC<NotificationSchedulerProps> = ({
  visible,
  onClose,
  templateId,
}) => {
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  useEffect(() => {
    const loadNotificationTimes = async () => {
      try {
        const storedTimes = await AsyncStorage.getItem(
          `${NOTIFICATIONS_KEY}${templateId}`
        );
        if (storedTimes) {
          setSelectedHours(JSON.parse(storedTimes));
        }
      } catch (error) {
        console.error('Failed to load notification times:', error);
      }
    };
    loadNotificationTimes();
  }, [templateId]);

  const handleHourToggle = (hour: number) => {
    setSelectedHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    );
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        `${NOTIFICATIONS_KEY}${templateId}`,
        JSON.stringify(selectedHours)
      );
      scheduleNotifications();
      setAlertTitle('Success');
      setAlertMessage('Notification times saved and scheduled.');
      setAlertType('success');
      setAlertVisible(true);
      onClose();
    } catch (error) {
      console.error('Failed to save notification times:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to save notification times.');
      setAlertType('error');
      setAlertVisible(true);
    }
  };

  const scheduleNotifications = async () => {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    selectedHours.forEach((hour) => {
      const trigger = new Date();
      trigger.setHours(hour);
      trigger.setMinutes(0);
      trigger.setSeconds(0);

      if (trigger <= new Date()) {
        trigger.setDate(trigger.getDate() + 1);
      }

      if (Platform.OS === 'web') {
        const delay = trigger.getTime() - new Date().getTime();
        setTimeout(() => {
          new Notification('Daily Task Reminder', {
            body: "Don't forget to check your tasks for this hour!",
          });
        }, delay);
      } else {
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily Task Reminder',
            body: "Don't forget to check your tasks for this hour!",
            badge: 1,
          },
          trigger,
        });
      }
    });
  };

  const convertHourTo12HourFormat = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <View className="flex-1 max-h-full min-h-full h-full justify-center items-center bg-black/30 mb-20">
          <View className="w-4/5 p-5 bg-white dark:bg-neutral-900 shadow-xl rounded-xl">
            <Text className="text-lg font-bold mb-5 dark:text-white">
              Select Notification Times
            </Text>
            <ScrollView className="h-96">
              {hours.map((hour) => (
                <Pressable
                  key={hour}
                  className={`w-3/4 mx-auto p-2 mb-3 rounded flex flex-row justify-between items-center ${selectedHours.includes(hour) ? 'bg-green-600' : 'bg-gray-100'
                    }`}
                  onPress={() => handleHourToggle(hour)}
                >
                  <TabTaskIcon
                    name={selectedHours.includes(hour) ? 'alarm-on' : 'alarm-add'}
                    style={{
                      color: selectedHours.includes(hour) ? 'white' : 'black',
                    }}
                  />
                  <Text
                    className={`text-sm font-semibold ${selectedHours.includes(hour) ? 'text-white' : 'text-black'
                      }`}
                  >
                    {convertHourTo12HourFormat(hour)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              className="mt-5 p-3 rounded-full bg-green-600 flex items-center"
              onPress={handleSave}
            >
              <Text className="text-white text-center font-semibold">Save</Text>
            </Pressable>
            <Pressable
              className="mt-3 p-3 rounded-full bg-blue-500 flex items-center w-32 mx-auto"
              onPress={onClose}
            >
              <Text className="text-white text-center font-semibold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Display Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />
    </>
  );
};

export default NotificationScheduler;
