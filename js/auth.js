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
  dashboard: null
};

// Initialize DOM elements when page loads
// ===== Initialize DOM Elements =====
function initDOMReferences() {
  DOM.authContainer = document.getElementById("authContainer");
  DOM.dashboard = document.getElementById("dashboard");

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
  
  const localProfiles = window.petProfiles || [];
  console.log("🧠 petProfiles length:", localProfiles.length);
  console.log("📦 petProfiles:", localProfiles);

  if (!DOM.authContainer || !DOM.dashboard) {
    console.error("DOM elements not ready in showDashboard");
    return;
  }

  // ✅ Hide login screen, show dashboard
  DOM.authContainer.classList.add('hidden');
  DOM.dashboard.classList.remove('hidden');

  if (DOM.addPetProfileBtn) DOM.addPetProfileBtn.classList.remove('hidden');
  if (DOM.fullPageBanner) DOM.fullPageBanner.classList.remove('hidden');
  if (DOM.profileSection) DOM.profileSection.classList.add('hidden');

  if (localProfiles.length > 0 && DOM.petList) {
    DOM.petList.classList.remove('hidden');
    renderProfiles();  // You already have this
  } else {
    console.log("ℹ️ No profiles to render in showDashboard");
  }
}

// ====== Google Sign-In Initialization ======
function setupGoogleLoginButton() {
  // Check if libraries are ready
  if (typeof google === 'undefined' || !google.accounts || typeof firebase === 'undefined') {
    console.log("⏳ Waiting for Google/Firebase libraries...");
    setTimeout(setupGoogleLoginButton, 300);
    return;
  }

  // Check if the container is in the DOM yet
  const googleButtonContainer = document.getElementById("googleSignInBtn");
  if (!googleButtonContainer) {
    console.warn("❌ googleSignInBtn not found. Retrying...");
    setTimeout(setupGoogleLoginButton, 300);
    return;
  }

  const CLIENT_ID = '480425185692-i5d0f4gi96t2ap41frgfr2dlpjpvp278.apps.googleusercontent.com';

  // Only initialize once
  if (!setupGoogleLoginButton.initialized) {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          showLoading(true);
          const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
          await firebase.auth().signInWithCredential(credential);
          showDashboard();
        } catch (error) {
          console.error("Google Sign-In failed:", error);
          Utils?.showErrorToUser?.("Google Sign-In failed. Please try again.");
        } finally {
          showLoading(false);
        }
      }
    });
    setupGoogleLoginButton.initialized = true;
  }

  // Render the button (only once)
  if (!setupGoogleLoginButton.rendered) {
    google.accounts.id.renderButton(googleButtonContainer, {
      type: "standard",
      theme: "filled_blue",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 250
    });
    setupGoogleLoginButton.rendered = true;
  }

  // Optional One Tap (only if not signed in)
  if (!firebase.auth().currentUser) {
    google.accounts.id.prompt();
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

      window.petProfiles = fetchedProfiles;
      localStorage.setItem("petProfiles", JSON.stringify(fetchedProfiles));

      console.log("📥 Synced petProfiles from Firestore:", fetchedProfiles);

      // ✅ Now show the dashboard
      showDashboard();

    } catch (error) {
      console.error("❌ Failed to fetch profiles:", error);
      Utils?.showErrorToUser("Couldn't load your pet profiles.");

      // 🔁 Fallback from localStorage if fetch failed
      const fallbackProfiles = JSON.parse(localStorage.getItem("petProfiles")) || [];
      if (fallbackProfiles.length > 0) {
        console.log("🪂 Falling back to localStorage profiles");
        window.petProfiles = fallbackProfiles;
        showDashboard();  // show what we have
      }
    }

  } else {
    console.log("ℹ️ No user is signed in.");
    if (DOM.authContainer) DOM.authContainer.classList.remove('hidden');
    if (DOM.dashboard) DOM.dashboard.classList.add('hidden');
    setupGoogleLoginButton?.();
  }
});

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
document.addEventListener("DOMContentLoaded", () => {
  const domReady = initDOMReferences();
  if (!domReady) return;

  initializeAuth(); // ✅ Sets up Firebase & Auth listener
  setupGoogleLoginButton(); // 👈 Make sure this is still here
});
