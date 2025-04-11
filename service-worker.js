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
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
    OFFLINE_URL
];

// Install: Precaching
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => 
            Promise.all(
                CORE_ASSETS.map(url => {
                    // Ensure you're only fetching and caching GET requests
                    return fetch(url, { method: 'GET' })
                        .then(res => 
                            res.ok ? cache.put(url, res) : null
                        )
                        .catch(console.warn);
                })
            ).then(() => self.skipWaiting())
        )
    );
});


// service-worker.js (updated)
self.addEventListener('fetch', (event) => {
  // Skip caching for POST requests and Vercel analytics
  if (event.request.method !== 'GET' || 
      event.request.url.includes('_vercel/insights/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) return cachedResponse;

        // Clone request for network fallthrough
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Validate response
          if (!response || response.status !== 200) return response;

          // Clone response for caching
          const responseToCache = response.clone();
          caches.open('pet-studio-cache-v1')
            .then((cache) => cache.put(event.request, responseToCache));

          return response;
        });
      })
  );
});

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
