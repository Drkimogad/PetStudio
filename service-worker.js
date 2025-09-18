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
  '.',
  'index.html',
  'offline.html',
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
  'js/lib/firebase-functions-compat.js',
  'js/libs/cloudinary-core-shrinkwrap.min.js',
  'js/libs/lottie-player.js',
  'js/libs/html2canvas.min.js',
  'js/libs/qrcode.min.js',
  
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

// ======== INSTALL ========
self.addEventListener('install', (event) => {
  self.skipWaiting();

// Inside your 'install' event
event.waitUntil(
  (async () => {
    // 1️⃣ Cache local assets
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache.map(url => new Request(url, { mode: 'same-origin' })));

    // 2️⃣ Cache external libraries safely
    const externalCache = await caches.open(OFFLINE_CACHE);
    const externalLibs = [
      'https://apis.google.com/js/api.js',
      // Add other external libraries here
    ];

    for (const url of externalLibs) {
      try {
        await externalCache.add(new Request(url, { mode: 'no-cors', credentials: 'omit' }));
      } catch (err) {
        console.warn(`⚠️ Could not cache external library: ${url}`, err);
      }
    }

    console.log('✅ Installation completed with local + external libraries');
  })().catch(err => console.error('❌ Installation failed:', err))
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

//========================================================================================================================
//INITIALIZE FIREBASE AFTER ALL LIBRARIES HAVE BEEN CACHED AND SW INSTALLATION COMPLETED OTHERWISE IT WILL GET STUCK
//========================================================================================================================
importScripts('./js/lib/firebase-app-compat.js');
importScripts('./js/lib/firebase-firestore-compat.js');
// Initialize Firebase in Service Worker
  const firebaseConfig = {
    apiKey: "AIzaSyAnGNXr6JZHgCcHp5xKtGuIsTGaMRqZ6oM", // for firebase services auth/firestore safe if restricted
    authDomain: "petstudio-c3679.firebaseapp.com",
    projectId: "petstudio-c3679",  // for firestore database
    storageBucket: "petstudio-c3679.appspot.com",
    messagingSenderId: "1031214975391",
    appId: "1:1031214975391:web:35878cabdd540b6fc455aa",
    measurementId: "G-0GK7ZCV5VS"
  };

// Initialize Firebase
// Wait a moment for files to load, then initialize
setTimeout(() => {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized in Service Worker');
  } else if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase already available in Service Worker');
  } else {
    console.warn('⚠️ Firebase not loaded in Service Worker');
  }
}, 100);





// ======== FETCH HANDLER ========
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET and browser extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

// Navigation requests (pages)
if (request.mode === 'navigate') {
  event.respondWith(
    (async () => {
      try {
        // ✅ ALWAYS TRY NETWORK FIRST
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (err) {
        // ✅ NETWORK FAILED - CHECK IF OFFLINE
        if (!navigator.onLine) {
          // ✅ TRULY OFFLINE - SERVE OFFLINE.HTML
          return await caches.match('offline.html');
        } else {
          // ✅ ONLINE BUT NETWORK FAILED - SERVE INDEX.HTML
          return await caches.match('index.html');
        }
      }
    })()
  );
  return;
}

  // Firestore API offline response
// For external CDN libs (stale-while-revalidate)
if (url.origin.includes('googleapis.com') || url.href.includes('apis.google.com/js/api.js')) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);

      // 1️⃣ Check if cached
      const cachedResponse = await cache.match(request);
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            cache.put(request, response.clone()); // 2️⃣ Update cache silently
          }
          return response;
        })
        .catch(() => null);

      // 3️⃣ Serve cached first, fallback to network if not cached
      return cachedResponse || (await networkFetch) || Response.error();
    })()
  );
  return;
}


  // Static assets: cache first
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        if (request.destination === 'image') {
          return await caches.match('icons/icon-192x192.png') || Response.error();
        }
        return Response.error();
      }
    })()
  );
});

// ======== ACTIVATE & CLEANUP ========
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => (key !== CACHE_NAME) ? caches.delete(key) : null)
      );
      self.clients.claim();
      console.log('✅ Service worker activated and old caches removed.');
    })()
  );
});


// ======== UPDATE NOTIFICATION ========
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('controllerchange', () => {
  // Notify all clients about the update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage('updateAvailable'));
  });
});


