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
  addPetProfileBtn: null,
  profileSection: null,
  petList: null,
  fullPageBanner: null,
  profileForm: null
};
// Initialize DOM elements when page loads
function initDOMReferences() {
  DOM.authContainer = document.getElementById("authContainer");
  DOM.dashboard = document.getElementById("dashboard");
  DOM.logoutBtn = document.getElementById("logoutBtn");
  DOM.addPetProfileBtn = document.getElementById("addPetProfileBtn");
  DOM.profileSection = document.getElementById("profileSection");
  DOM.petList = document.getElementById("petList");
  DOM.fullPageBanner = document.getElementById("fullPageBanner");
  DOM.profileForm = document.getElementById("profileForm");

  // Minimal check for critical elements still in use
  if (!DOM.authContainer || !DOM.dashboard) {
    console.error("Critical dashboard elements missing!");
    disableUI();
    return false;
  }
  return true;
}
// ====== Core Functions ======
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
// ====== Google Sign-In Initialization ======
function setupGoogleLoginButton() {
  // Check if Google and Firebase are loaded
  if (typeof google === 'undefined' || !google.accounts || typeof firebase === 'undefined') {
    console.log("Waiting for libraries to load...");
    setTimeout(setupGoogleLoginButton, 300);
    return;
  }
  try {
    // Initialize Google Identity Services
    google.accounts.id.initialize({
      client_id: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com",
      callback: async (response) => {
        try {
          showLoading(true);
          // Using v9 compat syntax
          const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
          await firebase.auth().signInWithCredential(credential);
          showDashboard();
        } catch (error) {
          console.error("Google Sign-In failed:", error);
          if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
            Utils.showErrorToUser("Google Sign-In failed. Please try again.");
          }
        } finally {
          showLoading(false);
        }
      }
    });
  // Render button if container exists
    const googleButtonContainer = document.getElementById("googleSignInBtn");
    if (googleButtonContainer) {
      google.accounts.id.renderButton(googleButtonContainer, {
        type: "standard",
        theme: "filled_blue",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 250
      });  
 // Optional: One Tap sign-in
      google.accounts.id.prompt();
    }
  } catch (error) {
    console.error("Google Sign-In setup failed:", error);
  }
}
// ====== Firebase Integration ======
// ====== Firebase Initialization ======
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

  // Initialize Firebase if not already done
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // ✅ Return the actual Firebase Auth instance
  return firebase.auth(); 
}


// ====== Auth State Listener ======
function initAuthListeners(authInstance) {
  // Using v9 compat syntax
  authInstance.onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ User signed in:", user.email);
      showDashboard();
      if (typeof renderProfiles === 'function') {
        renderProfiles();
      }
    } else {
      console.log("🚪 User signed out");
    }
  });
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
    console.log("✅ Auth object received:", auth);
    console.log("Type of onAuthStateChanged:", typeof auth.onAuthStateChanged);

    // 4. Set up auth state listener
    initAuthListeners(auth);  
    // 5. Set up Google Sign-In button (if exists)
    if (document.getElementById("googleSignInBtn")) {
      setupGoogleLoginButton();
    }    
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
