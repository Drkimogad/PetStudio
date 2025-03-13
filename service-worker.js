const CACHE_NAME = 'PetStudio-cache-v5'; // Update cache version
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.ico',
    '/offline.html' // Ensure offline page is cached
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Activate new SW immediately

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets during install');
            return cache.addAll(urlsToCache);
        }).catch((err) => {
            console.error('Error caching assets:', err);
        })
    );
});

// Fetch event: Serve from cache first, fallback to network or offline.html
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse;
            }

            return fetch(event.request)
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html'); // Serve app shell when offline
                    }
                    return caches.match('/offline.html'); // Serve offline fallback
                });
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            self.clients.claim(); // Take control immediately
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'You have a new reminder!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
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
            return clients.openWindow('/'); // Open app if no window is open
        })
    );
});

// (Optional) Cache API responses for offline support
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes("https://pet-studio.vercel.app/api/save-subscription")) {
        event.respondWith(
            caches.open("api-cache").then((cache) => {
                return fetch(event.request)
                    .then((response) => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => caches.match(event.request));
            })
        );
    }
});

// Check for updates and fetch new service worker
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
