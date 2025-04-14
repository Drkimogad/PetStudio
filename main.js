// ======================
// Top-Level Declarations
// ======================
let auth = null;
let provider = null;
// ======================
// QR Modal Initialization
// ======================
function initQRModal() {
  // Event delegation for modal buttons
  document.addEventListener('click', function(e) {
    // Print button
    if (e.target.classList.contains('qr-print')) {
      window.print();
    }
    
    // Download button
    else if (e.target.classList.contains('qr-download')) {
      const canvas = document.querySelector('#qrcode-container canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${currentQRProfile.name}_qr.png`.replace(/[^a-z0-9]/gi, '_');
        link.href = canvas.toDataURL();
        link.click();
      }
    }
    
    // Share button
    else if (e.target.classList.contains('qr-share')) {
      shareGeneratedQR();
    }
    
    // Close button
    else if (e.target.classList.contains('qr-close')) {
      document.getElementById('qr-modal').style.display = 'none';
    }
  });
}
// Global variables
let currentQRProfile = null;

// QR Modal Handler
function handleQRActions() {
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('qr-action')) return;
    
    const action = e.target.dataset.action;
    const canvas = document.querySelector('#qrcode-container canvas');
    
    switch(action) {
      case 'print':
        window.print();
        break;
        
      case 'download':
        if (canvas) {
          const link = document.createElement('a');
          link.download = `${currentQRProfile.name}_qr.png`.replace(/[^a-z0-9]/gi, '_');
          link.href = canvas.toDataURL();
          link.click();
        }
        break;
        
      case 'share':
        shareQR();
        break;
        
      case 'close':
        document.getElementById('qr-modal').style.display = 'none';
        break;
    }
  });
}

// Share generated qr code Function//
async function shareGeneratedQR() {
  try {
    if (!currentQRProfile) return;
    
    const shareData = {
      title: `${currentQRProfile.name}'s Pet Profile`,
      text: `Check out ${currentQRProfile.name}'s details!`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showQRStatus('Link copied to clipboard!', true);
    }
  } catch (err) {
    showQRStatus('Sharing failed. Please copy manually.', false);
  }
}

// Helper Function
function showQRStatus(message, isSuccess) {
  const statusEl = document.getElementById('qr-status');
  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? 'green' : 'red';
  setTimeout(() => statusEl.textContent = '', 3000);
}
// ======================
// Share petcard Function
// ======================
async function sharePetCard(pet) {
  // 1. Generate Shareable Link
  const shareUrl = `${window.location.origin}/pet/${pet.id}`;

  // 2. Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Meet ${pet.name}! 🐾`,
        text: `Check out ${pet.name}'s profile on PetStudio!`,
        url: shareUrl,
      });
      return;
    } catch (err) {
      console.log("Share cancelled:", err);
    }
  }

  // 3. Desktop/Image Fallback
  try {
    const cardElement = document.getElementById(`pet-card-${pet.id}`);
    if (!cardElement) throw new Error('Pet card not found');
    
    const canvas = await html2canvas(cardElement);
    const imageUrl = canvas.toDataURL('image/png');

    // Create and trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `${pet.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    alert(`${pet.name}'s card saved! 🔗 Link copied to clipboard.`);
    
  } catch (error) {
    console.error('Sharing failed:', error);
    window.open(shareUrl, '_blank');
  }
}
// ======================
// Main Initialization 
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initQRModal();
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Inside DOMContentLoaded callback:
  auth = firebase.auth(); // KEEP
  provider = new firebase.auth.GoogleAuthProvider(); // KEEP
  // Add Drive API scopes
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');

// ======================
// Initialize Google Drive API
// ======================
function initDriveAPI(token) {
  return new Promise((resolve) => {
    gapi.load('client', () => {
      gapi.client.init({
        apiKey: firebaseConfig.apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      }).then(() => {
        gapi.auth.setToken({
          access_token: token
        });
        resolve();
      });
    });
  });
}

// =============================================
// NEW: Initialize Drive API for Google users
// =============================================
async function initializeDriveAPIForGoogleUsers() {
  if (user.providerData.some(provider => provider.providerId === 'google.com')) {
    try {
      const token = await user.getIdToken();
      await initDriveAPI(token);

      // NEW: Optional - Create PetStudio folder on first login
      const folderExists = await checkDriveFolder();
      if (!folderExists) {
        await createDriveFolder();
      }
    } catch (error) {
      console.error("Drive init failed:", error);
      // Fallback to Firestore silently
    }
  }
}

// Call the async function
initializeDriveAPIForGoogleUsers();

  // ======================
  // DOM Elements
  // ======================
  const authContainer = document.getElementById("authContainer");
  const signupPage = document.getElementById("signupPage");
  const loginPage = document.getElementById("loginPage");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const switchToLogin = document.getElementById("switchToLogin");
  const switchToSignup = document.getElementById("switchToSignup");
  const addPetProfileBtn = document.getElementById("addPetProfileBtn");
  const profileSection = document.getElementById("profileSection");
  const petList = document.getElementById("petList");
  const fullPageBanner = document.getElementById("fullPageBanner");
  const profileForm = document.getElementById("profileForm");
  const googleSignInBtn = document.createElement("button"); // Create Google Sign-In button

// Add at the top of your DOMContentLoaded callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('profile')) {
    const profileIndex = parseInt(urlParams.get('profile'));
    const profile = petProfiles[profileIndex];
    if (profile) {
      printProfile(profile);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  // ======================
  // Drive Folder Management
  // ======================
  async function checkDriveFolder() {
    try {
      const response = await gapi.client.drive.files.list({
        q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder'",
        fields: "files(id)"
      });
      return response.result.files.length > 0;
    } catch (error) {
      console.error("Drive folder check failed:", error);
      return false;
    }
  }

  async function createDriveFolder() {
    try {
      await gapi.client.drive.files.create({
        name: 'PetStudio',
        mimeType: 'application/vnd.google-apps.folder'
      });
    } catch (error) {
      console.error("Drive folder creation failed:", error);
    }
  }
// ======================
  // State Management
  // ======================
  let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  let isEditing = false;
  let currentEditIndex = null;

  // ======================
  // Auth Form Switching
  // ======================
  if (switchToLogin && switchToSignup) {
    switchToLogin.addEventListener("click", () => {
      signupPage.classList.add("hidden");
      loginPage.classList.remove("hidden");
    });

    switchToSignup.addEventListener("click", () => {
      loginPage.classList.add("hidden");
      signupPage.classList.remove("hidden");
    });
  }

  // ======================
  // Auth Functions (UPDATED)
  // ======================

  // Sign Up Handler
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = signupForm.querySelector("#signupEmail").value.trim();
    const password = signupForm.querySelector("#signupPassword").value.trim();
    const email = `${username}@petstudio.com`;

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const submitBtn = signupForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Sign out immediately after signup
        return auth.signOut();
      })
      .then(() => {
        alert("Account created! Please log in.");
        signupForm.reset();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        document.getElementById("loginEmail").value = username;
      })
      .catch((error) => {
        alert("Error: " + error.message);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
      });
  });

  // Login Handler
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = loginForm.querySelector("#loginEmail")?.value.trim();
    const password = loginForm.querySelector("#loginPassword")?.value.trim();
    const email = `${username}@petstudio.com`;

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    const submitBtn = loginForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        let errorMessage = "Login failed: ";
        if (error.code === "auth/wrong-password") errorMessage += "Wrong password";
        else if (error.code === "auth/user-not-found") errorMessage += "User not found";
        else errorMessage += error.message;
        alert(errorMessage);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      });
  });
  // Logout Handler (FIXED)
  function setupLogoutButton() {
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        auth.signOut()
          .then(() => {
            authContainer.classList.remove("hidden");
            dashboard.classList.add("hidden");
            loginPage.classList.remove("hidden");
            signupPage.classList.add("hidden");
          })
          .catch((error) => {
            alert("Logout error: " + error.message);
          });
      });
    }
  }

  // Auth State Observer //
  auth.onAuthStateChanged(async (user) => {
    if (user) {


      // =============================================
      // EXISTING UI CODE (unchanged)
      // =============================================
      authContainer.classList.add("hidden");
      dashboard.classList.remove("hidden");
      profileSection.classList.add("hidden");
      fullPageBanner.classList.remove("hidden");

      if (logoutBtn) {
        logoutBtn.style.display = "block";
        setupLogoutButton();
      }

      if (petProfiles.length > 0) {
        renderProfiles();
      } else {
        petList.innerHTML = '';
      }

    } else {
      // =============================================
      // NEW: Show Google Sign-In button when logged out
      // =============================================
      const googleSignInContainer = document.getElementById('googleSignInContainer');
      if (!googleSignInContainer) {
        const container = document.createElement('div');
        container.id = 'googleSignInContainer';
        container.innerHTML = `
        <button id="googleSignInBtn" class="auth-btn google-btn">
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
          Continue with Google
        </button>
      `;
        authContainer.insertBefore(container, loginPage);

        document.getElementById('googleSignInBtn').addEventListener('click', () => {
          auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        });
      }

      // =============================================
      // EXISTING LOGOUT CODE (unchanged)
      // =============================================
      authContainer.classList.remove("hidden");
      dashboard.classList.add("hidden");
      if (logoutBtn) logoutBtn.style.display = "none";

      loginPage?.classList.remove("hidden");
      signupPage?.classList.add("hidden");
    }
  });
  // ======================
  // Google Sign-In Handler - NEW FUNCTION
  // ======================
  function handleGoogleSignIn() {
    // Check if authContainer exists
    if (!authContainer) {
      console.error('authContainer not found');
      return;
    }
    const googleBtn = document.createElement('div');
    googleBtn.id = 'googleSignIn';
    googleBtn.innerHTML = '<button class="google-btn">Sign in with Google</button>';
    authContainer.appendChild(googleBtn);

    googleBtn.querySelector('button').addEventListener('click', () => {
      auth.signInWithPopup(provider)
        .then(async (result) => {
          // Initialize Drive API with Google token
          await initDriveAPI(result.credential.accessToken);
        })
        .catch((error) => {
          console.error("Google sign-in error:", error);
          // Fallback to email/password if needed
        });
    });
  }
