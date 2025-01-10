export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const subscription = req.body;

            // Process subscription data (e.g., save to a database)
            console.log('Received subscription:', subscription);

            // Respond with success
            res.status(200).json({ message: 'Subscription saved successfully!' });
        } catch (error) {
            console.error('Error saving subscription:', error);
            res.status(500).json({ error: 'Failed to save subscription' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}
