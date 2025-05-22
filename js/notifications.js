//🌟 Push Notifications 🌟
const VAPID_PUBLIC_KEY = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk';
const VERCEL_API = 'https://pet-studio.vercel.app/api/save-subscription';

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/PetStudio/service-worker.js', {
      scope: '/PetStudio/'
    }).then(registration => {
      console.log('SW registered for scope:', registration.scope);
    }).catch(error => {
      console.error('SW registration failed:', error);
    });
  });
}

// Subscribe to push notifications
async function subscribeUserToPushNotifications(registration) {
  try {
    const existingSubscription = await registration.pushManager.getSubscription();
    if(existingSubscription) {
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

// Send subscription to server
async function sendSubscriptionToServer(subscription) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }
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

// VAPID key conversion
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
