const CACHE_NAME = 'PetStudio-cache-v1';
const urlsToCache = [
    '/',  // Index page
    '/index.html',  // Index HTML page
    '/styles.css',  // CSS file
    '/script.js',  // JS file
    '/service-worker.js',  // Service Worker script
    'https://drkimogad.github.io/PetStudio/manifest.json',  // Absolute URL for manifest.json
    'https://drkimogad.github.io/PetStudio/icons/icon-192x192.png',  // Absolute URL for icon
    'https://drkimogad.github.io/PetStudio/icons/icon-512x512.png',  // Absolute URL for icon
    'https://drkimogad.github.io/PetStudio/favicon.ico',  // Absolute URL for favicon
    '/offline.html'  // Ensure offline.html is added
];

// Install event: Cache necessary assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();  // Forces the new service worker to take control immediately
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opening cache:', CACHE_NAME);
            console.log('Caching assets:', urlsToCache);  // Log assets being cached
            return cache.addAll(urlsToCache).then(() => {
                console.log('Assets successfully cached!');
            }).catch((err) => {
                console.error('Error caching assets:', err);  // Log errors if any
            });
        })
    );
});

// Fetch event: Serve assets from cache or fetch from network if not cached
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);  // Log fetch requests
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse;  // Return cached response if available
            }

            // If not in cache, fetch from network
            return fetch(event.request).catch(() => {
                // If network fails (e.g., offline), show the offline page
                if (event.request.url.endsWith('/') || event.request.url.endsWith('.html')) {
                    return caches.match('/offline.html');  // Return offline page for HTML files
                }
            });
        }).catch((err) => {
            console.error('Error fetching:', err);  // Log any fetch errors
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];  // Only keep the current cache
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);  // Delete old caches
                    }
                })
            );
        })
    );
});
