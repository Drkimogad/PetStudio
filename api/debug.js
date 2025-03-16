export default function handler(req, res) {
  res.status(200).json({
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "Exists" : "Not Found",
  });
}
