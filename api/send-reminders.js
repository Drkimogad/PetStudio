import admin from "firebase-admin";

// Allow only client-side Firebase usage (no Admin SDK)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Initialize Firebase (only needed if not already initialized)
const firebaseConfig = {
  apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
  authDomain: "swiftreach2025.firebaseapp.com",
  projectId: "swiftreach2025",
  storageBucket: "swiftreach2025.firebasestorage.app",
  messagingSenderId: "540185558422",
  appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
  measurementId: "G-SNBPRVBPNM"
  vapidKey: "BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk" // Your VAPID key,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (update this for security)
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get today's date
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Fetch reminders from Firestore (client-side)
    const remindersCollection = collection(db, "reminders");
    const snapshot = await getDocs(remindersCollection);

    // Process fetched reminders
    const reminders = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((reminder) => reminder.date === today);

    if (reminders.length === 0) {
      console.log("No reminders for today.");
      return res.status(200).json({ message: "No reminders today" });
    }

    // Send Notifications via Firebase Cloud Messaging (FCM)
    const notifications = reminders.map((reminder) => {
      if (reminder.subscriptionToken) {
        return fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk	`, // 🔴 Replace with your actual FCM Server Key
          },
          body: JSON.stringify({
            to: reminder.subscriptionToken,
            notification: {
              title: "Pet Birthday Reminder! 🎉",
              body: `It's ${reminder.petName}'s birthday today! 🎂🐶`,
            },
          }),
        });
      } else {
        console.warn(`Missing subscription token for ${reminder.petName}`);
        return Promise.resolve();
      }
    });

    await Promise.all(notifications);
    console.log("Reminders sent successfully!");
    return res.status(200).json({ message: "Reminders sent" });
  } catch (error) {
    console.error("Error sending reminders:", error);
    return res.status(500).json({ error: "Failed to send reminders" });
  }
}
