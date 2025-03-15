export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Get today's date in YYYY-MM-DD format
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Fetch all reminders from Firestore
        const response = await fetch(`https://firestore.googleapis.com/v1/projects/swiftreach2025/databases/(default)/documents/reminders`);
        if (!response.ok) {
            throw new Error('Failed to fetch reminders');
        }

        const data = await response.json();
        const reminders = data.documents
            .map(doc => ({
                id: doc.name.split('/').pop(),
                ...doc.fields
            }))
            .filter(reminder => reminder.date?.stringValue === today); // ✅ Filter reminders for today

        if (reminders.length === 0) {
            console.log('No reminders for today.');
            return res.status(200).json({ message: 'No reminders today' });
        }

        // Send push notifications
        const notifications = reminders.map((reminder) => {
            if (reminder.subscriptionToken) {
                return fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `key=BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk`, // Replace with your Firebase server key
                    },
                    body: JSON.stringify({
                        to: reminder.subscriptionToken.stringValue, // ✅ Ensure correct field extraction
                        notification: {
                            title: "Pet Birthday Reminder! 🎉",
                            body: `It's ${reminder.petName?.stringValue || "your pet"}'s birthday today! 🎂🐶`,
                        },
                    }),
                });
            } else {
                console.warn(`Missing subscription token for ${reminder.petName?.stringValue}`);
                return Promise.resolve();
            }
        });

        await Promise.all(notifications);

        console.log('Reminders sent successfully!');
        return res.status(200).json({ message: 'Reminders sent' });

    } catch (error) {
        console.error('Error sending reminders:', error);
        return res.status(500).json({ error: 'Failed to send reminders' });
    }
}
