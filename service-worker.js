const CACHE_NAME = 'PetStudio-cache-v4'; // Update cache version
const urlsToCache = [
    'https://drkimogad.github.io/PetStudio/',                // Main page URL
    'https://drkimogad.github.io/PetStudio/index.html',      // Ensure main HTML page is cached
    'https://drkimogad.github.io/PetStudio/styles.css',
    'https://drkimogad.github.io/PetStudio/script.js',
    'https://drkimogad.github.io/PetStudio/manifest.json',
    'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    'https://drkimogad.github.io/PetStudio/favicon.ico',
    'https://drkimogad.github.io/PetStudio/offline.html'     // Ensure offline page is cached
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces the new service worker to take control immediately

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets during install');
            return cache.addAll(urlsToCache)
                .then(() => {
                    console.log('Assets successfully cached!');
                    // Debugging: List cached URLs
                    cache.keys().then((requestUrls) => {
                        requestUrls.forEach((url) => {
                            console.log('Cached URL:', url);
                        });
                    });
                })
                .catch((err) => {
                    console.error('Error caching assets:', err);
                });
        })
    );
});

// Fetch event: Serve assets from cache or fetch from network if not cached
self.addEventListener('fetch', (event) => {
    console.log('Fetching request for:', event.request.url);

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse; // Serve from cache
            }

            // If the request is for an HTML file (navigation), return the offline page
            if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');  // Ensure offline.html is cached
            }

            console.log('Fetching from network:', event.request.url);
            return fetch(event.request).catch(() => {
                // Offline fallback if fetch fails (e.g., user is offline)
                return caches.match('/offline.html');  // Ensure offline.html is cached
            });
        }).catch((err) => {
            console.error('Error fetching:', err);
            // In case of any unexpected errors, fallback to offline.html
            return caches.match('/offline.html');
        })
    );
});

// Activate event: Clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];  // Only keep the current cache

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated and ready');
            self.clients.claim();  // Claim clients immediately after activation
        })
    );
});

// **UPDATED SECTION FOR PUSH NOTIFICATIONS**

self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'You have a new reminder!',
        icon: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
        badge: 'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    };

    event.waitUntil(
        self.registration.showNotification('PetStudio Reminder', options)
    );
});

// **END OF UPDATED SECTION**

// NEW: Check for updates and fetch new service worker
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting(); // Skip waiting and immediately activate the new service worker
    }
});
