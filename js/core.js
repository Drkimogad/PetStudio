import {
  initQRModal,
  handleQRActions,
  shareGeneratedQR,
  showQRStatus,
  sharePetCard,
  currentQRProfile,
  auth, 
  provider
} from './initialization.js';

import { 
  petProfiles,
  isEditing,
  currentEditIndex,
  setupLogoutButton,
  handleGoogleSignIn
} from './auth.js';

import {
  savePetProfile,
  deleteProfile,
  renderProfiles,
  createNewProfile
} from './profilehandling.js';

import {
  getCountdown,
  renderMoodHistory,
  openEditForm,
  printProfile,
  generateQRCode,
  logMood,
  setCoverPhoto
} from './profilefunctions.js';

// Service Worker Registration//
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(registration => {
      handleQRActions();
      setupGalleryHandlers();

      // Add updatefound listener for service worker update process
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            generateQRCode(); // Initialize QR system

            // Clear old cache versions FIRST
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                if (cacheName !== 'pet-studio-cache-v1') {
                  caches.delete(cacheName);
                }
              });
            });
          }
        });
      });

      console.log('Caching Service Worker registered:', registration.scope);
      subscribeUserToPushNotifications(registration);
    })
    .catch(error => console.error('Service Worker registration failed:', error));

  // Controller change listener to reload page on new service worker activation
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New service worker activated, reloading page...');
    location.reload();
  });
}
  // ======================
// Push Notification Logic (Corrected)
// ======================
// ========== CLIENT-SIDE (script.js) ==========
// Global VAPID Configuration
const VAPID_PUBLIC_KEY = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk'; // Keep your original key
const VERCEL_API = 'https://pet-studio.vercel.app/api/save-subscription';

// Push Notification Subscription
async function subscribeUserToPushNotifications(registration) {
  try {
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('Already subscribed:', existingSubscription);
      return sendSubscriptionToServer(existingSubscription);
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    await sendSubscriptionToServer(newSubscription);
    console.log('Push subscription successful:', newSubscription);

  } catch (error) {
    console.error('Subscription failed:', error);
  }
}

// Send to Vercel API
async function sendSubscriptionToServer(subscription) {
  try {
    const user = auth.currentUser;
    const response = await fetch(`${VERCEL_API}/save-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        subscription,
        userId: user.uid,
        vapidPublicKey: VAPID_PUBLIC_KEY
      })
    });

    if (!response.ok) throw new Error('Vercel API rejected subscription');
    console.log('Subscription saved via Vercel API');

  } catch (error) {
    console.error('Subscription sync failed:', error);
    throw error;
  }
}

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
