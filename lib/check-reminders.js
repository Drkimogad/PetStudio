import { firestore } from '../firebase-admin';
import { sendPushNotification } from '../script.js;

export async function checkAndSendReminders() {
  try {
    // 1. Get current Nairobi time
      const today = new Date().toISOString().split('T')[0];
      timeZone: process.env.TZ
    });

    // 2. Query Firestore
    const snapshot = await db.collection('reminders')
    .where('date', '==', today)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
