    export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    res.status(200).json({ message: "Reminder API working!" });
    }
    // Get today's date in YYYY-MM-DD format
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Fetch reminders from your backend API (which gets data from Firestore)
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/swiftreach2025/databases/(default)/documents/reminders?where=date=${today}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const reminders = await response.json();

    if (reminders.length === 0) {
      console.log('No reminders for today.');
      return new Response(JSON.stringify({ message: 'No reminders today' }), { status: 200 });
    }

    const notifications = reminders.map((reminder) => {
      if (reminder.subscriptionToken) {
        return fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk	`, // Replace with your Firebase server key
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

    console.log('Reminders sent successfully!');
    return new Response(JSON.stringify({ message: 'Reminders sent' }), { status: 200 });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return new Response(JSON.stringify({ error: 'Failed to send reminders' }), { status: 500 });
  }
}
