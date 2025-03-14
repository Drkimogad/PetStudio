import { onBackgroundMessage } from 'firebase/messaging';
import { messaging } from 'https://drkimogad.github.io/PetStudio/firebase-config'; // Import messaging from firebase config

// Handle background notifications
onBackgroundMessage(messaging, (payload) => {
  console.log('Received background message: ', payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png', // Adjust as per your path
  });
});

// Push notification event
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'You have a new reminder!',
        icon: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png', // Ensure this path is correct
        badge: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png', // Ensure this path is correct
    };

    event.waitUntil(
        self.registration.showNotification('PetStudio Reminder', options)
    );
});

// Push notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close notification on click
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/signin'); // Open app if no window is open
        })
    );
});
