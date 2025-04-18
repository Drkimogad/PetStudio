const CACHE_NAME = 'PetStudio-cache-v2'; // Increment cache version for updates
const API_CACHE = 'api-cache-v2';
const FONT_CACHE = 'fonts-cache-v2';
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
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
    OFFLINE_URL
];

const FONT_SOURCES = [
    'https://fonts.gstatic.com',
    // Add other font CDN URLs if you use them
];

// Install: Precaching
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Pre-caching core assets');
            return cache.addAll(CORE_ASSETS);
        }).then(() => {
            console.log('[Service Worker] Installation complete!');
            return self.skipWaiting();
        }).catch(error => {
            console.error('[Service Worker] Pre-caching failed:', error);
        })
    );
});

// Activate: Cleanup and claim clients
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== API_CACHE && key !== FONT_CACHE)
                    .map(key => {
                        console.log(`[Service Worker] Deleting old cache: ${key}`);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete!');
            return self.clients.claim();
        })
    );
});

// Fetch: Network with cache fallback and specific handling for APIs and Fonts
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and Vercel analytics
    if (request.method !== 'GET' || url.pathname.includes('_vercel/insights/')) {
        return;
    }

    // Handle HTML navigation requests
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // API caching (Network first, fallback to cache)
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

    // Font caching (Cache first, fallback to network)
    if (FONT_SOURCES.some(source => url.origin.startsWith(source)) && request.destination === 'font') {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then(response => {
                    if (response.ok) {
                        caches.open(FONT_CACHE).then(cache => {
                            cache.put(request, response.clone());
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Default caching strategy (Cache first, fallback to network)
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then(response => {
                if (!response || response.status !== 200) {
                    return response;
                }
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

// Listen for the 'message' event to handle skipWaiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('[Service Worker] Received skipWaiting command');
        self.skipWaiting();
    }
});
