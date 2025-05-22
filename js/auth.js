// GLOBAL DECLARATIONS- AUTH-INITIALIZATION
// 🔶 Add this at the TOP of your global declarations (around line 3)
const CLOUDINARY_CONFIG = {
  cloudName: 'YOUR_CLOUD_NAME',  // ← Replace with yours from Cloudinary dashboard
  uploadPreset: 'petStudio'      // ← Create this in Cloudinary settings
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
// HELPER FUNCTION DISABLE UI (MOVE TO TOP)    
function disableUI() {
   document.body.innerHTML = `
    <h1 style="color: red; padding: 2rem; text-align: center">
      Critical Error: Failed to load application interface
    </h1>
  `;
}

// CONSOLE LOG
console.log("Auth.js loading...");
console.log("DOM elements:", {
  authContainer: document.getElementById("authContainer"),
  signupPage: document.getElementById("signupPage"),
  loginPage: document.getElementById("loginPage"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  signupForm: document.getElementById("signupForm"),
  loginForm: document.getElementById("loginForm"),
  switchToLogin: document.getElementById("switchToLogin"),
  switchToSignup: document.getElementById("switchToSignup"),
  addPetProfileBtn: document.getElementById("addPetProfileBtn"),
  profileSection: document.getElementById("profileSection"),
  petList: document.getElementById("petList"),
  fullPageBanner: document.getElementById("fullPageBanner"),
  profileForm: document.getElementById("profileForm")
});

if (!document.getElementById("authContainer")) {
  console.error("Critical: authContainer element missing!");
}

// ====== DOM Elements ======
const DOM = {
  authContainer: document.getElementById("authContainer"),
  signupPage: document.getElementById("signupPage"),
  loginPage: document.getElementById("loginPage"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  signupForm: document.getElementById("signupForm"),
  loginForm: document.getElementById("loginForm"),
  switchToLogin: document.getElementById("switchToLogin"),
  switchToSignup: document.getElementById("switchToSignup"),
  addPetProfileBtn: document.getElementById("addPetProfileBtn"),
  profileSection: document.getElementById("profileSection"),
  petList: document.getElementById("petList"),
  fullPageBanner: document.getElementById("fullPageBanner"),
  profileForm: document.getElementById("profileForm")
};

// ====== Core Functions ======
function showAuthForm(form) {
  DOM.authContainer.classList.remove('hidden');
  DOM.loginPage.classList.toggle('hidden', form !== 'login');
  DOM.signupPage.classList.toggle('hidden', form !== 'signup');
}

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

// ====== Google Sign-In Initialization ======
function setupGoogleLoginButton() {
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

  // Render the button in the correct container
  google.accounts.id.renderButton(
    document.getElementById("googleSignInBtn"), // Targets the specific button div
    { 
      type: "standard",
      theme: "filled_blue",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 250 // Explicit width to prevent layout shifts
    }
  );

  // Optional: Add "One Tap" sign-in prompt
  google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed()) {
      console.log("One Tap prompt wasn't shown. Reason:", notification.getNotDisplayedReason());
    }
  });
}

// ====== Firebase Integration ======
async function initializeFirebase() {
const firebaseConfig = {
  apiKey: "AIzaSyCbJAQKCsD8CXqm3Q2CtD-qPncm_5MkZmk",
  authDomain: "petstudio-4811d.firebaseapp.com",
  projectId: "petstudio-4811d",
  storageBucket: "petstudio-4811d.firebasestorage.app",
  messagingSenderId: "712319738169",
  appId: "1:712319738169:web:02bcc67f6684d1550c88e8",
  measurementId: "G-LPLXKYKE3P"
};

  // Initialize Firebase if not already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  return firebase.auth(); // Return only auth instance
}

// ====== Auth State Listener ======
function initAuthListeners(authInstance) {
  authInstance.onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ User signed in:", user.email);
      showDashboard();
      renderProfiles();
    } else {
      console.log("🚪 User signed out");
      showAuthForm('login');
    }
  });
}

// ====== Core Initialization ======
async function initializeAuth() {
  try {
    // 1. Initialize Firebase Auth
    auth = await initializeFirebase();
    
    // 2. Set up auth state listener
    initAuthListeners(auth);
    
    // 3. Set up Google Sign-In button (after DOM is ready)
    if (document.getElementById("googleSignInBtn")) {
      setupGoogleLoginButton();
    } else {
      console.error("Google Sign-In button container not found");
    }
    
    // 4. Set up other UI components
    showAuthForm('login');
    setupAuthForms();
    setupLogoutButton();
    
  } catch (error) {
    console.error("Auth initialization failed:", error);
    disableUI();
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'complete') {
  initializeAuth();
} else {
  document.addEventListener('DOMContentLoaded', initializeAuth);
}
