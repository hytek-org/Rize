// notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
   
  }),
});

// Request permissions
export const requestPermissions = async () => {
  // Request permission on web using `expo-permissions` or appropriate method
  if (Platform.OS === 'web') {
    // For web, use a more web-specific approach, such as the Notifications API
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  } else {
    // Request permission on mobile
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }
};



// Schedule a notification
export const scheduleNotification = async () => {
  if (Platform.OS === 'web') {
    // Web notification handling
    if (Notification.permission === 'granted') {
      new Notification('Hello World', {
        body: 'This is a test notification.',
       
      });
    } else {
      console.error('Notification permission not granted');
    }
  } else {
    // Mobile notification handling
    await Notifications.scheduleNotificationAsync({
      content: {
        sound: Platform.OS === 'ios' ? 'notifications.wav' : undefined, 
        title: "Hello World",
        body: "This is a test notification.",
      },
      trigger: { seconds: 1 },
    });
  }
};