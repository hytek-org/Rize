import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabTaskIcon } from './navigation/TabBarIcon';

const Templates_KEY = "Templates";
const NOTIFICATIONS_KEY = 'notificationsTimes';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    AndroidAudioContentType:4,
    
  }),
});

const hours = Array.from({ length: 24 }, (_, i) => i); // Array of 24 hours

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
        console.error('Failed to load notification times from local storage', error);
      }
    };
    loadNotificationTimes();
  }, [templateId]);

  const handleHourToggle = (hour: number) => {
    setSelectedHours((prevSelectedHours) =>
      prevSelectedHours.includes(hour)
        ? prevSelectedHours.filter((h) => h !== hour)
        : [...prevSelectedHours, hour]
    );
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        `${NOTIFICATIONS_KEY}${templateId}`,
        JSON.stringify(selectedHours)
      );
      scheduleNotifications();
      Alert.alert('Success', 'Notification times saved and scheduled');
      onClose();
    } catch (error) {
      console.error('Failed to save notification times to local storage', error);
      Alert.alert('Error', 'Failed to save notification times');
    }
  };

  const scheduleNotifications = () => {
    if (Platform.OS !== 'web') {
      // Cancel all previous notifications on mobile platforms
      Notifications.cancelAllScheduledNotificationsAsync();
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
        // For Web Notifications
        const now = new Date();
        if (trigger <= now) {
          trigger.setDate(trigger.getDate() + 1);
        }

        const delay = trigger.getTime() - now.getTime();

        setTimeout(() => {
          new Notification('Daily Task Reminder', {
            body: "Don't forget to check your tasks for this hour!",
          });
        }, delay);
      } else {
        // For Mobile Notifications
        Notifications.scheduleNotificationAsync({

          content: {
            sound: Platform.OS === 'android' ? 'reminder.wav' : undefined,
           
            title: 'Daily Task Reminder',
            body: "Don't forget to check your tasks for this hour!",
            subtitle: 'Rize Track Your Progress',
            badge: 1,
            priority: Notifications.AndroidNotificationPriority.MAX,
            
          },

          trigger,
        });
      }
    });
  };
  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const twelveHour = hour % 12 || 12;
    return `${twelveHour} ${period}`;
  }
  return (
    <Modal visible={visible} animationType="slide" transparent >
      <View className='flex-1 justify-center items-center    '>
        <View className='w-4/5 p-5 bg-white dark:bg-neutral-900 shadow-xl shadow-black dark:shadow-white rounded-xl'>
          <Text className=' text-lg font-bold mb-5 dark:text-white' >Select Notification Times</Text>
          <ScrollView style={{ height: 400 }}>
            {hours.map((hour) => (

              <Pressable
                key={`hour-${hour}`} // Ensure each key is unique
                className='w-3/4 mx-auto p-2 mb-3 rounded flex flex-row justify-between items-center'
                style={{
                  backgroundColor: selectedHours.includes(hour) ? '#0eab38' : '#f0f0f0',
                }}
                onPress={() => handleHourToggle(hour)}
              >
                <TabTaskIcon name={selectedHours.includes(hour) ? 'alarm-on' : 'alarm-add'} style={{ color: selectedHours.includes(hour) ? 'white' : 'black' }} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: selectedHours.includes(hour) ? 'white' : 'black' }}> {convertHourTo12HourFormat(String(hour))}</Text>
              </Pressable>


            ))}
          </ScrollView>
          <Pressable
            style={{ marginTop: 20, padding: 15, alignItems: 'center', borderRadius: 5, backgroundColor: '#0aaf1d' }}
            onPress={handleSave}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
          </Pressable>
          <Pressable
            style={{ marginHorizontal: 50, marginTop: 20, padding: 15, alignItems: 'center', borderRadius: 5, backgroundColor: '#007bff' }}
            onPress={onClose}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationScheduler;
