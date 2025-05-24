// GLOBAL DECLARATIONS - AUTH-INITIALIZATION
const CLOUDINARY_CONFIG = {
  cloudName: 'dh7d6otgu',
  uploadPreset: 'PetStudio'
};

// 🔶 GLOBAL DECLARATIONS🔶🔶🔶
let auth = null;
let provider = null;
let isSignupInProgress = false;
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

// HELPER FUNCTION DISABLE UI    
function disableUI() {
  document.body.innerHTML = `
    <h1 style="color: red; padding: 2rem; text-align: center">
      Critical Error: Failed to load application interface
    </h1>
  `;
}

// DOM Elements - Initialize as null first
const DOM = {
  authContainer: null,
  signupPage: null,
  loginPage: null,
  dashboard: null,
  logoutBtn: null,
  signupForm: null,
  loginForm: null,
  switchToLogin: null,
  switchToSignup: null,
  addPetProfileBtn: null,
  profileSection: null,
  petList: null,
  fullPageBanner: null,
  profileForm: null
};

// Initialize DOM elements when page loads
function initDOMReferences() {
  DOM.authContainer = document.getElementById("authContainer");
  DOM.signupPage = document.getElementById("signupPage");
  DOM.loginPage = document.getElementById("loginPage");
  DOM.dashboard = document.getElementById("dashboard");
  DOM.logoutBtn = document.getElementById("logoutBtn");
  DOM.signupForm = document.getElementById("signupForm");
  DOM.loginForm = document.getElementById("loginForm");
  DOM.switchToLogin = document.getElementById("switchToLogin");
  DOM.switchToSignup = document.getElementById("switchToSignup");
  DOM.addPetProfileBtn = document.getElementById("addPetProfileBtn");
  DOM.profileSection = document.getElementById("profileSection");
  DOM.petList = document.getElementById("petList");
  DOM.fullPageBanner = document.getElementById("fullPageBanner");
  DOM.profileForm = document.getElementById("profileForm");
  
  // Verify critical elements exist
  if (!DOM.authContainer || !DOM.loginPage || !DOM.signupPage) {
    console.error("Critical auth elements missing!");
    disableUI();
    return false;
  }
  return true;
}

// ====== Core Functions ======
function showAuthForm(form) {
  if (!DOM.authContainer || !DOM.loginPage || !DOM.signupPage) {
    console.error("DOM elements not ready in showAuthForm");
    return;
  }
  
  DOM.authContainer.classList.remove('hidden');
  DOM.loginPage.classList.toggle('hidden', form !== 'login');
  DOM.signupPage.classList.toggle('hidden', form !== 'signup');
}

function showDashboard() {
  if (!DOM.authContainer || !DOM.dashboard) {
    console.error("DOM elements not ready in showDashboard");
    return;
  }
  
  DOM.authContainer.classList.add('hidden');
  DOM.dashboard.classList.remove('hidden');
  if (DOM.addPetProfileBtn) DOM.addPetProfileBtn.classList.remove('hidden');
  if (DOM.fullPageBanner) DOM.fullPageBanner.classList.remove('hidden');
  if (DOM.profileSection) DOM.profileSection.classList.add('hidden');
  
  if (petProfiles.length > 0 && DOM.petList) {
    DOM.petList.classList.remove('hidden');
    renderProfiles();
  }
}

// ====== Firebase Integration ======
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAnGNXr6JZHgCcHp5xKtGuIsTGaMRqZ6oM",
    authDomain: "petstudio-c3679.firebaseapp.com",
    projectId: "petstudio-c3679",
    storageBucket: "petstudio-c3679.firebasestorage.app",
    messagingSenderId: "1031214975391",
    appId: "1:1031214975391:web:35878cabdd540b6fc455aa",
    measurementId: "G-0GK7ZCV5VS"
  };

  // Initialize Firebase if not already initialized
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  // Return auth instance - using v8 compatibility syntax
  return firebase.auth();
}

// ====== Auth State Listener ======
function initAuthListeners(authInstance) {
  // Using firebase.auth().onAuthStateChanged for v8 syntax
  authInstance.onAuthStateChanged(function(user) {
    if (user) {
      console.log("✅ User signed in:", user.email);
      showDashboard();
      if (typeof renderProfiles === 'function') {
        renderProfiles();
      }
    } else {
      console.log("🚪 User signed out");
      showAuthForm('login');
    }
  });
}
// ====== Google Sign-In Initialization ======
function setupGoogleLoginButton() {
  // First check if Google library is loaded
  if (typeof google === 'undefined' || !google.accounts) {
    console.error("Google Identity Services library not loaded");
    // You might want to retry after a delay
    setTimeout(setupGoogleLoginButton, 500);
    return;
  }

  try {
    // Initialize Google Identity Services
    google.accounts.id.initialize({
      client_id: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com",
      callback: async (response) => {
        // Handle Google Sign-In with Firebase
        try {
          showLoading(true);
          const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
          await auth.signInWithCredential(credential);
          showDashboard();
        } catch (error) {
          console.error("Google Sign-In failed:", error);
          Utils.showErrorToUser("Google Sign-In failed. Please try again.");
        } finally {
          showLoading(false);
        }
      }
    });

    // Only render button if the container exists
    const googleButtonContainer = document.getElementById("googleSignInBtn");
    if (googleButtonContainer) {
      google.accounts.id.renderButton(
        googleButtonContainer,
        { 
          type: "standard",
          theme: "filled_blue",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 250
        }
      );

      // Optional: Add "One Tap" sign-in prompt
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap prompt wasn't shown. Reason:", notification.getNotDisplayedReason());
        }
      });
    } else {
      console.warn("Google Sign-In button container not found");
    }
  } catch (error) {
    console.error("Google Sign-In setup failed:", error);
    if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
      Utils.showErrorToUser("Google Sign-In is currently unavailable");
    }
  }
}
// ====== Core Initialization ======
async function initializeAuth() {
  try {
    // 1. First make sure DOM is ready
    if (!initDOMReferences()) {
      throw new Error("Critical DOM elements missing");
    }
    
    // 2. Wait for Firebase to load
    if (typeof firebase === 'undefined') {
      await new Promise(resolve => {
        const checkFirebase = setInterval(() => {
          if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            resolve();
          }
        }, 100);
      });
    }
    
    // 3. Initialize Firebase Auth
    auth = await initializeFirebase();
    
    // 4. Set up auth state listener
    initAuthListeners(auth);
    
    // 5. Set up Google Sign-In button (if exists)
    if (document.getElementById("googleSignInBtn")) {
      setupGoogleLoginButton();
    }
    
    // 6. Set initial view
    showAuthForm('login');
    
  } catch (error) {
    console.error("Auth initialization failed:", error);
    disableUI();
  }
}

// Start initialization when everything is ready
document.addEventListener('DOMContentLoaded', function() {
  // Additional check for Firebase
  if (typeof firebase === 'undefined') {
    console.error("Firebase not loaded yet");
    // You might want to add retry logic here
  }
  initializeAuth();
});
