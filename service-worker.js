// service-worker.js - Optimized Version
const VERSION = '4.2.4';
const CACHE_NAME = `PetStudio-core-v${VERSION}`;

const OFFLINE_URL = '/PetStudio/offline.html';
const FALLBACK_IMAGE = 'banner/image.png';

const CORE_ASSETS = [
  '.',
  '/PetStudio/index.html',
  'js/auth.js',
  'js/utils.js',
  'js/dashboard.js',
  'styles.css',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'favicon.ico',
  'banner/image.png',
  'privacy.html',
  'terms.html',
    
  'static/css/webfonts/fa-brands-400.woff2',
  'static/css/webfonts/fa-solid-900.woff2',
  'static/css/all.min.css',
  
  'js/libs/firebase-app-compat.js',
  'js/libs/firebase-auth-compat.js',
  'js/libs/firebase-firestore-compat.js',
  'js/libs/firebase-functions-compat.js', // Fixed path (libs not lib)
  'js/libs/cloudinary-core-shrinkwrap.min.js',
  'js/libs/lottie-player.js',
  'js/libs/html2canvas.min.js',
  'js/libs/qrcode.min.js',
  
  OFFLINE_URL,
  FALLBACK_IMAGE
];

// Paths that should NOT be cached (auth-related)
const NO_CACHE_PATHS = [
  /\/__\/auth\//,
  /\/identitytoolkit\//,
  /\/token$/,
  /accounts\.google\.com\/gsi\/client/, // Google Sign-In client
  /googleapis\.com/ // Google APIs
];

// ======== INSTALL ========
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ======== ACTIVATE ========
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ======== FETCH HANDLER ========
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and browser extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Skip caching for critical auth paths and Google APIs
  if (NO_CACHE_PATHS.some(rx => rx.test(url.href))) {
    return event.respondWith(fetch(request)); // Network only
  }

  // Navigation requests (pages)
if (request.mode === 'navigate') {
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (err) {
        // Serve OFFLINE.HTML from cache for any navigation error
        const cachedOfflinePage = await caches.match(OFFLINE_URL);
        if (cachedOfflinePage) {
          return cachedOfflinePage;
        }
        // Fallback to index.html if offline.html isn't cached
        const fallbackResponse = await caches.match('/PetStudio/index.html');
        if (fallbackResponse) {
          return fallbackResponse;
        }
        return Response.error();
      }
    })()
  );
  return;
}

  // For all other requests: cache first strategy
  event.respondWith(
    (async () => {
      // First, try to get from cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // If found in cache, return it but update cache in background
        fetch(request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, networkResponse));
            }
          })
          .catch(() => {}); // Silent fail for background update
        return cachedResponse;
      }

      // If not in cache, try network
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          // Cache the successful response
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // If image request fails, return fallback image
        if (request.destination === 'image') {
          return await caches.match(FALLBACK_IMAGE) || Response.error();
        }
        return Response.error();
      }
    })()
  );
});

// ======== MESSAGE HANDLER ========
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});


