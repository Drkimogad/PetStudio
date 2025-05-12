//🌟 Main Application-Initialization-UTILs 🌟
// ================= UTILITY FUNCTIONS =================
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
    
    // Initialize Firebase and get auth instance
    const { auth } = await initializeFirebase();  // Modified to return auth directly
    
    // Store auth for other functions (without making it fully global)
    window._tempAuth = auth;
    
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    
    // Initialize auth-dependent components
    initAuthListeners(auth);  // Pass auth as parameter
    setupGoogleLoginButton(auth);
    setupAuthForms(auth);
    setupLogoutButton(auth);
    
    initUI();
  } catch (error) {
    console.error("Initialization failed:", error);
    Utils.showErrorToUser("Failed to initialize authentication");
    Utils.disableUI();
  } finally {
    document.body.classList.remove('loading');
    delete window._tempAuth; // Clean up temporary reference
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
  showAuthForm('login');
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
