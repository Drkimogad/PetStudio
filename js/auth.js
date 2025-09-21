// GLOBAL DECLARATIONS - AUTH-INITIALIZATION
//===================================
      // UNIFIED LOADER LOGIC
//========================================
function showLoader(show, messageType = "loading", customMessage = "") {
  const loader = document.getElementById("processing-loader");
  const lottie = document.getElementById("loader-animation");
  const cssSpinner = document.getElementById("css-spinner-fallback");
  
  // 🔧 DEBUG: Log every call to showLoader
  console.log(`🔧 showLoader called:`, { 
    show, 
    messageType, 
    customMessage,
    loaderExists: !!loader,
    time: new Date().toISOString() 
  });
  
  if (!loader) {
    console.warn("❌ Loader element not found");
    return;
  }
  
  // Hide all messages first
  document.querySelectorAll('.loader-text').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show specific message
  const messageEl = document.getElementById(`loader-message-${messageType}`) || 
                   document.getElementById('loader-message-loading');
  
  if (messageEl) {
    messageEl.style.display = 'block';
    if (customMessage) messageEl.textContent = customMessage;
    
    // Add color classes for success/error
    messageEl.classList.remove('success', 'error');
    if (messageType === 'success') messageEl.classList.add('success');
    if (messageType === 'error') messageEl.classList.add('error');
  }
  
  if (show) {
    console.log(`🔧 Showing loader with type: ${messageType}`);
        // 🔥 ADD THIS: Prevent body scrolling
    document.body.classList.add('loader-active');
    loader.style.display = 'block';
    
    // Try Lottie first, fallback to CSS
    if (lottie) {
      lottie.style.display = 'block';
      if (cssSpinner) cssSpinner.style.display = 'none';
    } else if (cssSpinner) {
      cssSpinner.style.display = 'block';
    }
    
  } else {
    // 🔥 ADD THIS: Re-enable body scrolling
    document.body.classList.remove('loader-active');
    console.log(`🔧 Hiding loader. Current state:`, {
      loaderDisplay: loader.style.display,
      messageType
    });
    
    // For success/error, show briefly then hide
    if (messageType === 'success' || messageType === 'error') {
      console.log(`⏰ Setting 2-second timeout for ${messageType} message`);
      setTimeout(() => {
        console.log(`🕒 Timeout completed - hiding loader`);
        loader.style.display = 'none';
      }, 2000);
    } else {
      console.log(`🚨 Immediate hide for message type: ${messageType}`);
      loader.style.display = 'none';
    }
  }
}

//======================================================
// Generic helper for offline handling
//========================================
function handleOfflineError(message = "Action requires internet connection") {
  if (typeof showLoader === "function") {
    // Show error message
    showLoader(true, "error", message);

    // Force hide after 2 seconds to prevent stuck Lottie
    setTimeout(() => {
      showLoader(false);
    }, 2000);
  }
}



//==================================
   // Cloudinary logic
//===========================
const CLOUDINARY_CONFIG = {
  cloudName: 'dh7d6otgu',
  uploadPreset: 'petstudio_auto_folder'
};
// 🔶 GLOBAL DECLARATIONS🔶🔶🔶
let auth = null;
let provider = null;
let isSignupInProgress = false;
let googleSignInInitialized = false;

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
// ====== Google Sign-In Initialization ======
async function setupGoogleLoginButton() {
  // Check if Google and Firebase are loaded
  if (googleSignInInitialized || !window.google) {
    console.log("Waiting for libraries to load...");
    setTimeout(setupGoogleLoginButton, 500);
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
      // REPLACE the existing Google Sign-In callback with this improved version:
callback: async (response) => {
  try {
    console.log("🔧 Google Sign-In started");
    
    // 🔥 STRONGER OFFLINE DETECTION - Check multiple indicators
    const isDefinitelyOffline = !navigator.onLine || 
                               !window.firebase || 
                               !window.firebase.auth;
    
    if (isDefinitelyOffline) {
      console.log("📴 Offline detected - preventing sign-in attempt");
      
      // Show immediate error message
      showLoader(true, "error", "Sign-in requires internet connection.");
      
      // Wait briefly so user sees message, then redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      showLoader(false);
      
      // Force redirect to offline.html - use absolute path to ensure reliability
      window.location.href = '/PetStudio/offline.html';
      return; // Stop execution completely
    }
    
    // === ONLINE FLOW ===
    showLoader(true, "loading", "Signing in with Google...");
    
    // Using v9 compat syntax
    const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
    await firebase.auth().signInWithCredential(credential);

    console.log("✅ Google Sign-In successful");
    showLoader(true, "success", "Sign-in successful");
    
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    
    // Handle specific offline errors during sign-in attempt
    if (error.code === 'auth/network-request-failed' || 
        error.message.includes('network') ||
        error.message.includes('offline')) {
      
      showLoader(true, "error", "Network error. Check connection.");
      setTimeout(() => {
        showLoader(false);
        window.location.href = '/PetStudio/offline.html';
      }, 2000);
      
    } else {
      showLoader(true, "error", "Sign-in failed. Please try again.");
      setTimeout(() => showLoader(false), 2000);
    }
  }
  
  console.log("🔧 Google Sign-In callback completed");
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
        shape: "circular",
        width: 250
      });  

        // ✅ Prevent offline sign-in attempts
    googleButtonContainer.addEventListener('click', function(e) {
      if (!navigator.onLine) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.location.href = 'offline.html';
        return false;
      }
    }, true); // capture phase
  }
          
    // ✅ Avoid popup if already signed in
   // if (!firebase.auth().currentUser) {
   //   google.accounts.id.prompt();
  // } 
          
  } catch (error) {
    console.error("Google Sign-In setup failed:", error);
    // === CHANGE 6: Show error if setup fails ===
    showLoader(true, "error", "Sign-in setup failed");
    setTimeout(() => {
      showLoader(false);
    }, 2000);
  }
}

 
// ====== Firebase Integration ======
// ====== Firebase Initialization ======
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAnGNXr6JZHgCcHp5xKtGuIsTGaMRqZ6oM", // for firebase services auth/firestore safe if restricted
    authDomain: "petstudio-c3679.firebaseapp.com",
    projectId: "petstudio-c3679",  // for firestore database
    storageBucket: "petstudio-c3679.appspot.com",
    messagingSenderId: "1031214975391",
    appId: "1:1031214975391:web:35878cabdd540b6fc455aa",
    measurementId: "G-0GK7ZCV5VS"
  };
  // Initialize Firebase if not already done
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
    console.log("✅ Firebase initialized (HTTP functions mode)");

  // ✅ Return the actual Firebase Auth instance
  return firebase.auth(); 
}

// ====== Auth State Listener ======
function initAuthListeners() {
  console.log("👤 Firebase current user:", firebase.auth().currentUser);

  const auth = firebase.auth();

  auth.onAuthStateChanged(async (user) => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (user) {
      console.log("✅ User is signed in:", user);

      // Show logout button safely
      if (logoutBtn) {
        logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        const freshLogoutBtn = document.getElementById("logoutBtn");
        freshLogoutBtn.addEventListener('click', handleLogout);
        freshLogoutBtn.style.display = "block";
      }

      if (!navigator.onLine) {
        console.log("📴 Offline mode: Loading profiles from localStorage");

        const cachedProfiles = localStorage.getItem("petProfiles");
        window.petProfiles = cachedProfiles ? JSON.parse(cachedProfiles) : [];
        if (typeof showDashboard === 'function') showDashboard();

        if (typeof onlineStatus !== 'undefined' && onlineStatus.showTemporaryMessage) {
          onlineStatus.showTemporaryMessage("Offline mode: Using cached data", "offline");
        }

        return; // Stop further online operations
      }

      // ONLINE mode
      try {
        const snapshot = await firebase.firestore()
          .collection("profiles")
          .where("userId", "==", user.uid)
          .get();

        const fetchedProfiles = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));

        window.petProfiles = fetchedProfiles;

        for (const profile of window.petProfiles) {
          prefetchProfileImages(profile); // Cache images for offline use
        }

        localStorage.setItem("petProfiles", JSON.stringify(fetchedProfiles));

        if (typeof showDashboard === 'function') {
          showDashboard();
          showLoader(false); // Hide loader after dashboard is shown
        }
      } catch (error) {
        console.error("❌ Failed to fetch profiles:", error);

        const cachedProfiles = localStorage.getItem("petProfiles");
        window.petProfiles = cachedProfiles ? JSON.parse(cachedProfiles) : [];
        if (typeof showDashboard === 'function') showDashboard();

        if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
          Utils.showErrorToUser("Couldn't load your pet profiles. Using cached data.");
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

      if (logoutBtn) logoutBtn.style.display = "none";

      if (typeof setupGoogleLoginButton === 'function') setupGoogleLoginButton();
    }
  }, error => {
    console.error("❌ Auth listener error:", error);
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.style.display = "none";
  });
}


// ===============================
// SINGLE LOGOUT HANDLER FUNCTION
// ===============================
async function handleLogout() {
  // Show logging out state immediately
  showLoader(true, "loading", "Logging out...");

  try {
    if (navigator.onLine) {
      // ✅ ONLINE LOGOUT FLOW remains unchanged
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
      }
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    }

    // COMMON CLEANUP FOR BOTH ONLINE & OFFLINE
    // Clear all local caches
    localStorage.removeItem('petProfiles');
    window.petProfiles = [];
    if (window._cachedImages) window._cachedImages = {}; // gallery cache for collage
    // Add any other offline caches if needed

    // Show success feedback
    showLoader(true, "success", "Logged out successfully!");
    setTimeout(() => {
      showLoader(false);

      // Show auth page & hide dashboard
      if (DOM.authContainer) DOM.authContainer.classList.remove('hidden');
      if (DOM.dashboard) DOM.dashboard.classList.add('hidden');
      
      // Hide logout button
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) logoutBtn.style.display = "none";

    }, 2000);

  } catch (error) {
    console.error("Logout failed:", error);

    // ONLINE errors only: show error message
    showLoader(true, "error", "Logout failed. Please try again.");
    setTimeout(() => showLoader(false), 2000);
  }
}


//==================
// Online/Offline detection and status indicator
//=================
let isOnline = navigator.onLine;
const onlineStatus = {
  element: null,
  
  init() {
    this.createStatusIndicator();
    this.bindEvents();
    this.updateStatus();
  },
  
  createStatusIndicator() {
    // Create status element
    this.element = document.createElement('div');
    this.element.id = 'online-status';
    this.element.style.position = 'fixed';
    this.element.style.top = '10px';
    this.element.style.right = '10px';
    this.element.style.padding = '8px 12px';
    this.element.style.borderRadius = '20px';
    this.element.style.fontSize = '12px';
    this.element.style.fontWeight = 'bold';
    this.element.style.zIndex = '10000';
    this.element.style.transition = 'all 0.3s ease';
    
    // Add to document
    document.body.appendChild(this.element);
    this.updateStatus();
  },
  
  bindEvents() {
    window.addEventListener('online', () => {
      isOnline = true;
      this.updateStatus();
      this.showTemporaryMessage('Connection restored', 'online');
    });
    
    window.addEventListener('offline', () => {
      isOnline = false;
      this.updateStatus();
      this.showTemporaryMessage('You are offline', 'offline');
    });
  },
  
  updateStatus() {
    if (!this.element) return;
    
    if (isOnline) {
      this.element.textContent = '🟢 Online';
      this.element.style.background = '#d4edda';
      this.element.style.color = '#155724';
      this.element.style.border = '1px solid #c3e6cb';
    } else {
      this.element.textContent = '🔴 Offline';
      this.element.style.background = '#f8d7da';
      this.element.style.color = '#721c24';
      this.element.style.border = '1px solid #f5c6cb';
    }
  },
  
  showTemporaryMessage(message, type) {
    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    msgElement.style.position = 'fixed';
    msgElement.style.top = '50px';
    msgElement.style.right = '10px';
    msgElement.style.padding = '10px 15px';
    msgElement.style.borderRadius = '5px';
    msgElement.style.zIndex = '10000';
    msgElement.style.fontWeight = 'bold';
    
    if (type === 'online') {
      msgElement.style.background = '#d4edda';
      msgElement.style.color = '#155724';
      msgElement.style.border = '1px solid #c3e6cb';
    } else {
      msgElement.style.background = '#f8d7da';
      msgElement.style.color = '#721c24';
      msgElement.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(msgElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (msgElement.parentNode) {
        msgElement.parentNode.removeChild(msgElement);
      }
    }, 3000);
  },
  
  checkOnline() {
    return isOnline;
  }
};


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
//==========================
// Network utilities Helper for online offline detection logic.
//==========================
const networkUtils = {
  // Check if online
  isOnline() {
    return onlineStatus.checkOnline();
  },
  
  // Execute function with online check
  requireOnline(callback, errorMessage = 'Internet connection required') {
    if (!this.isOnline()) {
      onlineStatus.showTemporaryMessage(errorMessage, 'offline');
      return false;
    }
    return callback();
  },
  
  // Try to sync local changes when coming online
  async syncWhenOnline() {
    if (this.isOnline()) {
      console.log('Online - checking for pending changes...');
      // We'll implement this after the onAuthStateChanged part
    }
  }
};

// Start initialization when everything is ready
document.addEventListener('DOMContentLoaded', function() {
  // Additional check for Firebase
  if (typeof firebase === 'undefined') {
    console.error("Firebase not loaded yet");
    // You might want to add retry logic here
  }
  initializeAuth();
  onlineStatus.init();
});
