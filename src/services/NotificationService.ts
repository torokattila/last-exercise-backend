import * as admin from 'firebase-admin';
import { Logger } from '../common';

const logger = Logger(__filename);

if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
    });
  } else {
    logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Push notifications will not work.');
  }
}

// In-memory map of userId -> active timer
const scheduledTimers = new Map<string, NodeJS.Timeout>();

const scheduleNotification = (
  userId: string,
  fcmToken: string,
  exerciseName: string,
  intervalSeconds: number,
): void => {
  cancelScheduledNotification(userId);

  const timeoutId = setTimeout(async () => {
    try {
      await sendPushNotification(fcmToken, exerciseName);
    } catch (error: any) {
      logger.error(`Failed to send push notification for userId ${userId}: ${error}`);
    } finally {
      scheduledTimers.delete(userId);
    }
  }, intervalSeconds * 1000);

  scheduledTimers.set(userId, timeoutId);
  logger.info(`Scheduled push notification for userId ${userId} in ${intervalSeconds}s`);
};

const cancelScheduledNotification = (userId: string): void => {
  const existing = scheduledTimers.get(userId);
  if (existing) {
    clearTimeout(existing);
    scheduledTimers.delete(userId);
    logger.info(`Cancelled scheduled notification for userId ${userId}`);
  }
};

const sendPushNotification = async (
  fcmToken: string,
  exerciseName: string,
): Promise<void> => {
  const message: admin.messaging.Message = {
    token: fcmToken,
    notification: {
      title: 'Time for your exercise!',
      body: `It's time to do: ${exerciseName}`,
    },
    webpush: {
      notification: {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      },
    },
  };

  await admin.messaging().send(message);
  logger.info(`Push notification sent for exercise: ${exerciseName}`);
};

export default {
  scheduleNotification,
  cancelScheduledNotification,
  sendPushNotification,
};
