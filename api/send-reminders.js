export default async function handler(req, res) {
  // ✅ Allow only GET or POST methods
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ✅ Fix CORS issue
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // ✅ Fetch reminders from Firestore
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/swiftreach2025/databases/(default)/documents/reminders`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const data = await response.json();
    const reminders = data.documents
      .map(doc => ({
        id: doc.name.split('/').pop(),
        subscriptionToken: doc.fields.subscriptionToken?.stringValue,
        petName: doc.fields.petName?.stringValue,
        date: doc.fields.date?.stringValue
      }))
      .filter(reminder => reminder.date === today); // ✅ Send only today's reminders

    if (reminders.length === 0) {
      console.log("No reminders for today.");
      return res.status(200).json({ message: "No reminders today" });
    }

    // ✅ Send notifications
    const notifications = reminders.map((reminder) => {
      if (reminder.subscriptionToken) {
        return fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk	`, // Replace with your actual FCM server key
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
