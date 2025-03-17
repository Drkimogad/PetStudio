const CACHE_NAME = 'PetStudio-cache-v6'; // Update cache version 
const urlsToCache = [
    'https://drkimogad.github.io/PetStudio/',
    'https://drkimogad.github.io/PetStudio/index.html',
    'https://drkimogad.github.io/PetStudio/styles.css',
    'https://drkimogad.github.io/PetStudio/script.js',
    'https://drkimogad.github.io/PetStudio/manifest.json',
    'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    'https://drkimogad.github.io/PetStudio/icons/icon-512x512.png',
    'https://drkimogad.github.io/PetStudio/favicon.ico',
    'https://drkimogad.github.io/PetStudio/firebase-config.js',
    'https://drkimogad.github.io/PetStudio/vercel.js',
    'https://drkimogad.github.io/PetStudio/firebase-messaging-sw.js',
    'https://drkimogad.github.io/PetStudio/offline.html' // Ensure offline page is cached
];

// Install event: Precache static assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const url of urlsToCache) {
                try {
                    console.log(`Caching: ${url}`);
                    await cache.add(url);
                    console.log(`Cached successfully: ${url}`);
                } catch (error) {
                    console.warn(`Failed to cache ${url}:`, error);
                }
            }
        })
    ); 
});

// Fetch event: Serve from cache, then update cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || !networkResponse.ok) throw new Error('Network response not ok');
                // Only cache GET requests
                if (event.request.method === 'GET') {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                } else {
                    return networkResponse;
                }
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('index.html') || caches.match(OFFLINE_URL);
                }
                return caches.match('/offline.html');
            });
        })
    );
});

// Activate event: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => 
            Promise.all(
                cacheNames.map(cacheName => 
                    cacheName !== CACHE_NAME ? caches.delete(cacheName) : null
                )
            ).then(() => self.clients.claim())
        )
    );
});
