import { firestore } from '../firebase-admin.js'; // Ensure this is referencing your firestore instance correctly
import { sendPushNotification } from '../script.js'; // Fixed missing closing quote

export async function checkAndSendReminders() {
  try {
    // 1. Get current Nairobi time and format it as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Query Firestore for reminders for today
    const snapshot = await firestore.collection('reminders')
      .where('date', '==', today)
      .get();
    
    // 3. Extract the reminder data from the snapshot
    const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 4. Send push notifications for the reminders (if needed)
    reminders.forEach(reminder => {
      sendPushNotification(reminder);  // Assuming this function is correctly defined in script.js
    });
    
    // 5. Return the reminders
    return reminders;
    
  } catch (error) {
    console.error('Error checking reminders:', error);
    throw new Error('Failed to check and send reminders: ' + error.message);
  }
}
