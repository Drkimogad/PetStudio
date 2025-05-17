// 🔶 GLOBAL DECLARATIONS 🔶
let currentUser = null;

// 🔶 DOM Elements 🔶
const DOM = {
  authContainer: document.getElementById("authContainer"),
  dashboard: document.getElementById("dashboard"),
  logoutBtn: document.getElementById("logoutBtn"),
  googleSignInBtn: document.getElementById("googleSignInBtn")
};

// 🔶 Initialize Google Auth + Drive API 🔶
async function initializeGoogleAuth() {
  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    document.head.appendChild(script);
  });

  google.accounts.id.initialize({
    client_id: '540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com',
    callback: handleGoogleSignIn
  });

  if (DOM.googleSignInBtn) {
    google.accounts.id.renderButton(DOM.googleSignInBtn, {
      theme: 'filled_blue',
      size: 'large'
    });
  }
}

// 🔶 Handle Google Sign-In + Load Drive API 🔶
async function handleGoogleSignIn(response) {
  const user = parseJwt(response.credential);
  currentUser = {
    id: user.sub,
    email: user.email
  };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Initialize Drive API
  await loadGapiClient();
  showDashboard();
}

// 🔶 Load GAPI Client for Drive 🔶
async function loadGapiClient() {
  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });

  await gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    });
    gapi.client.setToken({ access_token: window.gapiToken });
  });
}

// 🔶 Parse JWT Token 🔶
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
