// api/send-notification.js
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const messaging = admin.messaging();

export async function POST(req) {
  try {
    const { title, body, subscription } = await req.json();

    // Ensure we have a valid subscription (in real-world scenarios, fetch from DB)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Send the notification via Firebase Admin SDK
    const message = {
      notification: {
        title,
        body,
      },
      token: subscription.endpoint, // This is the subscription's endpoint for FCM
    };

    // Send the push notification
    await messaging.send(message);

    return NextResponse.json({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
