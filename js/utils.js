//🌟 Main Application-Initialization-UTILs 🌟
// ================= UTILITY FUNCTIONS =================
// 🔶 Add this HELPER FUNCTION anywhere in your utilities section
//🌟 Improve uploadToCloudinary()
async function uploadToCloudinary(file) {
    // 1. VALIDATE FILE TYPE (Client-side)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG/PNG/WEBP images allowed!');
  }

  // 2. VALIDATE FILE SIZE (10MB)
  const maxSizeMB = 10;
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large! Max ${maxSizeMB}MB allowed`);
  }    
  // Proceed with upload if validations pass
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'pet-images'); // Add folder organization

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`,
      { 
        method: 'POST', 
        body: formData,
        signal: AbortSignal.timeout(15000) // Add timeout
      }
    );
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
    
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error; // Re-throw for caller handling
  }
}
//🌟 Consider adding for Cloudinary
function getOptimizedImageUrl(url, width = 500) {
  if (!url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_auto/`);
}
// OLD SECTION
const Utils = {
  getCountdown: function(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  },

  getMoodEmoji: function(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  },

  formatFirestoreDate: function(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  calculateAge: function(dobString) {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        years--;
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${years} years, ${months} months`;
    } catch {
      return 'N/A';
    }
  },

  showErrorToUser: function(message, isSuccess = false) {
    try {
      const errorDiv = document.getElementById('error-message');
      if (!errorDiv) {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'error-message';
        newErrorDiv.className = isSuccess ? 'success-message' : 'auth-error';
        newErrorDiv.textContent = message;
        document.querySelector('#authContainer').prepend(newErrorDiv);
      } else {
        errorDiv.textContent = message;
        errorDiv.className = isSuccess ? 'success-message' : 'auth-error';
      }
    } catch (fallbackError) {
      alert(message);
    }
  },

  disableUI: function() {
    document.body.innerHTML = `
      <h1 style="color: red; padding: 2rem; text-align: center">
        Critical Error: Failed to load application interface
      </h1>
    `;
  }
};

// added recently
function showAuthForm() {
  document.getElementById('auth-container').classList.remove('hidden');
}

function showUserInfo(user) {
  document.getElementById('userEmail').textContent = user.email;
}

// Initialize app
async function initApp() {
  document.body.classList.add('loading');
  try {
    await loadEssentialScripts();          // still loads GAPI
    initQRModal();
    
    // Initialize Firebase and get auth instance
    const { auth } = await initializeFirebase();
    window._tempAuth = auth;
    
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    
    // 🔄 Replace main() with refactored logic:
    await new Promise((resolve) => {
      loadGoogleAPIs(() => {
        setupGoogleLoginButton(auth);      // Moved here ✅
        resolve();
      });
    });

    initAuthListeners(auth);
    setupAuthForms(auth);
    setupLogoutButton(auth);
    initUI();
  } catch (error) {
    console.error("Initialization failed:", error);
    Utils.showErrorToUser("Failed to initialize authentication");
    Utils.disableUI();
  } finally {
    document.body.classList.remove('loading');
    delete window._tempAuth;
  }
}

// Load essential scripts
async function loadEssentialScripts() {
  await loadGAPI();    // Keep this to ensure gapi.client is available
  setupLogoutButton(); // Run early setup
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.firebase?.auth && window.gapi?.client) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
}

// Load GAPI
function loadGAPI() {
  return new Promise((resolve) => {
    if (window.gapi) return resolve();    
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// Initialize Firebase
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAnGNXr6JZHgCcHp5xKtGuIsTGaMRqZ6oM",
    authDomain: "petstudio-c3679.firebaseapp.com",
    projectId: "petstudio-c3679",
    storageBucket: "petstudio-c3679.appspot.com",
    messagingSenderId: "1031214975391",
    appId: "1:1031214975391:web:35878cabdd540b6fc455aa",
    measurementId: "G-0GK7ZCV5VS"
  };

  // Initialize only if not already initialized
  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
  
  return {
    auth: firebase.auth(app),
    provider: new firebase.auth.GoogleAuthProvider()
  };
}

// Initialize UI
function initUI() {
  checkAuthState();
}

// Check auth state
async function checkAuthState() {
  const user = await auth.currentUser;
  if (user) {
    window.location.href = '/main-app';
  }
}
  
// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async function() {
  // Show initial UI state
  if (typeof showAuthForm === 'function') showAuthForm('login');
  DOM.dashboard.classList.add('hidden');
  DOM.fullPageBanner.classList.remove('hidden');
  DOM.profileSection.classList.add('hidden');
  
  // Initialize app
  await initApp();
  
  // Optional: Load profiles after auth is ready
  if (window._tempAuth?.currentUser) {
    renderProfiles();
  }
});

//🌟 Push Notifications 🌟
const VAPID_PUBLIC_KEY = 'BAGIifN8xg_sHYG9Erz6mkP4MLLMXizBUR_TygNE51Jzl-o_ol_f69kzwUnIE74MO-91KYCJqCNl3noru0pf3ME	';
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
