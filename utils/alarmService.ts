import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TaskAlarm {
  identifier: string;
  hour: number;
  minute: number;
  title: string;
  enabled: boolean;
  nextAlarm?: string; // Add this property
}

interface AlarmStorage {
  [taskId: number]: TaskAlarm;
}

let alarmSound: Audio.Sound | null = null;
let activeAlarms: { [key: string]: NodeJS.Timeout } = {};

// Configure notifications to not play sound immediately
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We'll handle sound based on time
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const shouldPlayAlarm = (targetHour: number, targetMinute: number): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return currentHour === targetHour && currentMinute === targetMinute;
};

export const setupAlarmSound = async () => {
  if (alarmSound) {
    await alarmSound.unloadAsync();
  }
  const { sound } = await Audio.Sound.createAsync(
    require('../assets/sound/simple.mp3'),
    {
      isLooping: true,
      volume: 1.0,
      shouldPlay: false,
    }
  );
  alarmSound = sound;
};

export const playAlarm = async (hour: number, minute: number) => {
  try {
    if (!shouldPlayAlarm(hour, minute)) {
      console.log(`Not time yet. Current: ${new Date().toLocaleTimeString()}, Target: ${hour}:${minute}`);
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    if (!alarmSound) {
      await setupAlarmSound();
    }
    
    await alarmSound?.playAsync();
  } catch (error) {
    console.error('Error playing alarm:', error);
  }
};

export const stopAlarm = async () => {
  try {
    await alarmSound?.stopAsync();
    await alarmSound?.unloadAsync();
    alarmSound = null;
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
};

export const scheduleTaskAlarm = async (taskId: number, hour: number, minute: number, title: string) => {
  try {
    await cancelTaskAlarm(taskId);

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    console.log(`Scheduling alarm for: ${scheduledTime.toLocaleString()}`);

    // Calculate milliseconds until alarm
    const msUntilAlarm = scheduledTime.getTime() - now.getTime();

    // Schedule both notification and sound
    const timer = setTimeout(async () => {
      // Play sound
      await setupAlarmSound();
      await alarmSound?.playAsync();

      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Task Alarm",
          body: title,
          data: { taskId, type: 'alarm' },
        },
        trigger: null, // Immediate notification
      });
    }, msUntilAlarm);

    // Store the timer reference
    activeAlarms[taskId.toString()] = timer;

    // Store alarm info
    const alarms = await AsyncStorage.getItem('taskAlarms');
    const alarmsObj: AlarmStorage = alarms ? JSON.parse(alarms) : {};
    
    alarmsObj[taskId] = {
      identifier: taskId.toString(),
      hour,
      minute,
      title,
      enabled: true,
      nextAlarm: scheduledTime.toISOString(), // Now TypeScript knows about this property
    };

    await AsyncStorage.setItem('taskAlarms', JSON.stringify(alarmsObj));
    return taskId.toString();
  } catch (error) {
    console.error('Error scheduling alarm:', error);
    return null;
  }
};

export const cancelTaskAlarm = async (taskId: number) => {
  try {
    // Clear the timer if exists
    if (activeAlarms[taskId]) {
      clearTimeout(activeAlarms[taskId]);
      delete activeAlarms[taskId];
    }

    // Stop sound if playing
    await stopAlarm();

    // Remove from storage
    const alarms = await AsyncStorage.getItem('taskAlarms');
    const alarmsObj: AlarmStorage = alarms ? JSON.parse(alarms) : {};
    
    if (alarmsObj[taskId]) {
      delete alarmsObj[taskId];
      await AsyncStorage.setItem('taskAlarms', JSON.stringify(alarmsObj));
    }
  } catch (error) {
    console.error('Error canceling alarm:', error);
  }
};

// Add this function to restore alarms after app restart
export const restoreAlarms = async () => {
  try {
    const alarms = await AsyncStorage.getItem('taskAlarms');
    if (!alarms) return;

    const alarmsObj = JSON.parse(alarms);
    const now = new Date();

    Object.entries(alarmsObj).forEach(([taskId, alarm]: [string, any]) => {
      const nextAlarm = new Date(alarm.nextAlarm);
      if (nextAlarm > now) {
        scheduleTaskAlarm(
          parseInt(taskId),
          alarm.hour,
          alarm.minute,
          alarm.title
        );
      }
    });
  } catch (error) {
    console.error('Error restoring alarms:', error);
  }
};
