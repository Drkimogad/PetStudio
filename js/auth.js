// GLOBAL DECLARATIONS- AUTH-INITIALIZATION
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

// ====== Google APIs Initialization ======
function loadGoogleAPIs(callback) {
  const gsiScript = document.createElement('script');
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  gsiScript.async = true;
  gsiScript.defer = true;

gsiScript.onload = () => {
  console.log("✅ GSI client script loaded");
  
  // Initialize Google OAuth client
  window.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com", // Replace with yours!
    scope: "https://www.googleapis.com/auth/drive.file", // Adjust scopes as needed
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        console.log("Google token received");
        // Handle token (e.g., pass to Firebase)
      }
    },
  });
  
  if (typeof callback === "function") callback();
};


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

  // Initialize Firebase if not already initialized
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Return the auth instance directly
  return {
    auth: firebase.auth(),
    provider: new firebase.auth.GoogleAuthProvider()
  };
}

// ====== Auth Listeners ======
function initAuthListeners(authInstance) {
  authInstance.onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Logged in:", user.email);
      showDashboard();
      renderProfiles();
    } else {
      console.log("🚪 Logged out");
      showAuthForm('login');
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

// ====== Form Handlers ======
function setupAuthForms() {
  // Sign Up Handler
  DOM.signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    isSignupInProgress = true;

    const username = DOM.signupForm.querySelector("#signupEmail").value.trim();
    const password = DOM.signupForm.querySelector("#signupPassword").value.trim();
    const email = `${username}@petstudio.com`;

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => auth.signOut())
      .then(() => {
        showAuthForm('login');
        Utils.showErrorToUser("Account created! Please login", true);
        document.getElementById("loginEmail").value = username;
        document.getElementById("loginPassword").value = password;
      })
      .catch((error) => {
        Utils.showErrorToUser(error.message);
      })
      .finally(() => {
        isSignupInProgress = false;
      });
  });

  // Login Handler
  DOM.loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = DOM.loginForm.querySelector("#loginEmail")?.value.trim();
    const password = DOM.loginForm.querySelector("#loginPassword")?.value.trim();
    const email = `${username}@petstudio.com`;

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const submitBtn = DOM.loginForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        showDashboard();
        renderProfiles();
      })
      .catch((error) => {
        let msg = "Login failed: ";
        if (error.code === "auth/wrong-password") msg += "Wrong password";
        else if (error.code === "auth/user-not-found") msg += "User not found";
        else msg += error.message;
        alert(msg);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      });
  });
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
  const { auth, provider } = await initializeFirebase();
  initAuthListeners(auth);
  setupGoogleLoginButton(); // Add this line
  showAuthForm('login');
}

// Add Loading States:
function showLoading(state) {
  document.getElementById('loadingIndicator').style.display = 
    state ? 'block' : 'none';
}

// Start initialization when DOM is ready
if (document.readyState === 'complete') {
  initializeAuth();
} else {
  document.addEventListener('DOMContentLoaded', initializeAuth);
}
