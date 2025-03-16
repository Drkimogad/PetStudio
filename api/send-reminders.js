import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
    }),
  });
}

const db = getFirestore();  // ✅ Correctly initialize Firestore

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

    // Extract reminder data
    let reminders = [];
    remindersSnapshot.forEach((doc) => {
      reminders.push(doc.data());
    });

    console.log("Reminders found:", reminders);

    return res.status(200).json({ reminders });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
