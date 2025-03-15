import admin from "firebase-admin";

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)),
  });
}

// Function to send push notification
async function sendNotification(subscriptionToken, petName) {
  const payload = {
    notification: {
      title: "Pet Reminder",
      body: `It's time to check on ${petName}!`,
    },
    token: subscriptionToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log("Notification sent successfully:", response);
    return { success: true, message: "Notification sent" };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
}

// Main API handler
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Set CORS headers (allow frontend access)
  res.setHeader("Access-Control-Allow-Origin", "https://drkimogad.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Fetch all reminders from Firestore
    const db = admin.firestore();
    const remindersSnapshot = await db.collection("reminders").get();

    if (remindersSnapshot.empty) {
      return res.status(404).json({ error: "No reminders found" });
    }

    let notifications = [];

    remindersSnapshot.forEach((doc) => {
      const { subscriptionToken, petName, date } = doc.data();

      if (!subscriptionToken) {
        console.warn(`Missing subscription token for reminder ${doc.id}`);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      if (date === today) {
        notifications.push(sendNotification(subscriptionToken, petName));
      }
    });

    // Wait for all notifications to be sent
    const results = await Promise.all(notifications);

    return res.status(200).json({ message: "Reminders processed", results });
  } catch (error) {
    console.error("Error processing reminders:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
