// 🔶 GLOBAL DECLARATIONS 🔶
let currentUser = null;

// 🔶 DOM Elements 🔶
const DOM = {
  // Auth elements
  authContainer: document.getElementById("authContainer"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  googleSignInBtn: document.getElementById("googleSignInBtn"),

  // Dashboard elements (moved from dashboard.js)
  profileSection: document.getElementById('profileSection'),
  fullPageBanner: document.getElementById('fullPageBanner'),
  petList: document.getElementById('petList'),
  profileForm: document.getElementById('profileForm'),
  petName: document.getElementById('petName'),
  petBreed: document.getElementById('petBreed'),
  petDob: document.getElementById('petDob'),
  petBirthday: document.getElementById('petBirthday'),
  moodHistoryInput: document.getElementById('moodHistoryInput'),
  qrModal: document.getElementById('qr-modal')
};
// Add this right after your DOM declaration (line 19)
if (window.DOM && typeof DOM !== 'undefined') {
  console.warn('DOM already exists! Check other files for duplicate declarations');
}
// 🔶 Initialize Google Auth + Drive API 🔶
async function initializeGoogleAuth() {
  await loadGoogleScript('https://accounts.google.com/gsi/client');
  
  google.accounts.id.initialize({
    client_id: '901433348522-n01acsr56ah7vqql8rqo2c4cp717bqe4.apps.googleusercontent.com',
    callback: handleGoogleSignIn,
    ux_mode: 'redirect', // Better for GitHub Pages than popup
    login_uri: window.location.origin // Dynamic origin
  });
  // One-tap sign-in
  google.accounts.id.prompt();
}

  if (DOM.googleSignInBtn) {
    google.accounts.id.renderButton(DOM.googleSignInBtn, {
      theme: 'filled_blue',
      size: 'large',
      text: 'continue_with'
    });
  }
}

// 🔶 Handle Google Sign-In + Load Drive API 🔶
async function handleGoogleSignIn(response) {
  const user = parseJwt(response.credential);
  currentUser = {
    id: user.sub,
    email: user.email,
    name: user.name || user.email.split('@')[0]
  };
 
  // Store only non-sensitive data
  sessionStorage.setItem('currentUser', JSON.stringify({
    email: currentUser.email,
    name: currentUser.name
  }));
  await initializeDriveAPI(response.credential);
  showDashboard();
}

// 🔶 Load GAPI Client for Drive 🔶
async function initializeDriveAPI(idToken) {
  await loadGoogleScript('https://apis.google.com/js/api.js');
  
  await new Promise((resolve) => {
    gapi.load('client:auth2', resolve);
  });

  await gapi.client.init({
    apiKey: "AIzaSyD_xWtrnzOql-sVMQk-0ruxF5kHgZhyO-g",
    clientId: '901433348522-n01acsr56ah7vqql8rqo2c4cp717bqe4.apps.googleusercontent.com',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    scope: "https://www.googleapis.com/auth/drive.file"
  });

  // Set the Google Auth token
  const authResponse = await gapi.auth2.getAuthInstance().signIn({
    id_token: idToken
  });
  window.gapiToken = authResponse.getAuthResponse().access_token;
}

// 🔶 Helper Functions 🔶
async function loadGoogleScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

// 🔶 Logout 🔶
function setupLogout() {
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener('click', () => {
      google.accounts.id.revoke(currentUser.email, () => {
        localStorage.removeItem('currentUser');
        window.location.reload();
      });
    });
  }
}

// 🔶 UI Control 🔶
function showDashboard() {
  DOM.authContainer?.classList.add('hidden');
  DOM.dashboard?.classList.remove('hidden');
    // Add these lines:
  DOM.profileSection.classList.add('hidden'); // Hide form initially
  DOM.petList.classList.add('hidden'); // Hide profiles initially
}

function showAuthForm() {
  DOM.authContainer?.classList.remove('hidden');
  DOM.dashboard?.classList.add('hidden');
}

// 🔶 Initialize App 🔶
function initializeApp() {
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
document.addEventListener('DOMContentLoaded', initializeApp);
