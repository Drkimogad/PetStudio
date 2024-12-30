const CACHE_NAME = 'PetStudio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
  '/offline.html'
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces the new service worker to take control immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opening cache:', CACHE_NAME);
            console.log('Caching assets:', urlsToCache); // Log URLs being cached
            return cache.addAll(urlsToCache)
                .then(() => {
                    console.log('Assets successfully cached!');
                })
                .catch((err) => {
                    console.error('Error caching assets:', err); // Log any errors
                });
        })
    );
});

// Fetch event: Serve assets from cache or fetch from network if not cached
self.addEventListener('fetch', (event) => {
    console.log('Fetch event for:', event.request.url); // Log every fetch request
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse; // Return cached response if available
            }
            console.log('Fetching from network:', event.request.url);
            return fetch(event.request); // If not in cache, fetch from network
        }).catch((err) => {
            console.error('Error fetching:', err);
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache
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
        })
    );
});
