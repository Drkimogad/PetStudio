// ================================
// SERVICE WORKER - PetStudio
// Version: v4.2.5
// ================================
const CACHE_NAME = 'PetStudio-core-v4.2.6';
const OFFLINE_CACHE = 'PetStudio-offline-v1';
const OFFLINE_URL = '/PetStudio/offline.html';
const FALLBACK_IMAGE = '/PetStudio/banner/image.png';

// Core app assets to cache locally
const CORE_ASSETS = [
  '.', // root
  '/PetStudio/index.html',
  OFFLINE_URL,
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
  'js/libs/firebase-functions-compat.js',
  'js/libs/cloudinary-core-shrinkwrap.min.js',
  'js/libs/lottie-player.js',
  'js/libs/html2canvas.min.js',
  'js/libs/qrcode.min.js'
];

// External libraries to cache safely
const EXTERNAL_LIBS = [
  'https://apis.google.com/js/api.js',
  'https://accounts.google.com/gsi/client'
];

// Paths that should never be cached
const NO_CACHE_PATHS = [
  /\/__\/auth\//,
  /\/identitytoolkit\//,
  /\/token$/,
  /accounts\.google\.com\/gsi\/client/,
  /googleapis\.com/
];

// ================================
// INSTALL
// ================================
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    try {
      // 1️⃣ Cache local assets first
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS.map(url => new Request(url, { mode: 'same-origin' })));

      // 2️⃣ Cache external libraries safely
      const externalCache = await caches.open(OFFLINE_CACHE);
      for (const url of EXTERNAL_LIBS) {
        try {
          await externalCache.add(new Request(url, { mode: 'no-cors', credentials: 'omit' }));
        } catch (err) {
          console.warn(`⚠️ Could not cache external library: ${url}`, err);
        }
      }

      console.log('✅ SW installed: core + external libraries cached');
    } catch (err) {
      console.error('❌ SW installation failed', err);
    }
  })());
});

// ================================
// ACTIVATE
// ================================
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME && key !== OFFLINE_CACHE)
          .map(key => caches.delete(key))
    );
    await self.clients.claim();
    console.log('✅ SW activated and old caches cleared');
  })());
});

// ================================
// FETCH
// ================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Network-only for auth & Google APIs
  if (NO_CACHE_PATHS.some(rx => rx.test(url.href))) {
    return event.respondWith(fetch(request));
  }

  // Navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch (err) {
        // Serve offline.html from cache
        return await caches.match(OFFLINE_URL) || Response.error();
      }
    })());
    return;
  }

  // Other requests: cache-first strategy
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) {
      // Update cache in background
      fetch(request).then(async (networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResp.clone());
        }
      }).catch(() => {});
      return cached;
    }

    try {
      const networkResp = await fetch(request);
      if (networkResp && networkResp.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResp.clone());
      }
      return networkResp;
    } catch (err) {
      if (request.destination === 'image') {
        return await caches.match(FALLBACK_IMAGE) || Response.error();
      }
      return Response.error();
    }
  })());
});

// ================================
// MESSAGE
// ================================
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
