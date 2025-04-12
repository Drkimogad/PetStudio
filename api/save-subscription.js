import { db } from './lib/firebase-admin'; // Your existing setup

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { token, endpoint } = req.body;

    // Inline validation: Check if token and endpoint exist
    if (!token || !endpoint) {
      return res.status(400).json({ error: 'Token and endpoint are required.' });
    }

    // 1. Hardcode user ID for now (we'll implement auth later)
    const userId = "test-user";

    // 2. Save to users collection in Firestore
    await db.collection('users').doc(userId).set({
      fcmToken: token,
      endpoint: endpoint,
      userId: userId
    }, { merge: true }); // Update if exists

    // 3. Return success response
    res.status(200).json({ success: true });

  } catch (error) {
    // Return error if something goes wrong
    res.status(500).json({ error: 'Subscription save failed: ' + error.message });
  }
};
