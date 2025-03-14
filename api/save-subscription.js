export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or restrict to your domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Handle preflight requests
  }

  if (req.method === 'POST') {
    try {
      const subscription = req.body;
      console.log('Received subscription:', subscription);
      res.status(200).json({ message: 'Subscription saved successfully' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

