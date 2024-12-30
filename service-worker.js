const CACHE_NAME = 'PetStudio-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/service-worker.js',
    'https://drkimogad.github.io/PetStudio/manifest.json',
    'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    'https://drkimogad.github.io/PetStudio/icons/icon-512x512.png',
    'https://drkimogad.github.io/PetStudio/favicon.ico',
    '/offline.html' // Add your offline page here
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces the new service worker to take control immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opening cache:', CACHE_NAME);
            console.log('Caching assets:', urlsToCache);
            return Promise.all(urlsToCache.map(url => {
                return cache.add(url).then(() => {
                    console.log('Successfully cached:', url);
                }).catch((err) => {
                    console.error('Error caching asset:', url, err);
                });
            }));
        })
    );
});

// Fetch event: Serve assets from cache or fetch from network if not cached
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse; // Return cached response if available
            }

            // If not in cache, try to fetch from the network
            return fetch(event.request).catch(() => {
                // If the network request fails (e.g., offline), show the offline page
                if (event.request.url.endsWith('/') || event.request.url.endsWith('.html')) {
                    console.log('Network failed, showing offline page...');
                    return caches.match('/offline.html'); // Return offline page for HTML files
                }
            });
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
