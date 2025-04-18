// service-worker.js
const VERSION = '2.0.0';
const CACHE_NAMES = {
  core: `PetStudio-core-v${VERSION}`,
  api: `PetStudio-api-v${VERSION}`,
  fonts: `PetStudio-fonts-v${VERSION}`,
  images: `PetStudio-images-v${VERSION}`
};

const OFFLINE_URL = '/PetStudio/offline.html';
const FALLBACK_IMAGE = '/PetStudio/images/fallback.png';

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
  OFFLINE_URL,
  FALLBACK_IMAGE
];

const FONT_SOURCES = [
  'https://fonts.gstatic.com',
  'https://use.typekit.net'
];

const API_ENDPOINTS = [
  '/PetStudio/api/'
];

// Installation: Precaching Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.core)
      .then(cache => {
        console.log(`[SW] Caching ${CORE_ASSETS.length} core assets`);
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Core assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
        throw error;
      })
  );
});

// Activation: Cleanup and Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => !Object.values(CACHE_NAMES).includes(key))
          .map(key => {
            console.log(`[SW] Removing old cache: ${key}`);
            return caches.delete(key);
          })
      );
    })
    .then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
    .catch(error => {
      console.error('[SW] Activation failed:', error);
      throw error;
    })
  );
});

// Fetch: Advanced Caching Strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-HTTP(S) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(request)
    );
    return;
  }

  // API Requests (Network First with Timeout)
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // Fonts (Cache First with Network Update)
  if (FONT_SOURCES.includes(url.origin) && request.destination === 'font') {
    event.respondWith(
      handleFontRequest(request)
    );
    return;
  }

  // Images (Cache First with Network Update)
  if (request.destination === 'image') {
    event.respondWith(
      handleImageRequest(request)
    );
    return;
  }

  // Default (Cache First with Network Update)
  event.respondWith(
    handleDefaultRequest(request)
  );
});

// Strategy Handlers
async function handleNavigationRequest(request) {
  try {
    // Network-first with timeout
    const response = await timeout(5000, fetch(request));
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAMES.core);
    const cached = await cache.match(OFFLINE_URL);
    return cached || Response.error();
  }
}

async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAMES.api);
  
  try {
    // Network-first with timeout
    const response = await timeout(3000, fetch(request));
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback to cache
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function handleFontRequest(request) {
  const cache = await caches.open(CACHE_NAMES.fonts);
  const cached = await cache.match(request);
  
  // Update cache in background
  if (!cached) {
    fetchAndCache(request, CACHE_NAMES.fonts);
    return fetch(request);
  }
  
  // Refresh cache
  fetchAndCache(request, CACHE_NAMES.fonts);
  return cached;
}

async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAMES.images);
  const cached = await cache.match(request);
  
  if (cached) {
    // Refresh cache in background
    fetchAndCache(request, CACHE_NAMES.images);
    return cached;
  }
  
  return fetchAndCache(request, CACHE_NAMES.images);
}

async function handleDefaultRequest(request) {
  const cache = await caches.open(CACHE_NAMES.core);
  const cached = await cache.match(request);
  
  if (cached) {
    // Refresh cache in background
    fetchAndCache(request, CACHE_NAMES.core);
    return cached;
  }
  
  return fetchAndCache(request, CACHE_NAMES.core);
}

// Helper Functions
function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, ms);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match(OFFLINE_URL);
    }
    return Response.error();
  }
}

// Lifecycle Management
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
    self.clients.claim().then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ action: 'reload' }));
      });
    });
  }
});
