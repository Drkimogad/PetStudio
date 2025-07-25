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
// DOM Elements - Initialize as null first
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
  const domReady = initDOMReferences();
  if (!domReady) return;
// Initialize login button and other startup logic
  if (typeof setupGoogleLoginButton === "function") {
    setupGoogleLoginButton();
  } else {
    console.warn("⚠️ setupGoogleLoginButton() not found.");
  }
  // If needed, add more initializations here
});
// ====== Core Functions ======
function showDashboard() {
  console.log("🚪 Entered showDashboard()");
let profiles = window.petProfiles || JSON.parse(localStorage.getItem('petProfiles')) || [];
window.petProfiles = profiles;

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
  // Wrap renderprofiles() in a guard
if (typeof loadSavedProfiles === "function" && window.petProfiles?.length > 0) {
  loadSavedProfiles();
} else {
  console.log("ℹ️ No renderProfiles available or no profiles to show.");
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
  if (!firebase.apps.length) {
  console.warn("⏳ Firebase not initialized yet. Retrying...");
  setTimeout(setupGoogleLoginButton, 300);
  return;
}

  const CLIENT_ID = '480425185692-i5d0f4gi96t2ap41frgfr2dlpjpvp278.apps.googleusercontent.com';
  try {
    // Initialize Google Identity Services
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          showLoading(true);
          // Using v9 compat syntax
          const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
          await firebase.auth().signInWithCredential(credential);
         // showDashboard();  // old ✅ No need to manually call showDashboard here!
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
      
  // ✅ Avoid popup if already signed in
    if (!firebase.auth().currentUser) {
      google.accounts.id.prompt();
   } 
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

        const fetchedProfiles = snapshot.docs.map(doc => ({
        docId: doc.id,  // ← Critical: Include document ID
        ...doc.data()
      }));

        // ✅ Update both global state and storage
        window.petProfiles = fetchedProfiles;
        localStorage.setItem("petProfiles", JSON.stringify(fetchedProfiles));
        console.log("📥 Synced petProfiles from Firestore:", fetchedProfiles);
        
        // ✅ Wait for dashboard to be defined before calling
        if (typeof showDashboard === 'function') {
          console.log("📺 Calling showDashboard()");
          showDashboard();
        
      // ✅ Show logout button safely right after dashboard is shown
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
      }
      if (logoutBtn) logoutBtn.style.display = "block";
      } else {
          console.warn("⚠️ showDashboard is not yet defined. Skipping call.");
        }  
        
      } catch (error) {
        console.error("❌ Failed to fetch profiles:", error);
        if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
          Utils.showErrorToUser("Couldn't load your pet profiles.");
        }
      }

    } else {
      console.log("ℹ️ No user is signed in.");

      if (DOM.authContainer) DOM.authContainer.classList.remove('hidden');
      if (DOM.dashboard) DOM.dashboard.classList.add('hidden');

      // Clear profile cache and UI
      window.petProfiles = [];
      localStorage.removeItem('petProfiles');
      if (DOM.petList) DOM.petList.innerHTML = "";

      // Re-render sign-in button if needed
      if (typeof setupGoogleLoginButton === 'function') {
        setupGoogleLoginButton();
      }
    }
  }, error => {
    console.error("❌ Auth listener error:", error);
  });
}
//===============================
// Single logout handler function
//================================
async function handleLogout() {
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
   if (window.google && google.accounts && google.accounts.id) {
  google.accounts.id.disableAutoSelect(); // ✅ Clear previous Google session
  } 
    localStorage.removeItem('petProfiles');
    window.location.reload();
    
  } catch (error) {
    console.error("Logout failed:", error);
    // Use existing error display method if available
    if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
      Utils.showErrorToUser("Logout failed. Please try again.");
    } else {
      alert("Logout failed. Please try again.");
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
    console.log("✅ Auth object received:", auth);
    console.log("Type of onAuthStateChanged:", typeof auth.onAuthStateChanged);

    // ✅ Set persistence before attaching listener
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log("🔐 Firebase auth persistence set to LOCAL");
    
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
