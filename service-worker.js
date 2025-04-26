self.addEventListener('install', () => {
  self.skipWaiting(); // Force immediate activation
});

const VERSION = '4.0.0';
const CACHE = {
  CORE: `PetStudio-core-v${VERSION}`,
  API:  `PetStudio-api-v${VERSION}`,
  FONTS:`PetStudio-fonts-v${VERSION}`,
  IMAGES:`PetStudio-images-v${VERSION}`
};

const OFFLINE_URL    = '/PetStudio/offline.html';
const FALLBACK_IMAGE = '/PetStudio/banner/image.png';

const CORE_ASSETS = [
  '/PetStudio/',
  '/PetStudio/index.html',
  '/PetStudio/styles.css',
  '/PetStudio/script.js',
  '/PetStudio/manifest.json',
  '/PetStudio/icons/icon-192x192.png',
  '/PetStudio/icons/icon-512x512.png',
  '/PetStudio/banner/image.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js',
  'https://accounts.google.com/gsi/client',
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
      .then(cache => cache.addAll(CORE_ASSETS))
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

// Fetch handler: route requests through our strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for critical auth paths
  if (NO_CACHE_PATHS.some(rx => rx.test(url.pathname))) {
    return event.respondWith(fetch(request));
  }

  // Navigation: network-first with offline fallback
  if (request.mode === 'navigate') {
    return event.respondWith(
      networkFirst(request, CACHE.CORE, 5000, OFFLINE_URL)
    );
  }

  // Dynamic API or data requests
  if (DYNAMIC_PATHS.some(rx => rx.test(url.pathname))) {
    return event.respondWith(
      networkFirst(request, CACHE.API, 3000)
    );
  }

  // Font requests: cache-first with background update
  if (FONT_SOURCES.includes(url.origin) && request.destination === 'font') {
    return event.respondWith(
      cacheFirst(request, CACHE.FONTS)
    );
  }

  // Image requests: cache-first with fallback image
  if (request.destination === 'image') {
    return event.respondWith(
      cacheFirst(request, CACHE.IMAGES, FALLBACK_IMAGE)
    );
  }

  // Default: cache-first for core assets
  event.respondWith(
    cacheFirst(request, CACHE.CORE)
  );
});

// Network-first strategy with optional timeout and offline fallback
async function networkFirst(request, cacheName, timeoutMs = 3000, fallbackUrl) {
  try {
    const response = await timeout(timeoutMs, fetch(request));
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request) || (fallbackUrl && cache.match(fallbackUrl));
    return cached || Response.error();
  }
}

// Cache-first strategy with optional fallback
async function cacheFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Update in background
    fetchAndCache(request, cacheName);
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response not ok');
  } catch (err) {
    return fallbackUrl ? caches.match(fallbackUrl) : Response.error();
  }
}

// Helper: promise timeout
function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

// Helper: fetch and cache without blocking response
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  } catch (err) {
    // silent failure
  }
}

// Listen for skipWaiting message to activate new SW immediately
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
    self.clients.claim();
  }
});
