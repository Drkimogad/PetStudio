const CACHE_NAME = 'PetStudio-cache-v6';
const API_CACHE = 'api-cache-v1';
const FONT_CACHE = 'fonts-cache-v1';

const OFFLINE_URL = '/offline.html';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    OFFLINE_URL
];

// Install: Precaching
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => 
            Promise.all(
                CORE_ASSETS.map(url => 
                    fetch(url, { method: 'GET' }) // Ensure it's a GET request
                        .then(res => {
                            if (res.ok) {
                                return cache.put(url, res);
                            }
                            return null;
                        })
                        .catch(console.warn)
                )
            ).then(() => self.skipWaiting())
        )
    );
});

// Fetch: Optimized strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Cache-first for static assets
    if (CORE_ASSETS.includes(url.pathname)) {
        event.respondWith(caches.match(request));
        return;
    }

    // Network-first for HTML
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // API caching
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).then(networkResponse => {
                const clone = networkResponse.clone();
                caches.open(API_CACHE).then(cache => cache.put(request, clone));
                return networkResponse;
            }).catch(() => caches.match(request))
        );
        return;
    }

    // Default: Network with cache fallback
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

// Activate: Cleanup
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.map(key => 
                    ![CACHE_NAME, API_CACHE, FONT_CACHE].includes(key) 
                        ? caches.delete(key) 
                        : null
                )
            )
        ).then(() => self.clients.claim())
    );
});
