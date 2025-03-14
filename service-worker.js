const CACHE_NAME = 'PetStudio-cache-v6'; // Update cache version 
const API_CACHE_NAME = 'api-cache-v1';
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
    'https://drkimogad.github.io/PetStudio/firebase-messaging-sw.js',
    'https://drkimogad.github.io/PetStudio/offline.html' // Ensure offline page is cached
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
    const url = new URL(event.request.url);
    
    // Cache API responses separately
    if (url.origin.includes('firebase') || url.pathname.includes('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then((cache) => {
                return fetch(event.request).then((response) => {
                    cache.put(event.request, response.clone());
                    return response;
                }).catch(() => caches.match(event.request));
            })
        );
        return;
    }
    
    // Serve cached assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            });
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];

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

// Check for updates and fetch new service worker
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
