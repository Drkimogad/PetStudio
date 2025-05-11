// auth.js
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
