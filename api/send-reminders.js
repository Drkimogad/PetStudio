import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      })
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
    process.exit(1);
  }
}

const db = getFirestore();

export default async function main() {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(`Checking reminders for ${today}`);

    // Get today's reminders
    const remindersSnapshot = await db.collection("reminders")
      .where("date", "==", today)
      .get();

    if (remindersSnapshot.empty) {
      console.log("No reminders found for today");
      return { success: true, message: "No reminders today" };
    }

    // Process reminders
    const promises = remindersSnapshot.docs.map(async (doc) => {
      const reminder = doc.data();
      
      // Get user's FCM token from users collection
      const userDoc = await db.collection("users").doc(reminder.userId).get();
      
      if (!userDoc.exists) {
        console.warn(`User ${reminder.userId} not found`);
        return null;
      }

      const userData = userDoc.data();
      const fcmToken = userData.fcmToken;

      if (!fcmToken) {
        console.warn(`No FCM token for user ${reminder.userId}`);
        return null;
      }

      // Create notification message
      const message = {
        notification: {
          title: `It's ${reminder.petname}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
          body: reminder.message.replace('${petname}', reminder.petName),
        },
        token: fcmToken
      };

      // Send notification
      try {
        await admin.messaging().send(message);
        console.log(`Notification sent to ${reminder.userId} for ${reminder.petName}`);
        return { success: true, reminderId: doc.id };
      } catch (error) {
        console.error(`Error sending to ${reminder.userId}:`, error);
        return { success: false, reminderId: doc.id, error };
      }
    });

    // Wait for all notifications to process
    const results = await Promise.all(promises);
    
    return {
      success: true,
      totalReminders: results.length,
      sentCount: results.filter(r => r?.success).length,
      errors: results.filter(r => !r?.success)
    };

  } catch (error) {
    console.error("Critical error in reminder processing:", error);
    return { success: false, error: error.message };
  }
}
