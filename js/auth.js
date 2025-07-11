// GLOBAL DECLARATIONS - AUTH-INITIALIZATION
const CLOUDINARY_CONFIG = {
  cloudName: 'dh7d6otgu',
  uploadPreset: 'PetStudio'
};
// 🔶 GLOBAL DECLARATIONS🔶🔶🔶
let auth = null;
let provider = null;
let isSignupInProgress = false;
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
//================================================================
// 🔄Utility function Fixes race conditions where Firebase is slow to initialize
//============================================================
function waitForFirebaseAndGoogle(retries = 20, interval = 200) {
  return new Promise((resolve, reject) => {
    const check = () => {
      const ready = typeof firebase !== 'undefined'
        && typeof firebase.auth === 'function'
        && typeof google !== 'undefined'
        && google.accounts?.id;

      if (ready) {
        resolve();
      } else if (retries === 0) {
        reject(new Error("Timed out waiting for Firebase and Google Sign-In"));
      } else {
        retries--;
        setTimeout(check, interval);
      }
    };
    check();
  });
}
//======================================
// DOM Elements - Initialize as null first
//========================================
const DOM = {
  authContainer: null,
  signupPage: null,
  loginPage: null,
  dashboard: null,
  addPetProfileBtn: null,
  fullPageBanner: null,
  profileSection: null,
  profileForm: null,
  petList: null  // ✅ Add this
};
//=======================================
// Initialize DOM elements when page loads
// ===== Initialize DOM Elements =====
function initDOMReferences() {
  DOM.authContainer = document.getElementById("authContainer");
  DOM.dashboard = document.getElementById("dashboard");
  DOM.addPetProfileBtn = document.getElementById("addPetProfileBtn");
  DOM.fullPageBanner = document.getElementById("fullPageBanner");
  DOM.profileSection = document.getElementById("profileSection");
  DOM.profileForm = document.getElementById("profileForm");

  DOM.petList = document.getElementById("petList"); // ✅ Critical for rendering profiles

  // Ensure critical elements exist
  if (!DOM.authContainer || !DOM.dashboard) {
    console.error("❌ Critical dashboard elements missing!");
    if (typeof disableUI === "function") disableUI();
    return false;
  }
  console.log("✅ DOM references initialized.");
  return true;
}
// show loading function
function showLoading(show) {
  const loader = document.getElementById("processing-loader");
  if (!loader) {
    console.warn("⛔ 'processing-loader' element not found.");
    return;
  }
  if (show) {
    loader.classList.remove("hidden");
    loader.style.display = "block";
  } else {
    loader.classList.add("hidden");
    loader.style.display = "none";
  }
}

// ===== DOM Ready: Initialize Everything =====
document.addEventListener("DOMContentLoaded", () => {
  if (!initDOMReferences()) return;
  initializeAuth(); // ✅ Let the main flow handle Firebase & Sign-In button
});

// ====== Core Functions ======
function showDashboard() {
  console.log("🚪 Entered showDashboard()");
  const profiles = window.petProfiles || [];

  console.log("🧠 petProfiles length:", profiles.length);
  console.log("📦 petProfiles:", profiles);
  
  // ✅   // Show/hide relevant sections
if (!DOM.authContainer || !DOM.dashboard || !DOM.petList) {
  console.error("❌ Critical DOM elements not ready in showDashboard");
  return;
}

  DOM.authContainer.classList.add('hidden');
  DOM.dashboard.classList.remove('hidden');
  console.log("DOM.petList exists?", !!DOM.petList, "Classes:", DOM.petList?.classList?.value);

  if (DOM.addPetProfileBtn) DOM.addPetProfileBtn.classList.remove('hidden');
  if (DOM.fullPageBanner) DOM.fullPageBanner.classList.remove('hidden');
  if (DOM.profileSection) DOM.profileSection.classList.add('hidden');
  if (DOM.petList) DOM.petList.classList.remove('hidden');
  console.log("📦 Dashboard ready. Profiles count:", profiles.length);
  
  // ✅ Diagnostic check for DOM
  console.log("DOM.petList exists?", !!DOM.petList);
}

// ====== Google Sign-In Initialization ======
function setupGoogleLoginButton() {
  // ✅ Prevent duplicate setup
  if (window._googleButtonInitialized) {
    console.log("⏭️ Google button already initialized");
    return;
  }
  window._googleButtonInitialized = true;

  const CLIENT_ID = '480425185692-i5d0f4gi96t2ap41frgfr2dlpjpvp278.apps.googleusercontent.com';

  try {
    // ✅ Initialize Google Identity Services
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          showLoading(true);
          const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
          await firebase.auth().signInWithCredential(credential);
          // No need to manually call showDashboard()
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

    // ✅ Render Google Sign-In button
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

      // ✅ Prompt only if user is not signed in (after Firebase is ready)
      firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          console.log("📣 Prompting Google Sign-In (no user)");
          google.accounts.id.prompt();
        } else {
          console.log("🔒 User already signed in, skipping prompt");
        }
      });
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
function initAuthListeners() {
  console.log("👤 Firebase current user:", firebase.auth().currentUser);

  const auth = firebase.auth();
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("✅ User is signed in:", user);

      try {
        const snapshot = await firebase.firestore()
          .collection("profiles")
          .where("userId", "==", user.uid)
          .get();

        const fetchedProfiles = snapshot.docs.map(doc => doc.data());

        // ✅ Store to live and persistent storage
        window.petProfiles = fetchedProfiles;
        localStorage.setItem("petProfiles", JSON.stringify(fetchedProfiles));

        console.log("📥 Synced petProfiles from Firestore:", fetchedProfiles);

        // ✅ Now that data is ready, render dashboard
        showDashboard();
        renderProfiles();
        
      } catch (error) {
        console.error("❌ Failed to fetch profiles:", error);
        Utils.showErrorToUser("Couldn't load your pet profiles.");
      }

    } else {
      console.log("ℹ️ No user is signed in.");
      if (DOM.authContainer) DOM.authContainer.classList.remove('hidden');
      if (DOM.dashboard) DOM.dashboard.classList.add('hidden');
      if (typeof setupGoogleLoginButton === 'function') {
        setupGoogleLoginButton();
      }
    }
  }, error => {
    console.error("❌ Auth listener error:", error);
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

    // ✅ Set persistence before attaching listener
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log("🔐 Firebase auth persistence set to LOCAL");
    
    // 4. Set up auth state listener
    initAuthListeners(auth);  
    // 5. Set up Google Sign-In button (if exists)
   try {
    await waitForFirebaseAndGoogle();
    setupGoogleLoginButton(); // ✅ Now safe to call  
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
