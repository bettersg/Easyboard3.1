import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// Define the structure of the incoming request body
interface NotificationPayload {
    to: string;
    notification: {
        title: string;
        body: string;
    };
    data?: { [key: string]: string };
    priority?: 'high' | 'normal';
}

/**
 * An HTTPS-triggered function that sends a push notification.
 * Enables CORS to be called from the client app.
 */
export const sendNotification = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { to, notification, data, priority } = req.body as NotificationPayload;

        // Validate required fields
        if (!to || !notification || !notification.title || !notification.body) {
            res.status(400).json({ error: 'Missing required fields in notification payload' });
            return;
        }

        // Create the FCM message payload
        const message: admin.messaging.Message = {
            token: to,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: data || {},
            android: {
                priority: priority || 'high',
                notification: {
                    channelId: 'location-share-cn', // Ensure this channel is created on the Android client
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        // Send the message using the Firebase Admin SDK
        const response = await admin.messaging().send(message);

        console.log('Successfully sent message:', response);
        res.status(200).json({ success: true, messageId: response });

    } catch (error) {
        console.error('Error sending message:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to send notification', details: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
});