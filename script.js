//🌟🌟PetStudio SCRIPT.JS 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// 🔶DECLARE GLOBALS🔶🔶🔶
  let auth = null; 
  let provider = null;
  let isSignupInProgress = false;
  let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  let isEditing = false;
  let currentEditIndex = null;
//🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// 🌐 Global DOM element references🔶🔶🔶
const DOM = {
  authContainer:  document.getElementById("authContainer"),
  signupPage:     document.getElementById("signupPage"),
  loginPage:      document.getElementById("loginPage"),
  dashboard:      document.getElementById("dashboard"),
  logoutBtn:      document.getElementById("logoutBtn"),
  signupForm:     document.getElementById("signupForm"),
  loginForm:      document.getElementById("loginForm"),
  switchToLogin:  document.getElementById("switchToLogin"),
  switchToSignup: document.getElementById("switchToSignup"),
  addPetProfileBtn:  document.getElementById("addPetProfileBtn"),
  profileSection:    document.getElementById("profileSection"),
  petList:           document.getElementById("petList"),
  fullPageBanner:    document.getElementById("fullPageBanner"),
  profileForm:       document.getElementById("profileForm")
};
//🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
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
// 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', async function() { // ✅ Added async
  await loadEssentialScripts();
  initQRModal();
  console.log("App fully initialized");
  
  // ⏳ ADD LOADING STATE
  document.body.classList.add('loading');

  try {
    // 🔥 INITIALIZE FIREBASE FIRST
    const firebaseInit = await initializeFirebase();
    auth     = firebaseInit.auth;

    // 🔄 INIT AUTH LISTENERS AFTER FIREBASE
    initAuthListeners(auth); // ✅ Pass auth dependency

    // ✅ MOVED DOM VALIDATION HERE
    if (!DOM.authContainer) {
      throw new Error('Auth container element missing');
    }

    // 🟢 INITIAL FORM STATE
    toggleForms(false);
    DOM.dashboard.classList.add('hidden');
    DOM.fullPageBanner.classList.remove('hidden');
    DOM.profileSection.classList.add('hidden');

    // ✅ MOVED GOOGLE BUTTON CREATION HERE
    const googleSignInBtn = document.createElement("button");
    googleSignInBtn.id = "googleSignInBtn";
    googleSignInBtn.className = "google-signin-btn";
    DOM.authContainer.appendChild(googleSignInBtn);

    // 🔥 INIT PROVIDER AFTER AUTH    
    provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');

    await loadEssentialScripts();

  } catch (error) {
    console.error('Initialization failed:', error);
    showErrorToUser('Failed to initialize. Please refresh.');
    disableUI();
  } finally {
    document.body.classList.remove('loading');
  }
});

// 🧩 PROPER FIREBASE INIT FUNCTION
async function initializeFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
  };

  // ✅ ACTUALLY INITIALIZE FIREBASE
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(app);
  return { app, auth }; // ✅ Return critical instances
}

// 🧩 IMPROVED SCRIPT LOADING
async function loadEssentialScripts() {
// Initialize Google APIs + render profiles
    await main();
    setupLogoutButton();
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if(window.firebase?.auth && window.gapi?.client) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100); // ✅ Faster checking interval
  });
}
    
// 📄 MODIFIED URL PARAM HANDLING
const urlParams = new URLSearchParams(window.location.search); // Add this line
if(urlParams.has('profile')) {
  try {
    const profileIndex = parseInt(urlParams.get('profile'));
    // 🔄 IMPROVED VALIDATION
    if(Number.isNaN(profileIndex)) throw new Error('Invalid profile ID');
    
    const validProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    if(validProfiles.length > profileIndex) {
      printProfile(validProfiles[profileIndex]); // ✅ Pass actual profile data
    } else {
      showErrorToUser('Requested profile not found');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch(error) {
    console.error('Profile load error:', error);
    showErrorToUser('Invalid profile URL');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
// ======================
// UI EVENT LISTENERS 🌟🌟🌟
// ======================
if(DOM.switchToLogin && DOM.switchToSignup) {
  DOM.switchToLogin.addEventListener('click', () => {
    DOM.signupPage.classList.add('hidden');
    DOM.loginPage.classList.remove('hidden');
  });

  DOM.switchToSignup.addEventListener('click', () => {
    DOM.loginPage.classList.add('hidden');
    DOM.signupPage.classList.remove('hidden');
  });
 }
  // ======================
  // PET PROFILE INIT 🌟🌟🌟
  // ======================
  if(window.petProfiles?.length > 0) {
    renderProfiles();
  } else {
    DOM.petList?.classList.add('empty-state');
  }

// ======================
// GOOGLE API INIT FLOW 🌟🌟🌟
// ======================
async function initializeGoogleAPI() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', {
      callback: () => resolve(),
      onerror: reject
    });
  });
}

// ====================
// CORE FUNCTIONALITY 🌟🌟🌟🌟🌟🌟
// MAIN FUNCTION 🌟🌟🌟🌟🌟🌟
async function main() {
  try {
    await loadGAPI();
    await initializeGoogleAPI();
    
    // Unified gapi client init
    await gapi.client.init({
      apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
      clientId: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com",
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scope: 'https://www.googleapis.com/auth/drive.file'
    });

    console.log("✅ Google API client initialized");
    
    // Safety checks
    if(window.petProfiles?.length > 0) {
      renderProfiles();
    } else {
      DOM.petList.innerHTML = '';
    }
  } catch (error) {
    console.error("❌ main() failed:", error);
    showErrorToUser(`Initialization error: ${error.message}`);
  }
}

// ================
// ERROR HANDLING ❌❌❌❌❌❌
// ================
function showErrorToUser(message) {
  try {
    const errorDiv = document.getElementById('error-message');
    if(errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    } else {
      alert(message); // Fallback
    }
  } catch (fallbackError) {
    alert(message); // Ultimate fallback
  }
}

// =====================
// 🔐 AUTHENTICATION FLOW 🌟🌟🌟
// =====================
async function refreshDriveTokenIfNeeded() {
  try {
    if(!auth?.currentUser) throw new Error("No authenticated user");
    
    const authResponse = await auth.currentUser.getIdTokenResult();
    const expiration = new Date(authResponse.expirationTime);
    
    if(expiration <= new Date()) {
      console.log("Token expired, requesting re-authentication");
      await signInWithRedirect(auth, provider);
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    showErrorToUser('Session expired - please re-login');
  }
}

// ======================
// SCRIPT LOADING FIXES 🌟🌟🌟
// ======================
function loadGAPI() {
  return new Promise((resolve, reject) => {
    if(window.gapi) return resolve();
    
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
  // =====================
  // Fixed Google Sign-In 🌟🌟🌟
  // =====================
  if (auth) {
    if (!auth.currentUser) {
      if (!document.getElementById('googleSignInBtn')) {
        const googleSignInHTML = `
          <button id="googleSignInBtn" class="auth-btn google-btn">
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
            Continue with Google
          </button>`;
        DOM.authContainer.insertAdjacentHTML('beforeend', googleSignInHTML);
        document.getElementById('googleSignInBtn').addEventListener('click', () => {
          signInWithRedirect(auth, provider);
        });
      }
    } else {
      handleAuthenticatedUser(auth.currentUser);
    }
  } 
// Handle redirect result
(async function handleRedirectResult() {
  if(!auth) return;
  
  try {
    // Use proper firebase.auth() method
    const result = await firebase.auth().getRedirectResult();
    
    if(result.user) {
      const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      await initDriveAPI(accessToken);
      await initializeDriveAPIForGoogleUsers();
      window.location.href = '/main-app';
    }
  }
  catch (error) {
    console.error("Redirect error:", error);
    showAuthError(`Auth failed: ${error.message}`);
  }
})();
  
// Set persistence and initialize listeners
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    initAuthListeners();
    initUI();
  })
  .catch((error) => {
    console.error("Persistence error:", error);
    showErrorToUser("Authentication system failed to initialize");
  });
  // Add these if missing
function initUI() {
  // Your existing UI initialization code
  checkAuthState();
}
// FUNCTION CHECK AUTH STATE 🌟🌟🌟
async function checkAuthState() {
  const user = await auth.currentUser;
  if (user) {
    window.location.href = '/main-app'; // Your app's main page
  }
}
// Auth listeners function
function initAuthListeners() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User logged in:", user.uid);
      handleAuthenticatedUser(user);
    } else {
      console.log("No active session");
      if(!isSignupInProgress) {
        toggleForms(true); // 🌟 Use existing form toggle
        DOM.authContainer.classList.remove('hidden');
      }
    }
  });
}

// FUNCTION HANDLE AUTH ACTION 🌟🌟🌟
function handleAuthAction() {
  // ✅ Safe to use auth/provider here
  if(auth && provider) {
    auth.signInWithRedirect(provider);
  }
}
//🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// DRIVE FOLDER MANAGEMENT🌟🌟🌟
// 🔄 Get or Create Drive Folder ID
async function getOrCreateDriveFolderId() {
  const response = await gapi.client.drive.files.list({
    q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id)",
    spaces: 'drive'
  });
  if(response.result.files.length > 0) {
    return response.result.files[0].id;
  }
  const folder = await gapi.client.drive.files.create({
    resource: {
      name: 'PetStudio',
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  });
  return folder.result.id;
}
// 💾 Save a Profile to Google Drive
async function saveProfileToDrive(profile) {
  try {
    if(!gapi.client.drive) {
      throw new Error("Drive API not initialized");
    }
    const folderId = await getOrCreateDriveFolderId();
    // Create a unique and clean file name
    const fileName = `${profile.name.replace(/\s+/g, "_")}_${profile.id || Date.now()}.json`;
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId]
    };
    const fileContent = JSON.stringify({
      ...profile,
      lastUpdated: new Date()
        .toISOString()
    });
    const file = await gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: 'application/json',
        body: fileContent
      },
      fields: 'id,name,webViewLink'
    });
    console.log("✅ Saved to Drive:", file.result);
    return file.result;
  }
  catch (error) {
    console.error("❌ Drive save failed:", error);
    throw error;
  }
}
// 🧩 Unified Save Function (Local + Drive + Firestore fallback)
async function savePetProfile(profile) {
  if(isEditing) {
    petProfiles[currentEditIndex] = profile;
  }
  else {
    petProfiles.push(profile);
  }
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  const isGoogleUser = auth.currentUser?.providerData?.some(
    p => p.providerId === 'google.com'
  );
  if(isGoogleUser && gapi.client?.drive) {
    try {
      await saveProfileToDrive(profile);
    }
    catch (driveError) {
      console.warn("⚠️ Drive backup failed. Falling back to Firestore.");
      try {
        await saveToFirestore(profile);
      }
      catch (firestoreError) {
        console.error("❌ Firestore fallback also failed:", firestoreError);
      }
    }
  }
}
// Delete function with Drive cleanup
async function deleteProfile(index) {
  const profile = petProfiles[index];
  // Confirm deletion
  if (!confirm("Are you sure you want to delete this profile?")) return;
  
  // Try to delete from Google Drive if applicable
  const fileId = profile.driveFileId;
  if (fileId) {
    try {
      await deleteProfileFromDrive(fileId, profile.gallery); // Pass gallery here
      console.log("Drive files deleted successfully");
    } catch (driveError) {
      console.error("Error deleting Drive files:", driveError);
    }
  }

  // Now delete the profile from petProfiles array and update localStorage
  petProfiles.splice(index, 1);
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Helper function to delete pet images and profile file from Google Drive
async function deleteProfileFromDrive(fileId, gallery = []) {
  if (gallery.length > 0) {
    for (let img of gallery) {
      await deleteImageFromDrive(img); // Assuming `img` contains the Drive fileId
    }
  }

  try {
    await gapi.client.drive.files.delete({ fileId });
    console.log('Profile file deleted from Google Drive');
  } catch (error) {
    console.error('Error deleting profile from Google Drive:', error);
  }
}
  
// 🔼 NEW FUNCTION 🌟🌟🌟
function handleAuthenticatedUser(user) {
  console.log("✅ Auth success:", user.uid);
  DOM.dashboard.classList.remove('hidden');
  DOM.authContainer.classList.add('hidden');
  initializeGoogleAPI(); // Ensure Drive is ready
}
// 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷  
// 🔄 UI UPDATES
renderProfiles();
DOM.profileSection.classList.add("hidden");
DOM.fullPageBanner.classList.remove("hidden");
isEditing = false;
currentEditIndex = null;
DOM.addPetProfileBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  if(!isEditing) {
    DOM.profileForm.reset();
    currentEditIndex = null;
  }
  DOM.fullPageBanner.classList.remove("hidden");
  DOM.profileSection.classList.add("hidden");
});
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷  
// PROFILE RENDERING FUNCTIONS  
function renderProfiles() {
  DOM.petList.innerHTML = '';
  if(petProfiles.length === 0) {
  DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
  }
  else {
    petProfiles.forEach((profile, index) => {
      const petCard = document.createElement("div");
      petCard.classList.add("petCard");
      petCard.id = `pet-card-${profile.id}`; // Required for html2canvas
      const coverPhotoUrl = profile.gallery[profile.coverPhotoIndex];
      const profileHeaderStyle = coverPhotoUrl ? `style="background-image: url('${coverPhotoUrl}');"` : '';
      petCard.innerHTML = `
            <div class="profile-header" ${profileHeaderStyle}>
                <h3>${profile.name}</h3>
                <p class="countdown">${getCountdown(profile.birthday)}</p>
            </div>
            <div class="profile-details">
                <p><strong>Breed:</strong> ${profile.breed}</p>
                <p><strong>DOB:</strong> ${profile.dob}</p>
                <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
            </div>
            <div class="gallery-grid">
                ${profile.gallery.map((img, imgIndex) => `
                    <div class="gallery-item">
                       <img src="${img}" alt="Pet Photo" onload="this.classList.add('loaded')">
                        <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}"
                                data-index="${imgIndex}">★</button>
                    </div>
                `).join('')}
            </div>
            <div class="mood-tracker">
                <div class="mood-buttons">
                    <span>Log Mood:</span>
                    <button class="mood-btn" data-mood="happy">😊</button>
                    <button class="mood-btn" data-mood="neutral">😐</button>
                    <button class="mood-btn" data-mood="sad">😞</button>
                </div>
                <div class="mood-history">
                    ${renderMoodHistory(profile)}
                </div>
            </div>
            <div class="action-buttons">
                <button class="editBtn">✏️ Edit</button>
                <button class="deleteBtn">🗑️ Delete</button>
                <button class="printBtn">🖨️ Print</button>
                <button class="shareBtn" onclick="sharePetCard(${JSON.stringify(profile)})">📤 Share</button>
                <button class="qrBtn">🔲 QR Code</button>
            </div>
        `;
      // =====================
      // EVENT LISTENERS 🌟🌟🌟
      // =====================
      // Edit Button
      petCard.querySelector(".editBtn")
        .addEventListener("click", () => openEditForm(index));
      
      // Delete Button
      petCard.querySelector(".deleteBtn")
        .addEventListener("click", () => deleteProfile(index));
      
      // Print Button
      petCard.querySelector(".printBtn")
        .addEventListener("click", () => printProfile(profile));
      // Share Button
      petCard.querySelector('.shareBtn')
       .addEventListener('click', () => sharePetCard(profile));
      
      // QR Button
      petCard.querySelector(".qrBtn")
        .addEventListener("click", () => generateQRCode(index));

      // Mood Buttons
      petCard.querySelectorAll(".mood-btn").forEach(btn => {
        btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
      });

      // Cover Photo Buttons
      petCard.querySelectorAll(".cover-btn").forEach(btn => {
        btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
      });

      DOM.petList.appendChild(petCard);
    });
  } 
}

  // WHEN CREATING NEW PROFILES 🌟🌟🌟
  function createNewProfile() {
    const timestamp = Date.now();
    const newProfile = {
      id: timestamp, // Simple unique ID
      fileName: `pet_${timestamp}`, // 🔒 Stable file name for Drive storage
      name: document.getElementById('petName')
        .value,
      breed: document.getElementById('petBreed')
        .value,
      petDob: document.getElementById("petDob")
        .value,
      birthday: document.getElementById("petBirthday")
        .value,
      gallery: [],
      moodHistory: [],
      coverPhotoIndex: 0
    };
    petProfiles.push(newProfile);
    savePetProfile(newProfile);
    renderProfiles();
  }
  // 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
  // DAYS COUNTDOWN FUNCTION 🌟🌟🌟
  function getCountdown(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if(nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  }
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
  // MOOD HISTORY FUNCTION 🌟🌟🌟
  function renderMoodHistory(profile) {
    if(!profile.moodHistory || profile.moodHistory.length === 0) return "No mood logs yet";
    return profile.moodHistory
      .slice(-7)
      .map(entry => `${entry.date}: ${getMoodEmoji(entry.mood)}`)
      .join('<br>');
  }

  function getMoodEmoji(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  }
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
  // EDIT PROFILE FUNCTION 🌟🌟🌟
  function openEditForm(index) {
    isEditing = true;
    currentEditIndex = index;
    const profile = petProfiles[index];
    document.getElementById("petName")
      .value = profile.name;
    document.getElementById("petBreed")
      .value = profile.breed;
    document.getElementById("petDob")
      .value = profile.dob;
    document.getElementById("petBirthday")
      .value = profile.birthday;  // Populate mood history into form
    const moodInput = document.getElementById("moodHistoryInput");
    if (moodInput) {
    moodInput.value = profile.moodHistory
      .map(entry => `${entry.date}:${entry.mood}`)
      .join("\n");
  }

    DOM.profileSection.classList.remove("hidden"); 
    DOM.fullPageBanner.classList.add("hidden");
  }
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
// PRINT PROFILE FUNCTION 🌟🌟🌟
function printProfile(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  // Create single root element
  const html = `
  <html>
    <head>
      <title>${profile.name}'s Profile</title>
      <style>
        body {
          font-family: Arial;
          padding: 20px;
          -webkit-print-color-adjust: exact !important;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .print-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin: 20px 0;
        }
        .print-gallery img {
          width: 100%;
          height: auto;
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${profile.name}'s Profile</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="print-details">
        <p><strong>Breed:</strong> ${profile.breed}</p>
        <p><strong>Date of Birth:</strong> ${profile.dob}</p>
        <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
      </div>
      <h3>Gallery</h3>
      <div class="print-gallery">
        ${profile.gallery.map(imgSrc => 
          `<img src="${imgSrc}" alt="Pet photo" onload="this.style.opacity = '1'">`
        ).join('')}
      </div>
    </body>
  </html>`;

  printDocument.write(html);
  printDocument.close();

  // Image load handling
  const images = printDocument.querySelectorAll('img');
  let loaded = 0;
  
  const checkPrint = () => {
    if (++loaded === images.length) {
      printWindow.print();
    }
  };

  images.forEach(img => {
    if (img.complete) checkPrint();
    else img.addEventListener('load', checkPrint);
  });
}
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀  
// 🔼 SHARE PET CARD FUNCTION 🌟🌟🌟
async function sharePetCard(profile) {
  const loader = document.getElementById('processing-loader');
  let shareBtn, originalText; // 🚨 Moved to parent scope

  try {
    // 🚦 SHOW LOADER
    loader.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // 🔄 CAPTURE BUTTON PROPERLY
    shareBtn = event?.target || document.querySelector(`[onclick*="sharePetCard(${profile.id})"]`);
    if(shareBtn) {
      originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = '🔄 Preparing...';
      shareBtn.disabled = true;
    }

    // 1. Generate CORRECT Shareable Link
    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`; // ✅ profile.id not pet.id

    // 2. Try Web Share API 
    if(navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${profile.name}! 🐾`, // ✅ profile.name
          text: `Check out ${profile.name}'s profile on PetStudio!`,
          url: shareUrl,
        });
        return;
      }
      catch (error) { // ✅ Fixed err -> error
        console.log("Share cancelled:", error);
        return; // Exit early
      }
    }

    // 3. Desktop/Image Fallback
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    if(!cardElement) throw new Error('Card element missing');
    
    // 🖼️ ADD HTML2CANVAS CONFIG FROM PREVIOUS FIXES
    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      scale: 2,
      logging: false
    });
    
    const imageUrl = canvas.toDataURL('image/png');
    
    // 4. Download Handling
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `${profile.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_'); // ✅ profile.name
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // 5. Clipboard Handling
    await navigator.clipboard.writeText(shareUrl);
    showErrorToUser(`${profile.name}'s card saved! 🔗 Link copied.`); // ✅ Better than alert()

  } catch (error) {
    console.error('Sharing failed:', error);
    showErrorToUser('Sharing failed. Please try again.'); // ✅ User feedback
  } finally {
    // 🚦 CLEANUP
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if(shareBtn) {
      shareBtn.innerHTML = originalText;
      shareBtn.disabled = false;
    }
  }
}
// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀
  // AGE CALCULATION FUNCTION 🌟🌟🌟
  function calculateAge(dobString) {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        years--;
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${years} years, ${months} months`;
    }
    catch {
      return 'N/A';
    }
  }
// 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
// QR CODE MODAL MANAGEMENT 🌟🌟🌟
// GENERATE, PRINT, DOWNLOAD, SHARE AND CLOSE QR CODE
// Generate QR Code
function generateQRCode(profileIndex) {
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];
  const modal = document.getElementById('qr-modal');
  const container = document.getElementById('qrcode-container');
  
  // Clear previous QR code
  container.innerHTML = '';
  
  // Generate new QR code with proper error handling
  try {
    new QRCode(container, {
      text: `${window.location.origin}/?profile=${currentQRProfile.id}`, // Shortened URL
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    modal.style.display = 'block';
  } catch (error) {
    console.error('QR Generation Error:', error);
    alert('QR code generation failed. Profile data might be too large.');
  }
}
  // Print QR Code
  function printQR() {
    const printContent = document.querySelector('#qr-modal .printable-area')
      .cloneNode(true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
  // Download QR Code
  function downloadQR() {
    const canvas = document.querySelector('#qrcode-container canvas');
    if(canvas) {
      const link = document.createElement('a');
      link.download = `${currentQRProfile?.name || 'pet_profile'}_qr.png`.replace(/[^a-z0-9]/gi, '_');
      link.href = canvas.toDataURL();
      link.click();
    }
  }
  // Share QR Code
  async function shareQR() {
    try {
      if(!currentQRProfile) return;
      const shareData = {
        title: `${currentQRProfile.name}'s Pet Profile`,
        text: `Check out ${currentQRProfile.name}'s details!`,
        url: window.location.href
      };
      if(navigator.share) {
        await navigator.share(shareData);
      }
      else {
        await navigator.clipboard.writeText(shareData.url);
        showQRStatus('Link copied to clipboard!', true);
      }
    }
    catch (err) {
      showQRStatus('Sharing failed. Please copy manually.', false);
    }
  }
  // QR Modal Initialization
  function initQRModal() {
    document.addEventListener('click', (e) => {
         // ✅ Only handle clicks inside QR modal
    if (!e.target.closest('#qr-modal')) return;
    const modal = document.getElementById('qr-modal');
    modal.style.display = 'block'; 
    document.body.style.overflow = 'hidden'; // Prevent scrolling
      
      if(e.target.classList.contains('qr-print')) {
        printQR();
      }
      else if(e.target.classList.contains('qr-download')) {
        downloadQR();
      }
      else if(e.target.classList.contains('qr-share')) {
        shareQR();
      }
      else if(e.target.classList.contains('qr-close')) {
        modal.style.display = 'none';
      }
    });
  }
  // QR Status Helper
  function showQRStatus(message, isSuccess) {
    const statusEl = document.getElementById('qr-status');
    if(!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = isSuccess ? '#28a745' : '#dc3545';
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.style.color = '';
    }, 3000);
  }

  // LOG MOOD FUNCTION 🌟🌟🌟  
  function logMood(profileIndex, mood) {
    const today = new Date()
      .toISOString()
      .split('T')[0];
    if(!petProfiles[profileIndex].moodHistory) petProfiles[profileIndex].moodHistory = [];
    petProfiles[profileIndex].moodHistory.push({
      date: today,
      mood: mood
    });
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
  // SET COVERPHOTO FUNCTION 🌟🌟🌟
  function setCoverPhoto(profileIndex, imageIndex) {
    petProfiles[profileIndex].coverPhotoIndex = imageIndex;
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
  // FORM HANDLING WITH REMINDER CREATION 🌟🌟🌟
  function formatFirestoreDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString()
      .split('T')[0]; // "YYYY-MM-DD"
  }
  
  // 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷
  // FORM SUBMISSION 🌟🌟🌟
 DOM.profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    // 1. Hardcoded user ID (temporary until auth implementation)
    const userId = "test-user";
    // 2. Get form values
    const petName = document.getElementById("petName")
      .value;
    const petBreed = document.getElementById("petBreed")
      .value;
    const petDob = document.getElementById("petDob")
      .value;
    const birthday = document.getElementById("petBirthday")
      .value;
    const galleryFiles = Array.from(document.getElementById("petGallery")
      .files);
    // 3. Firestore birthday reminder (if birthday is provided)
    if(birthday) {
      const reminderData = {
        userId: userId,
        petName: petName,
        date: formatFirestoreDate(birthday), // "YYYY-MM-DD"
        message: `It's ${petName}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
        createdAt: new Date()
          .toISOString()
      };
      try {
        await firebase.firestore()
          .collection("reminders")
          .add(reminderData);
        console.log("Reminder created successfully");
      }
      catch (error) {
        console.error("Error creating reminder:", error);
      }
    }
  // Handle gallery files with URL cleanup
 // Modify gallery handling
const galleryUrls = await Promise.all(
  galleryFiles.map(async file => {
    const url = URL.createObjectURL(file);
// Read mood history from form input (once)
const moodHistoryInput = document.getElementById("moodHistoryInput");
let moodHistory = [];
if (moodHistoryInput && moodHistoryInput.value.trim()) {
  moodHistory = moodHistoryInput.value
    .trim()
    .split("\n")
    .map(line => {
      const [date, mood] = line.split(":");
      return { date: date.trim(), mood: mood.trim() };
    });
}

// Handle gallery files with URL cleanup
const galleryUrls = await Promise.all(
  galleryFiles.map(async file => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise(resolve => {
      img.onerror = resolve;
      img.onload  = resolve;
      img.src     = url;
    });
    return url;
  })
);

// 4. Build profile object
const newProfile = {
  id: Date.now(),
  name: petName,
  breed: petBreed,
  dob: petDob,
  birthday: birthday,
  gallery: galleryUrls,
  moodHistory: moodHistory,   // use parsed logs
  coverPhotoIndex: 0
};

    if(isEditing) {
      petProfiles[currentEditIndex] = newProfile;
    }
    else {
      petProfiles.push(newProfile);
    }
// Save the updated profiles to localStorage
localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
// Hide the form and banner
DOM.profileSection.classList.add("hidden");
// Reset form fields
DOM.profileForm.reset();
// Re-render profiles
renderProfiles();
window.scrollTo(0, 0); 
}); 
  
// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢    
// AUTH FORM SWITCHING 🌟🌟🌟
// 🟢 NEW TOGGLEFORMS FUNCTION🌟🌟🌟
function toggleForms(showLogin) {
  DOM.signupPage.classList.toggle('hidden', showLogin);
  DOM.loginPage.classList.toggle('hidden', !showLogin);
  
  // Reset validation on hidden forms
  [DOM.signupForm, DOM.loginForm].forEach(form => {
    if(form.classList.contains('hidden')) {
      form.reset();
      form.querySelectorAll('input').forEach(input => {
        input.setCustomValidity('');
      });
    }
  });
}
// 🟢 AUTHENTICATION SECTION 🌟🌟🌟
  // 1. AUTH STATE OBSERVER
  function showAuthError(message) {
    // Custom error display function (could be a modal or notification)
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.innerText = `🚫 Authentication Error: ${message}\nPlease try again or check your internet connection.`;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000); // Remove the error after 5 seconds
  }
// 2. AUTH STATE CHANGED
// 🔼 auth.onAuthStateChanged
auth.onAuthStateChanged((user) => {
  if (user) {
    // Authenticated
    DOM.dashboard.classList.remove('hidden');
    DOM.authContainer.classList.add('hidden');
    renderProfiles();
  } else {
    // Not authenticated
    DOM.dashboard.classList.add('hidden');
    DOM.authContainer.classList.remove('hidden');
    
    // ✅ Preserve form state
    const showLogin = !document.getElementById('loginPage').classList.contains('hidden');
    toggleForms(showLogin);
  }
});
// 🟢 CORRECTED TOGGLEAUTHUI FUNCTION🌟🌟🌟
function toggleAuthUI(isAuthenticated) {
  // Only control container visibility - not individual forms
  const authElements = [DOM.authContainer];
  const dashboardElements = [DOM.dashboard, DOM.profileSection, DOM.fullPageBanner, DOM.logoutBtn];

  DOM.authContainer.classList.toggle('hidden', isAuthenticated);
  DOM.dashboard.classList.toggle('hidden', !isAuthenticated);
  
  // Reset UI state when authenticated
  if(isAuthenticated) {
    DOM.fullPageBanner.classList.remove('hidden');
    DOM.profileSection.classList.add('hidden');
  }
}
  //🟢=======AUTH FUNCTIONS =============
  // 🔼 Sign Up Handler🌟🌟🌟
// Sign Up Handler
DOM.signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  
  if (!auth) {
    showErrorToUser("Authentication system not ready");
    return;
  }

  const username = DOM.signupForm.querySelector("#signupEmail").value.trim();
  const password = DOM.signupForm.querySelector("#signupPassword").value.trim();
  const email = `${username}@petstudio.com`;
  const submitBtn = DOM.signupForm.querySelector("button[type='submit']");

  if (!username || !password) {
    showAuthError("Please fill all fields");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Successful signup - automatic login
      DOM.signupForm.reset();
      
      // Direct redirect without signout
      window.location.href = '/PetStudio/main-app.html'; 
    })
    .catch((error) => {
      showAuthError(error.message);
      console.error("Signup Error:", error);
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    });
});
// 🔼 Login Handler 🌟🌟🌟
  DOM.loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = DOM.loginForm.querySelector("#loginEmail")
      ?.value.trim();
    const password = DOM.loginForm.querySelector("#loginPassword")
      ?.value.trim();
    const email = `${username}@petstudio.com`;
    if(!username || !password) {
      alert("Please fill all fields");
      return;
    }
    const submitBtn = DOM.loginForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => {
        let errorMessage = "Login failed: ";
        if(error.code === "auth/wrong-password") errorMessage += "Wrong password";
        else if(error.code === "auth/user-not-found") errorMessage += "User not found";
        else errorMessage += error.message;
        alert(errorMessage);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      });
  });

// 🔼 Logout Handler🌟🌟🌟
function setupLogoutButton() {
  DOM.logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await auth.signOut();
      window.location.href = '/PetStudio/'; // Full redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });
}
// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
// ⚙️ SERVICE WORKER =============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // ✅ PROPER PATH & SCOPE
    navigator.serviceWorker.register('/PetStudio/service-worker.js', {
      scope: '/PetStudio/'
    })
    .then(registration => {
      console.log('SW registered for scope:', registration.scope);
    })
    .catch(error => {
      console.error('SW registration failed:', error);
    });
  });
}
// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  // 🟢 PUSH NOTIFICATIONS LOGIC
  // 🟢 Global VAPID Configuration
  const VAPID_PUBLIC_KEY = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk';
  const VERCEL_API = 'https://pet-studio.vercel.app/api/save-subscription';
  // Push Notification Subscription
  async function subscribeUserToPushNotifications(registration) {
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if(existingSubscription) {
        console.log('Already subscribed:', existingSubscription);
        return sendSubscriptionToServer(existingSubscription);
      }
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await sendSubscriptionToServer(newSubscription);
      console.log('Push subscription successful:', newSubscription);
    }
    catch (error) {
      console.error('Subscription failed:', error);
    }
  }
  //🟢 Send to Vercel API
async function sendSubscriptionToServer(subscription) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    const response = await fetch(`${VERCEL_API}/save-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await user.getIdToken()}`
      },
      body: JSON.stringify({
        subscription,
        userId: user.uid,
        vapidPublicKey: VAPID_PUBLIC_KEY
      })
    });
    if (!response.ok) throw new Error('Vercel API rejected subscription');
    console.log('Subscription saved via Vercel API');
  } catch (error) { // <-- Corrected "catch" block
    console.error('Subscription sync failed:', error); 
    throw error;
  }
}
  // 🟢 Helper function for VAPID key conversion
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }
// 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  // 🟢 Initialize
  if(petProfiles.length > 0) {
    renderProfiles();
  }
});
