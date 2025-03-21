// the best sw.js template for future use.
const CACHE_NAME = 'PetStudio-cache-v6'; // Update cache version 
const urlsToCache = [
    './PetStudio/',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './favicon.ico',
    './firebase-config.js',
    './firebase.json',
    './vercel.json',
    './offline.html' // Ensure offline page is cached
];

const TIMEOUT = 5000; // Network request timeout in milliseconds

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

// Fetch event: Serve from cache, then update cache with timeout
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(reject, TIMEOUT);
                fetch(event.request).then(networkResponse => {
                    clearTimeout(timeoutId);
                    if (!networkResponse || !networkResponse.ok) throw new Error('Network response not ok');
                    // Only cache GET requests
                    if (event.request.method === 'GET') {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    resolve(networkResponse);
                }).catch(() => {
                    if (event.request.mode === 'navigate') {
                        caches.match('index.html').then(resolve);
                    } else {
                        caches.match('/offline.html').then(resolve);
                    }
                });
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

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Notify clients about the new service worker
self.addEventListener('updatefound', () => {
    const newWorker = self.installing;
    newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ action: 'newVersion' });
        }
    };
});
