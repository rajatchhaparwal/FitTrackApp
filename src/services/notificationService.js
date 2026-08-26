import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

let notifee = null;
let TriggerType = null;
let RepeatFrequency = null;
let TimeUnit = null;

try {
  const NotifeeModule = require('@notifee/react-native');
  notifee = NotifeeModule.default;
  TriggerType = NotifeeModule.TriggerType;
  RepeatFrequency = NotifeeModule.RepeatFrequency;
  TimeUnit = NotifeeModule.TimeUnit;
} catch (e) {
  console.log('[NotificationService] Notifee not linked/installed, fallback to in-app log');
}

const STORAGE_KEY = '@fittrack_notifications_history';

// Helper channel configuration
const getChannelConfig = (type) => {
  switch (type) {
    case 'water':
      return { channelId: 'fittrack_water_channel', channelName: 'Water Reminders' };
    case 'meal':
      return { channelId: 'fittrack_meal_channel', channelName: 'Meal Reminders' };
    case 'exercise':
      return { channelId: 'fittrack_exercise_channel', channelName: 'Workout Reminders' };
    default:
      return { channelId: 'fittrack_alerts_sound', channelName: 'MyFitFly Notifications' };
  }
};

/**
 * Request OS push notification permissions (Android 13+ POST_NOTIFICATIONS & iOS)
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!hasPermission) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
    }
    if (notifee) {
      await notifee.requestPermission();
    }
  } catch (e) {
    console.warn('[NotificationService] Notification permission request error:', e);
  }
};

/**
 * Add a notification to local AsyncStorage history.
 */
export const addNotificationToHistory = async (title, body, type = 'general') => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];

    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    history.unshift(newNotif);
    const trimmed = history.slice(0, 40);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return trimmed;
  } catch (error) {
    console.error('[NotificationService] Error saving to history:', error);
    return [];
  }
};

/**
 * Fetch all notifications in history.
 */
export const getNotificationsHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('[NotificationService] Error getting history:', error);
    return [];
  }
};

/**
 * Clear notification history.
 */
export const clearNotificationsHistory = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (error) {
    console.error('[NotificationService] Error clearing history:', error);
    return [];
  }
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const history = JSON.parse(raw);
    const updated = history.map(item => ({ ...item, read: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[NotificationService] Error marking as read:', error);
    return [];
  }
};

/**
 * Trigger an immediate notification (native push banner + sound + in-app log).
 */
export const triggerLocalNotification = async (title, body, type = 'general') => {
  await addNotificationToHistory(title, body, type);

  if (notifee) {
    try {
      await requestNotificationPermission();
      const config = getChannelConfig(type);

      const channelId = await notifee.createChannel({
        id: config.channelId,
        name: config.channelName,
        importance: 4, // High importance for heads-up banner
        sound: 'default',
        vibration: true,
      });

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.warn('[NotificationService] Display notification error:', e);
    }
  }
};

/**
 * Send an instant test notification.
 */
export const sendTestNotification = async () => {
  await triggerLocalNotification(
    '🔔 MyFitFly Notification Test',
    'Great! Notifications are enabled and working on your device.',
    'general'
  );
};

/**
 * Schedule a delayed local notification.
 */
export const scheduleDelayedNotification = async (title, body, delaySeconds, type = 'general') => {
  if (notifee && TriggerType) {
    try {
      await requestNotificationPermission();
      const config = getChannelConfig(type);

      const channelId = await notifee.createChannel({
        id: config.channelId,
        name: config.channelName,
        importance: 4,
        sound: 'default',
        vibration: true,
      });

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + delaySeconds * 1000,
      };

      await notifee.createTriggerNotification(
        {
          title,
          body,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
        },
        trigger
      );
    } catch (e) {
      console.warn('[NotificationService] Scheduling notification failed, using setTimeout:', e);
      setTimeout(() => {
        triggerLocalNotification(title, body, type);
      }, delaySeconds * 1000);
    }
  } else {
    setTimeout(() => {
      triggerLocalNotification(title, body, type);
    }, delaySeconds * 1000);
  }
};

/**
 * Schedule a daily repeating notification at an exact time.
 */
export const scheduleDailyNotification = async (id, title, body, hour, minute, type = 'general') => {
  if (notifee && TriggerType && RepeatFrequency) {
    try {
      await requestNotificationPermission();
      const config = getChannelConfig(type);

      const channelId = await notifee.createChannel({
        id: config.channelId,
        name: config.channelName,
        importance: 4,
        sound: 'default',
        vibration: true,
      });

      const now = new Date();
      let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      if (targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: targetDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
        },
        trigger
      );
    } catch (e) {
      console.warn('[NotificationService] Daily scheduling failed:', e);
    }
  }
};

/**
 * Schedule an hourly interval notification.
 */
export const scheduleHourlyInterval = async (id, title, body, type = 'water') => {
  if (notifee && TriggerType && TimeUnit) {
    try {
      await requestNotificationPermission();
      const config = getChannelConfig(type);

      const channelId = await notifee.createChannel({
        id: config.channelId,
        name: config.channelName,
        importance: 4,
        sound: 'default',
        vibration: true,
      });

      const trigger = {
        type: TriggerType.INTERVAL,
        interval: 1,
        timeUnit: TimeUnit.HOURS,
      };

      await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
        },
        trigger
      );
    } catch (e) {
      console.warn('[NotificationService] Hourly scheduling failed:', e);
    }
  }
};

/**
 * Setup default reminders for workouts, meals, water, and motivation.
 */
export const setupDefaultReminders = async () => {
  try {
    await requestNotificationPermission();
    const alreadySetup = await AsyncStorage.getItem('@fittrack_reminders_setup_v4');
    if (alreadySetup) return;

    await scheduleDailyNotification('morning_prep', '🌅 Good Morning!', 'Start your day with a glass of water and get ready to crush your goals!', 7, 0, 'motivation');
    await scheduleDailyNotification('meal_breakfast', '🍳 Breakfast Time', 'Fuel your body for the day. Remember to log your breakfast!', 8, 0, 'meal');
    await scheduleDailyNotification('meal_lunch', '🥗 Lunch Time', 'Time to refuel. Keep tracking your daily macros!', 13, 0, 'meal');
    await scheduleDailyNotification('pre_workout', '💪 Pre-Workout Energy', 'Time for a light snack before your evening workout!', 16, 30, 'exercise');
    await scheduleDailyNotification('daily_workout', '🔥 Workout Time!', 'Time to stay active! Check your trending workout plan.', 18, 0, 'exercise');
    await scheduleDailyNotification('meal_dinner', '🍽️ Dinner Time', 'Fuel your recovery! Log your dinner calories.', 20, 30, 'meal');
    await scheduleHourlyInterval('hourly_water', '💧 Hydration Check', 'Drink a glass of water. Keep your body hydrated!', 'water');

    await AsyncStorage.setItem('@fittrack_reminders_setup_v4', 'true');
  } catch (error) {
    console.warn('[NotificationService] Setup default reminders failed:', error);
  }
};
