// auth-init added
function loadGoogleAPIs() {
  // Load Google API client
  const gapiScript = document.createElement('script');
  gapiScript.src = 'https://apis.google.com/js/api.js';
  gapiScript.integrity = 'sha256-9NW5cOKKXx+MTufd4NoZwYPTk9Of4S2rqLkI4Bw0UwQ=';
  gapiScript.crossOrigin = 'anonymous';

  // Load Google Identity Services
  const gsiScript = document.createElement('script');
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  gsiScript.integrity = 'sha256-+0JEH4h4yMMMF99dG0OZ8j4XlNk9XigLxE7k9wuRj5E=';
  gsiScript.crossOrigin = 'anonymous';

  document.head.append(gapiScript, gsiScript);
}

// DOM Elements
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

// Auth Form Switching
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

(function () {
  let auth = null;
  let provider = null;
  let isSignupInProgress = false;

  window.authModule = {
    initAuthListeners,
    setupGoogleLoginButton,
    initializeFirebase,
    refreshDriveTokenIfNeeded,
    setupLogoutButton
  };

  // Firebase auth state changes
  function initAuthListeners() {
    auth.onAuthStateChanged((user) => {
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

  // Google OAuth button setup
  function setupGoogleLoginButton() {
    const existingBtn = document.getElementById('googleSignInBtn');
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement("button");
    btn.id = "googleSignInBtn";
    btn.className = "auth-btn google-btn";
    btn.innerHTML = `
      <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
      Continue with Google
    `;
    DOM.authContainer.appendChild(btn);
    btn.addEventListener("click", () => {
      if (window.tokenClient) {
        window.tokenClient.requestAccessToken();
      } else {
        utils.showErrorToUser("Google Identity not ready. Please reload.");
      }
    });
  }

  // Firebase initialization
  async function initializeFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
      authDomain: "swiftreach2025.firebaseapp.com",
      projectId: "swiftreach2025",
      storageBucket: "swiftreach2025.appspot.com",
      messagingSenderId: "540185558422",
      appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
    };
    const app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth(app);
    provider = new firebase.auth.GoogleAuthProvider();
    window.auth = auth;
    window.provider = provider;
    return { app, auth };
  }

  // Refresh Google Drive token
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
      utils.showErrorToUser('Session expired - please re-login');
    }
  }

// 🔼 Sign Up Handler🌟🌟🌟
DOM.signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  isSignupInProgress = true;

  const username = DOM.signupForm.querySelector("#signupEmail").value.trim();
  const password = DOM.signupForm.querySelector("#signupPassword").value.trim();
  const email = `${username}@petstudio.com`;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      // Force logout after signup
      return auth.signOut();
    })
    .then(() => {
      // Redirect to login with success message
      showAuthForm('login');
      showErrorToUser("Account created! Please login", true);
      // Pre-fill login form
      document.getElementById("loginEmail").value = username;
      document.getElementById("loginPassword").value = password;
    })
    .catch((error) => {
      showAuthError(error.message);
    })
    .finally(() => {
      isSignupInProgress = false;
    });
});

  
// 🔼 Login Handler 🌟🌟🌟
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
  .then((userCredential) => {  // ✅ ADD THIS .then() BLOCK
    // FORCE UI UPDATE FOR EDGE CASES WHERE AUTH LISTENER IS DELAYED
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

  
  // Logout handler
  function setupLogoutButton() {
    DOM.logoutBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await auth.signOut();
        window.location.href = '/PetStudio/'; // Redirect to login/home
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }

})();
