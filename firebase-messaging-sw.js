importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
import { messaging } from 'https://drkimogad.github.io/PetStudio/firebase-config.js'; // Ensure proper export in firebase-config.js

// Push notification event - Handles background messages
self.addEventListener('push', (event) => {
    let notificationData = { title: 'PetStudio Reminder', body: 'You have a new reminder!' };

    if (event.data) {
        try {
            const payload = event.data.json();
            if (payload.notification) {
                notificationData = {
                    title: payload.notification.title || 'PetStudio Reminder',
                    body: payload.notification.body || 'You have a new reminder!',
                };
            }
        } catch (error) {
            console.error('Error parsing push event data:', error);
        }
    }

    const options = {
        body: notificationData.body,
        icon: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
        badge: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
            .catch((error) => {
                console.error('Error showing notification:', error);
            })
    );
});

// Push notification click event - Handles user interaction
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close notification on click

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/signin'); // Redirects to signin if no window is open
        })
    );
});
