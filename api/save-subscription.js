import { db } from './lib/firebase-admin'; // Your existing setup
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

export default async (req, res) => {
  try {
    const { token, endpoint } = req.body;
    
    // 1. Hardcode user ID for now (we'll implement auth later)
    const userId = "test-user";
    
    // 2. Save to users collection
    await db.collection('users').doc(userId).set({
      fcmToken: token,
      endpoint: endpoint,
      userId: userId
    }, { merge: true }); // Update if exists

    // 3. Return success
    res.status(200).json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: 'Subscription save failed: ' + error.message });
  }
}
