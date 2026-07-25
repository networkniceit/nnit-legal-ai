import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Storage } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('legal-alerts', {
      name: 'Legal Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C9A84C',
    });
    await Notifications.setNotificationChannelAsync('meetings', {
      name: 'Meeting Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#C9A84C',
    });
    await Notifications.setNotificationChannelAsync('documents', {
      name: 'Document Ready',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await Storage.set('push_token', token);
  return token;
}

export async function scheduleMeetingReminder(
  meetingTitle: string,
  meetingTime: Date
): Promise<void> {
  const reminderTime = new Date(meetingTime.getTime() - 15 * 60 * 1000);
  if (reminderTime <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚖️ Meeting in 15 minutes',
      body: meetingTitle,
      sound: true,
      data: { type: 'meeting' },
    },
    trigger: { date: reminderTime, channelId: 'meetings' },
  });
}

export async function sendLocalNotification(
  title: string,
  body: string,
  channelId = 'legal-alerts'
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // immediate
  });
}
