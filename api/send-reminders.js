import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const messaging = admin.messaging();
const db = admin.firestore();

export async function GET(req) {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Fetch today's reminders from Firestore
    const snapshot = await db.collection('reminders').where('date', '==', today).get();

    if (snapshot.empty) {
      console.log('No reminders for today.');
      return new Response(JSON.stringify({ message: 'No reminders today' }), { status: 200 });
    }

    const notifications = [];

    snapshot.forEach((doc) => {
      const reminder = doc.data();
      if (reminder.subscriptionToken) {
        notifications.push(
          messaging.send({
            notification: {
              title: "Pet Birthday Reminder! 🎉",
              body: `It's ${reminder.petName}'s birthday today! 🎂🐶`,
            },
            token: reminder.subscriptionToken,
          })
        );
      } else {
        console.warn(`Missing subscription token for ${reminder.petName}`);
      }
    });

    if (notifications.length > 0) {
      await Promise.all(notifications);
      console.log('Reminders sent successfully!');
      return new Response(JSON.stringify({ message: 'Reminders sent' }), { status: 200 });
    } else {
      console.log('No valid subscriptions to send.');
      return new Response(JSON.stringify({ message: 'No valid subscriptions' }), { status: 200 });
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
    return new Response(JSON.stringify({ error: 'Failed to send reminders' }), { status: 500 });
  }
}
