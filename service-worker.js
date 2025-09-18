// service-worker.js - Optimized Version
const VERSION = '4.2.1';
const CACHE = {
  CORE: `PetStudio-core-v${VERSION}`,
  API: `PetStudio-api-v${VERSION}`,
  FONTS: `PetStudio-fonts-v${VERSION}`,
  IMAGES: `PetStudio-images-v${VERSION}`
};

const OFFLINE_URL = '/PetStudio/offline.html';
const FALLBACK_IMAGE = '/PetStudio/banner/image.png';

const CORE_ASSETS = [
  '/PetStudio/',
  '/PetStudio/index.html',
  '/PetStudio/styles.css',
  '/PetStudio/js/auth.js',
  '/PetStudio/js/utils.js',
  '/PetStudio/js/dashboard.js',
  
  '/PetStudio/privacy.html',
  '/PetStudio/terms.html',

  '/PetStudio/js/lottie/SnoopyDog.json',

  '/PetStudio/icons/icon-192x192.png',
  '/PetStudio/icons/icon-512x512.png',
  '/PetStudio/favicon.ico',
  
  '/PetStudio/manifest.json',
  
  '/PetStudio/static/css/webfonts/fa-brands-400.woff2',
  '/PetStudio/static/css/webfonts/fa-solid-900.woff2',
  '/PetStudio/static/css/all.min.css',
  
  '/PetStudio/js/libs/firebase-app-compat.js',
  '/PetStudio/js/libs/firebase-auth-compat.js',
  '/PetStudio/js/libs/firebase-firestore-compat.js',
  '/PetStudio/js/libs/cloudinary-core-shrinkwrap.min.js',
  '/PetStudio/js/libs/lottie-player.js',
  '/PetStudio/js/libs/html2canvas.min.js',
  '/PetStudio/js/libs/qrcode.min.js',
  
  OFFLINE_URL,
  FALLBACK_IMAGE
];


const FONT_SOURCES = [
  'https://fonts.gstatic.com',
  'https://use.typekit.net'
];

const DYNAMIC_PATHS = [
  /\/profile\?id=/,
  /\/PetStudio\/api\/.*$/,
  /\.(json|png|jpg)$/
];

const NO_CACHE_PATHS = [
  /\/__\/auth\//,
  /\/identitytoolkit\//,
  /\/token$/
];

// Installation: precache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE.CORE)
      .then(cache => {
        return Promise.all([
          cache.addAll(CORE_ASSETS),
          cache.addAll(EXTERNAL_DEPS.map(url => new Request(url, { cache: 'reload' })))
        ]).catch(err => {
          console.log('Failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activation: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => !Object.values(CACHE).includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler with improved error handling
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip caching for critical auth paths
  if (NO_CACHE_PATHS.some(rx => rx.test(url.pathname))) {
    return event.respondWith(fetch(request));
  }

  // Navigation requests
  if (request.mode === 'navigate') {
    return event.respondWith(
      networkFirstWithOfflineFallback(request)
    );
  }

  // API requests
  if (DYNAMIC_PATHS.some(rx => rx.test(url.pathname))) {
    return event.respondWith(
      staleWhileRevalidate(request, CACHE.API)
    );
  }

  // Font requests
  if (FONT_SOURCES.includes(url.origin) && request.destination === 'font') {
    return event.respondWith(
      cacheFirst(request, CACHE.FONTS)
    );
  }

  // Image requests
  if (request.destination === 'image') {
    return event.respondWith(
      cacheFirstWithFallback(request, CACHE.IMAGES, FALLBACK_IMAGE)
    );
  }

  // Default: cache first for core assets
  event.respondWith(
    cacheFirst(request, CACHE.CORE)
  );
});

// Improved network-first strategy with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE.CORE);
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response not ok');
  } catch (err) {
    const cache = await caches.open(CACHE.CORE);
    const cached = await cache.match(request) || cache.match(OFFLINE_URL);
    return cached || Response.error();
  }
}

// Stale-while-revalidate strategy for API calls
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse ? Promise.any([fetchPromise, Promise.resolve(cachedResponse)]) : fetchPromise;
}

// Cache-first strategy with fallback
async function cacheFirstWithFallback(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    });
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response not ok');
  } catch (err) {
    return fallbackUrl ? caches.match(fallbackUrl) : Response.error();
  }
}

// Basic cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

// Message handler for skipWaiting
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
    self.clients.claim();
  }
});

