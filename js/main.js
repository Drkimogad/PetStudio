//🌟 Main Application Initialization 🌟
// Start the application
document.addEventListener('DOMContentLoaded', async function() {
  // These functions are now available from auth.js
  showAuthForm('login');
  DOM.dashboard.classList.add('hidden');
  DOM.fullPageBanner.classList.remove('hidden');
  DOM.profileSection.classList.add('hidden');
  
// Main initialization function
async function main() {
  return new Promise((resolve, reject) => {
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = () => resolve();
    gisScript.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(gisScript);
  }).then(() => {
    window.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
      prompt: '',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error("Token error:", tokenResponse);
          return showErrorToUser("Google login failed.");
        }

        window.gapiToken = tokenResponse.access_token;

        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        await gapi.load("client", async () => {
          await gapi.client.init({
            apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
          });
          gapi.client.setToken({ access_token: window.gapiToken });
          renderProfiles();
          setupGoogleLoginButton();
        });
      }
    });
  }).catch((error) => {
    console.error("GIS init failed:", error);
    showErrorToUser("Failed to load Google services");
  });
}

// Initialize app
async function initApp() {
  document.body.classList.add('loading');
  try {
    await loadEssentialScripts();
    initQRModal();
    const firebaseInit = await initializeFirebase();
    auth = firebase.auth(app);
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    initAuthListeners();
    initUI();
  } catch (error) {
    console.error("Initialization failed:", error);
    showErrorToUser("Failed to initialize authentication");
    disableUI();
  } finally {
    document.body.classList.remove('loading');
  }
}

// Load essential scripts
async function loadEssentialScripts() {
  await loadGAPI();
  await main();
  setupLogoutButton();
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if(window.firebase?.auth && window.gapi?.client) {
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
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
  };
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(app);
  return { app, auth };
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

// Start the application
document.addEventListener('DOMContentLoaded', async function() {
  showAuthForm('login');
  DOM.dashboard.classList.add('hidden');
  DOM.fullPageBanner.classList.remove('hidden');
  DOM.profileSection.classList.add('hidden');
  
  initApp();
});
