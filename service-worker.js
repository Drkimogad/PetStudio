const CACHE_NAME = 'PetStudio-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/service-worker.js',
    'https://drkimogad.github.io/PetStudio/manifest.json',
    'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',
    'https://drkimogad.github.io/PetStudio/icons/icon-512x512.png'// The manifest URL is cachedd other resources as needed
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PetStudio-cache-v1).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event: Serve assets from cache, including manifest
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [PetStudio-cache-v1];
    event.waitUntil(
        caches.keys().then((PetStudio-cache-v1) => {
            return Promise.all(
                cacheNames.map((PetStudio-cache-v1) => {
                    if (!cacheWhitelist.includes(PetStudio-cache-v1)) {
                        return caches.delete(PetStudio-cache-v1);
                    }
                })
            );
        })
    );
});
