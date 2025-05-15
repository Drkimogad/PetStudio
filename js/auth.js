// 🔶 GLOBAL DECLARATIONS 🔶
let currentUser = null;
let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];

// 🔶 DOM Elements 🔶
const DOM = {
  authContainer: document.getElementById("authContainer"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  googleSignInBtn: document.getElementById("googleSignInBtn"),
  petList: document.getElementById("petList")
};

// 🔶 Google OAuth 2.0 (Direct Implementation) 🔶
function initializeGoogleAuth() {
  // Load Google API script dynamically
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = () => {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
      callback: handleGoogleSignIn
    });

    // Render Google button if element exists
    if (DOM.googleSignInBtn) {
      google.accounts.id.renderButton(DOM.googleSignInBtn, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with'
      });
    }
  };
}

// 🔶 Handle Google Sign-In 🔶
function handleGoogleSignIn(response) {
  const user = parseJwt(response.credential);
  console.log('Google user:', user);
  
  // Store minimal user data in session
  currentUser = {
    id: user.sub,
    name: user.name,
    email: user.email,
    picture: user.picture
  };

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  showDashboard();
}

// 🔶 Parse JWT Token (no libraries needed) 🔶
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

// 🔶 Logout 🔶
function setupLogout() {
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener('click', () => {
      // Clear all auth data
      currentUser = null;
      localStorage.removeItem('currentUser');
      
      // Google's recommended sign-out
      google.accounts.id.disableAutoSelect();
      
      // Reload to reset state
      window.location.reload();
    });
  }
}

// 🔶 UI Control 🔶
function showDashboard() {
  DOM.authContainer?.classList.add('hidden');
  DOM.dashboard?.classList.remove('hidden');
  DOM.logoutBtn?.classList.add('dashboard-visible');
  DOM.logoutBtn?.style.display = 'block'; // 👈 ensure it’s visible
  renderPetProfiles();
}

function showAuthForm() {
  DOM.authContainer?.classList.remove('hidden');
  DOM.dashboard?.classList.add('hidden');
  DOM.logoutBtn?.classList.remove('dashboard-visible');
  DOM.logoutBtn?.style.display = 'none'; // 👈 hide it completely
}

// 🔶 Initialize App 🔶
function initializeApp() {
  // Check existing session
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
  } else {
    showAuthForm();
  }

  initializeGoogleAuth();
  setupLogout();
}

// Start when DOM is ready
if (document.readyState === 'complete') {
  initializeApp();
} else {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
