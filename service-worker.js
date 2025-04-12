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
    'banner/image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js",
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
    OFFLINE_URL
];

// Install: Precaching
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                CORE_ASSETS.map(url => {
                    return fetch(new Request(url, { method: 'GET' }))
                        .then(response => {
                            if (response.ok) return cache.put(url, response);
                            return null;
                        })
                        .catch(error => {
                            console.warn(`Failed to cache ${url}:`, error);
                            return null;
                        });
                })
            ).then(() => self.skipWaiting());
        })
    );
});

// Fetch: Network with cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and Vercel analytics
    if (request.method !== 'GET' || url.pathname.includes('_vercel/insights/')) {
        return;
    }

    // HTML navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // API caching
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(networkResponse => {
                    const clone = networkResponse.clone();
                    caches.open(API_CACHE)
                        .then(cache => cache.put(request, clone));
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Default caching strategy
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then(response => {
                if (!response || response.status !== 200) return response;

                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, responseToCache));

                return response;
            }).catch(() => {
                if (request.headers.get('Accept').includes('text/html')) {
                    return caches.match(OFFLINE_URL);
                }
            });
        })
    );
});

// Activate: Cleanup
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (![CACHE_NAME, API_CACHE, FONT_CACHE].includes(key)) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
