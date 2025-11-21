import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Subscription } from '../store/useSubStore';
import { addMonths, addYears, subDays, parseISO, isBefore, startOfDay } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // alert('Failed to get push token for push notification!');
      console.log('Failed to get permissions');
      return;
    }
    // token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    // alert('Must use physical device for Push Notifications');
    console.log('Not a physical device');
  }

  return token;
}

export async function scheduleSubscriptionNotifications(subscription: Subscription) {
  // Cancel existing notifications for this subscription (if we tracked IDs, but we don't yet. 
  // For MVP, we might just schedule new ones. Ideally we'd store notification IDs in the subscription object).
  // Since we don't store IDs, we might duplicate if we edit. 
  // For now, let's assume this is called on creation.

  const startDate = parseISO(subscription.startDate);
  const now = new Date();
  
  // Schedule for the next 6 cycles
  let cycleDate = startDate;
  
  // Fast forward to next future date if needed
  while (isBefore(cycleDate, now)) {
     if (subscription.cycle === 'monthly') {
        cycleDate = addMonths(cycleDate, 1);
     } else {
        cycleDate = addYears(cycleDate, 1);
     }
  }

  // Generate triggers for the next 6 occurrences
  for (let i = 0; i < 6; i++) {
      const billDate = cycleDate;
      
      // 1 Week Before
      const weekBefore = subDays(billDate, 7);
      if (!isBefore(weekBefore, now)) {
          await scheduleNotification(subscription, weekBefore, '1 week');
      }

      // 4 Days Before
      const fourDaysBefore = subDays(billDate, 4);
      if (!isBefore(fourDaysBefore, now)) {
          await scheduleNotification(subscription, fourDaysBefore, '4 days');
      }

      // 1 Day Before
      const oneDayBefore = subDays(billDate, 1);
      if (!isBefore(oneDayBefore, now)) {
          await scheduleNotification(subscription, oneDayBefore, '1 day');
      }

      // Move to next cycle
      if (subscription.cycle === 'monthly') {
          cycleDate = addMonths(cycleDate, 1);
      } else {
          cycleDate = addYears(cycleDate, 1);
      }
  }
}

async function scheduleNotification(sub: Subscription, triggerDate: Date, timeFrame: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `Upcoming Bill: ${sub.name}`,
            body: `Your ${sub.currency}${sub.price} payment for ${sub.name} is due in ${timeFrame}.`,
            data: { subscriptionId: sub.id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        },
    });
}
