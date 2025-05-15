// GLOBAL DECLARATIONS- AUTH-INITIALIZATION
// 🔶 GLOBAL DECLARATIONS🔶🔶🔶
let auth = null;
let provider = null;
let currentQRProfile = null;
let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
let isEditing = false;
let currentEditIndex = null;

// 🔶 State Management🔶🔶🔶
const VALID_ORIGINS = [
  'https://drkimogad.github.io',
  'https://drkimogad.github.io/PetStudio'
];
// Runtime origin check
if (!VALID_ORIGINS.includes(window.location.origin)) {
  window.location.href = 'https://drkimogad.github.io/PetStudio';
}

// HELPER FUNCTION DISABLE UI (MOVE TO TOP)    
function disableUI() {
   document.body.innerHTML = `
    <h1 style="color: red; padding: 2rem; text-align: center">
      Critical Error: Failed to load application interface
    </h1>
  `;
}

// ====== DOM Elements ======
const DOM = {
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  addPetProfileBtn: document.getElementById("addPetProfileBtn"),
  profileSection: document.getElementById("profileSection"),
  petList: document.getElementById("petList"),
  fullPageBanner: document.getElementById("fullPageBanner"),
  profileForm: document.getElementById("profileForm")
};

// ====== Core Functions ======
// i removed function showAuth and I think we may need something for show auth via Google sign-in or Dropbox sign-in 
function showDashboard() {
  DOM.authContainer.classList.add('hidden');
  DOM.dashboard.classList.remove('hidden');
  DOM.addPetProfileBtn.classList.remove('hidden');
  DOM.fullPageBanner.classList.remove('hidden');
  DOM.profileSection.classList.add('hidden');
  
  if(petProfiles.length > 0) {
    DOM.petList.classList.remove('hidden');
    renderProfiles();
  }
}

// ====== Firebase Integration ======
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  return {
    auth: firebase.auth(),
    provider: new firebase.auth.GoogleAuthProvider()
  };
}

// Function to authenticate Dropbox and obtain access token
function authenticateDropbox() {
  const redirectUri = 'https://drkimogad.github.io/PetStudio/';  // Make sure to configure in Dropbox console
  const clientId = 'nq7ltevxbxaeped';

  const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}`;
  window.location.href = authUrl;
}

// ====== Auth Listeners ======
function initAuthListeners(authInstance) {
  authInstance.onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Firebase user detected (used for push notifications only):", user.email);
    } else {
      console.log("ℹ️ No Firebase user (not required for Dropbox auth).");
    }
  });
}


// ====== Google Login Button ======
function setupGoogleLoginButton() {
  const existingBtn = document.getElementById('googleSignInBtn');
  if (existingBtn) existingBtn.remove();

  // Use Google's official button renderer
  google.accounts.id.renderButton(
    document.getElementById("authContainer"), // Target container
    { 
      type: "standard",
      theme: "filled_blue",
      size: "large",
      text: "continue_with",
      shape: "rectangular"
    }
  );
}

// ====== Token Management ======
async function refreshDriveTokenIfNeeded() {
  try {
    if (!auth?.currentUser) throw new Error("No authenticated user");

    const authResponse = await auth.currentUser.getIdTokenResult();
    const expiration = new Date(authResponse.expirationTime);

    if (expiration <= new Date()) {
      console.log("Token expired, requesting re-authentication");
      await signInWithRedirect(auth, provider);
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    Utils.showErrorToUser('Session expired - please re-login');
  }
}

// ====== Logout Handler ======
function setupLogoutButton() {
  DOM.logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await auth.signOut();
      delete window._tempAuth; // Clean up
      window.location.href = '/PetStudio/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });
}

// ====== Initialization ======
async function initializeAuth() {
  try {
    // 1. First load Firebase (since it's essential)
    const { auth, provider } = await initializeFirebase();
    
    // 2. Set up auth listeners early
    initAuthListeners(auth);
    
    // 3. Load Google APIs in parallel
    await new Promise((resolve) => {
      loadGoogleAPIs(resolve);
      setTimeout(resolve, 3000); // Fallback timeout
    });
    
    // 4. Set up UI
    showAuthForm();
    setupGoogleLoginButton();
    
    return { auth, provider };
  } catch (error) {
    console.error("Initialization failed:", error);
    disableUI();
  }
}

// Add Loading States:
function showLoading(state) {
  const loader = document.getElementById('loadingIndicator');
  if (loader) {
    loader.style.display = state ? 'block' : 'none';
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'complete') {
  initializeAuth();
} else {
  document.addEventListener('DOMContentLoaded', initializeAuth);
}
