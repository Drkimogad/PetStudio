import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import path from "path";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(process.cwd(), "firebase-adminsdk.json"); // Ensure this path is correct
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch reminders from Firestore
    const remindersSnapshot = await db.collection("reminders").where("date", "==", today).get();

    if (remindersSnapshot.empty) {
      console.log("No reminders for today.");
      return res.status(200).json({ message: "No reminders today" });
    }

    // Prepare notifications
    const fcmServerKey = "BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk"; // 🔴 Replace with actual Firebase server key
    const notifications = [];

    remindersSnapshot.forEach((doc) => {
      const reminder = doc.data();
      if (reminder.subscriptionToken) {
        notifications.push(
          fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmServerKey}`,
            },
            body: JSON.stringify({
              to: reminder.subscriptionToken,
              notification: {
                title: "🎉 Pet Birthday Reminder!",
                body: `It's ${reminder.petName}'s birthday today! 🎂🐶`,
              },
            }),
          })
        );
      } else {
        console.warn(`Missing subscription token for ${reminder.petName}`);
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
