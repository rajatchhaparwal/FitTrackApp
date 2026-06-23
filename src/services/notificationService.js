import AsyncStorage from '@react-native-async-storage/async-storage';

let notifee = null;
let TriggerType = null;
try {
  const NotifeeModule = require('@notifee/react-native');
  notifee = NotifeeModule.default;
  TriggerType = NotifeeModule.TriggerType;
} catch (e) {
  console.log('[NotificationService] Notifee not linked/installed, using in-app logs');
}

const STORAGE_KEY = '@fittrack_notifications_history';

/**
 * Add a notification to local AsyncStorage history so it displays on the Notification screen.
 */
export const addNotificationToHistory = async (title, body, type = 'general') => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      type, // 'water' | 'meal' | 'exercise' | 'general'
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    history.unshift(newNotif);
    // Keep last 30 notifications
    const trimmed = history.slice(0, 30);
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
 * Trigger an immediate notification (in-app + native).
 */
export const triggerLocalNotification = async (title, body, type = 'general') => {
  // 1. Add to history logs
  await addNotificationToHistory(title, body, type);

  // 2. Try native push display
  if (notifee) {
    try {
      // Request permissions (required for iOS)
      await notifee.requestPermission();

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'fittrack_alerts',
        name: 'FitTrack Notifications',
        importance: 4, // high importance
      });

      // Display notification
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // fallback to standard launcher icon
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
 * Schedule a local notification (e.g. 1-hour delay for water).
 */
export const scheduleDelayedNotification = async (title, body, delaySeconds, type = 'general') => {
  if (notifee && TriggerType) {
    try {
      await notifee.requestPermission();
      
      const channelId = await notifee.createChannel({
        id: 'fittrack_alerts',
        name: 'FitTrack Notifications',
        importance: 4,
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
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger
      );
      console.log(`[NotificationService] Scheduled "${title}" in ${delaySeconds} seconds.`);
    } catch (e) {
      console.warn('[NotificationService] Scheduling notification failed, writing log instead:', e);
      // Fallback: schedule via a JS setTimeout if app is in foreground
      setTimeout(() => {
        triggerLocalNotification(title, body, type);
      }, delaySeconds * 1000);
    }
  } else {
    // Fallback scheduling via JS setTimeout
    console.log(`[NotificationService] Fallback scheduled: "${title}" in ${delaySeconds}s.`);
    setTimeout(() => {
      triggerLocalNotification(title, body, type);
    }, delaySeconds * 1000);
  }
};

/**
 * Setup daily alerts for workouts and meals.
 */
export const setupDefaultReminders = async () => {
  try {
    // Check if we already set up reminders once
    const alreadySetup = await AsyncStorage.getItem('@fittrack_reminders_setup');
    if (alreadySetup) return;

    // Schedule basic workout and meal alerts
    // Morning Workout: 8:00 AM
    // Lunch Meal: 1:00 PM
    // Dinner Meal: 8:00 PM
    
    // We can simulate them by scheduling relative triggers. For demo, we trigger them after some short hours delays
    await scheduleDelayedNotification('💪 Exercise Time!', 'Time to stay active! Check your trending workout plan.', 7200, 'exercise'); // 2 hours
    await scheduleDelayedNotification('🥗 Eat Meal (Lunch)', 'Time to log your lunch! Keep tracking your daily macros.', 10800, 'meal'); // 3 hours
    await scheduleDelayedNotification('🍽️ Eat Meal (Dinner)', 'Fuel your recovery! Log your dinner calories.', 25200, 'meal'); // 7 hours
    
    await AsyncStorage.setItem('@fittrack_reminders_setup', 'true');
  } catch (error) {
    console.warn('[NotificationService] Setup default reminders failed:', error);
  }
};
