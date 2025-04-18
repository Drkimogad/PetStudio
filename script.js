// State Management
let auth = null; // Global declaration
let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
let isEditing = false;
let currentEditIndex = null;
// VALID_ORIGINS array declaration
const VALID_ORIGINS = [
  'https://drkimogad.github.io',
  'https://drkimogad.github.io/PetStudio'
]; // <-- This semicolon is correct

// Runtime origin check
if (!VALID_ORIGINS.includes(window.location.origin)) {
  window.location.href = 'https://drkimogad.github.io/PetStudio';
}
// ====================
// MAIN INITIALIZATION //
// ====================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase FIRST
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "drkimogad.github.io",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
    clientId: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com", // ✅
    authDomain: 'swiftreach2025.firebaseapp.com' // Must match Firebase settings
  };
  // Changed initialization pattern
  if (!auth) { // Safety check
  const app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth(app); // Assign to global
  provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  } // Add this closing brace
  initQRModal();
  loadGoogleAPIs();
 // =====================
  // DOM ELEMENT SELECTORS
  // =====================
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

  // ===================
  // ELEMENT VALIDATION
  // ===================
  if (!DOM.authContainer) {
    console.error('Critical Error: Auth container not found!');
    return;
  }

  // Create Google Sign-In button
  const googleSignInBtn = document.createElement("button");
  googleSignInBtn.className = "google-signin-btn";
  DOM.authContainer.appendChild(googleSignInBtn);

  // ======================
  // URL PARAMETER HANDLING
  // ======================
  const urlParams = new URLSearchParams(window.location.search);  
  if(urlParams.has('profile')) {
    try {
      const profileIndex = parseInt(urlParams.get('profile'));
      if(window.petProfiles?.length > profileIndex) {
        const profile = petProfiles[profileIndex];
        printProfile(profile);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch(error) {
      console.error('Profile load error:', error);
      showErrorToUser('Invalid profile URL');
    }
  }
// ======================
// UI EVENT LISTENERS
// ======================
if(DOM.switchToLogin && DOM.switchToSignup) {
  DOM.switchToLogin.addEventListener('click', () => {
    DOM.signupPage.classList.add('hidden');
    DOM.loginPage.classList.remove('hidden');
  }); // Added missing closure

  DOM.switchToSignup.addEventListener('click', () => {
    DOM.loginPage.classList.add('hidden');
    DOM.signupPage.classList.remove('hidden');
  }); // Added missing closure
} // Proper if-block closure

  // ======================
  // PET PROFILE INIT
  // ======================
  if(window.petProfiles?.length > 0) {
    renderProfiles();
  } else {
    DOM.petList?.classList.add('empty-state');
  }
});

// ======================
// GOOGLE API INIT FLOW //
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
// CORE FUNCTIONALITY //
// ====================
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
      petList.innerHTML = ''; // Only if petList exists
    }
  } catch (error) {
    console.error("❌ main() failed:", error);
    showErrorToUser(`Initialization error: ${error.message}`);
  }
}

// ================
// ERROR HANDLING //
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
// AUTHENTICATION FLOW //
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
// SCRIPT LOADING FIXES //
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
// Dynamic Google Sign-In button//
if(auth) { // Wrap in existence check
if(!auth.currentUser) {
  if(!document.getElementById('googleSignInBtn')) {
    const googleSignInHTML = `
      <button id="googleSignInBtn" class="auth-btn google-btn">
        <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
        Continue with Google
      </button>
    `;
    authContainer.insertAdjacentHTML('beforeend', googleSignInHTML);
    document.getElementById('googleSignInBtn')
      .addEventListener('click', () => {
        signInWithRedirect(auth, provider)
      });
  }
}
else {
  handleAuthenticatedUser(auth.currentUser);
}
// Handle redirect result
(async function handleRedirectResult() {
 if(!auth) return; // Early exit
  try {
    const result = await getRedirectResult(auth);
    if(result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      await initDriveAPI(accessToken);
      await initializeDriveAPIForGoogleUsers();
      window.location.href = '/main-app';
    }
  }
  catch (error) {
    console.error("Redirect result handling error:", error);
    if(error.code === 'auth/redirect-cancelled-by-user') {
      showAuthError('🚫 Redirect canceled - please try again');
    }
    else {
      showAuthError(`Authentication failed: ${error.message}`);
    }
  }
})();
  
// Set persistence and initialize listeners
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    initAuthListeners();
    initUI();
  })
  .catch((error) => {
    console.error("Persistence error:", error);
    showErrorToUser("Authentication system failed to initialize");
  });
// Auth listeners function
function initAuthListeners() {
  auth.onAuthStateChanged((user) => {
    if(user) {
      console.log("User logged in:", user.uid);
      handleAuthenticatedUser(user);
    }
    else {
      console.log("User logged out");
      showLoginScreen();
    }
  });
}
// DRIVE FOLDER MANAGEMENT //
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
// 🔄 UI UPDATES
renderProfiles();
profileSection.classList.add("hidden");
fullPageBanner.classList.remove("hidden");
isEditing = false;
currentEditIndex = null;
addPetProfileBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  if(!isEditing) {
    profileForm.reset();
    currentEditIndex = null;
  } // Closing the 'if' block here ✅
  fullPageBanner.classList.add("hidden");
  profileSection.classList.remove("hidden");
  dashboard.classList.remove("hidden");
  authContainer.classList.add("hidden");
}); // ← closing the 'addEventListener' callback here ✅
// PROFILE RENDERING FUNCTIONS  
function renderProfiles() {
  petList.innerHTML = ''; // Clear current profiles
  if(petProfiles.length === 0) {
    petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
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
      // Event Listeners
      petCard.querySelector(".editBtn")
        .addEventListener("click", () => openEditForm(index));
      petCard.querySelector(".deleteBtn")
        .addEventListener("click", () => deleteProfile(index));
      petCard.querySelector(".printBtn")
        .addEventListener("click", () => printProfile(profile));
      petCard.querySelector(".qrBtn")
        .addEventListener("click", () => generateQRCode(index));
      petCard.querySelectorAll(".mood-btn")
        .forEach(btn => {
          btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
        });
      petCard.querySelectorAll(".cover-btn")
        .forEach(btn => {
          btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
        });
      petList.appendChild(petCard);
    });
   } // <-- Added closing brace for the else block
 }

  // WHEN CREATING NEW PROFILES
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
  // DAYS COUNTDOWN FUNCTION
  function getCountdown(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if(nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  }
  // MOOD HISTORY FUNCTION
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
  // EDIT PROFILE FUNCTION
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
      .value = profile.birthday;
    profileSection.classList.remove("hidden");
    fullPageBanner.classList.add("hidden");
  }
// PRINT PROFILE FUNCTION (Refactored)
function printProfile(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  // Create HTML structure
  const html = printDocument.createElement('html');
  const head = printDocument.createElement('head');
  const title = printDocument.createElement('title');
  title.textContent = `${profile.name}'s Profile`;
  const style = printDocument.createElement('style');
  style.textContent = `
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
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* More responsive gallery */
      gap: 10px;
      margin: 20px 0;
    }
    .print-gallery img {
      width: 100%;
      height: auto; /* Maintain aspect ratio */
      object-fit: cover;
      opacity: 0; /* Initial hidden state */
    }
  `;
  head.appendChild(title);
  head.appendChild(style);
  html.appendChild(head);

  const body = printDocument.createElement('body');
  const headerDiv = printDocument.createElement('div');
  headerDiv.classList.add('print-header');
  const heading = printDocument.createElement('h1');
  heading.textContent = `${profile.name}'s Profile`;
  const dateParagraph = printDocument.createElement('p');
  dateParagraph.textContent = `Generated on ${new Date().toLocaleDateString()}`;
  headerDiv.appendChild(heading);
  headerDiv.appendChild(dateParagraph);
  body.appendChild(headerDiv);

  const detailsDiv = printDocument.createElement('div');
  detailsDiv.classList.add('print-details');
  const breedParagraph = printDocument.createElement('p');
  breedParagraph.innerHTML = `<strong>Breed:</strong> ${profile.breed}`;
  const dobParagraph = printDocument.createElement('p');
  dobParagraph.innerHTML = `<strong>Date of Birth:</strong> ${profile.dob}`;
  const birthdayParagraph = printDocument.createElement('p');
  birthdayParagraph.innerHTML = `<strong>Next Birthday:</strong> ${profile.birthday}`;
  detailsDiv.appendChild(breedParagraph);
  detailsDiv.appendChild(dobParagraph);
  detailsDiv.appendChild(birthdayParagraph);
  body.appendChild(detailsDiv);

  const galleryHeading = printDocument.createElement('h3');
  galleryHeading.textContent = 'Gallery';
  body.appendChild(galleryHeading);

  const galleryDiv = printDocument.createElement('div');
  galleryDiv.classList.add('print-gallery');
  profile.gallery.forEach(imgSrc => {
    const img = printDocument.createElement('img');
    img.src = imgSrc;
    img.alt = 'Pet photo';
    galleryDiv.appendChild(img);
  });
  body.appendChild(galleryDiv);

  // Image loading script (moved to be appended after gallery)
  const script = printDocument.createElement('script');
  script.textContent = `
    window.onload = function() {
      const images = Array.from(document.querySelectorAll('.print-gallery img'));
      let loadedCount = 0;

      const checkAllLoaded = () => {
        if(++loadedCount === images.length) {
          images.forEach(img => img.style.opacity = '1');
          window.print();
        }
      };

      images.forEach(img => {
        if(img.complete) {
          checkAllLoaded();
        } else {
          img.onload = checkAllLoaded;
          img.onerror = checkAllLoaded;
        }
      });

      if(images.length === 0 || images.every(img => img.complete)) {
        window.print();
      }
    };
  `;
  body.appendChild(script);

  html.appendChild(body);
  printDocument.appendChild(html);
  printDocument.close();
}
  // SHARE PET CARD FUNCTION//
  async function sharePetCard(pet) {
    // 1. Generate Shareable Link
    const shareUrl = `${window.location.origin}/pet/${pet.id}`;
    // 2. Try Web Share API first
    if(navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${pet.name}! 🐾`,
          text: `Check out ${pet.name}'s profile on PetStudio!`,
          url: shareUrl,
        });
        return;
      }
      catch (err) {
        console.log("Share cancelled:", err);
      }
    }
    // 3. Desktop/Image Fallback
    try {
      const cardElement = document.getElementById(`pet-card-${pet.id}`);
      if(!cardElement) throw new Error('Pet card not found');
      const canvas = await html2canvas(cardElement);
      const imageUrl = canvas.toDataURL('image/png');
      // 4. Create and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `${pet.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert(`${pet.name}'s card saved! 🔗 Link copied to clipboard.`);
    }
    catch (error) {
      console.error('Sharing failed:', error);
      window.open(shareUrl, '_blank');
    }
  }
  // AGE CALCULATION FUNCTION
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
  // QR CODE MODAL MANAGEMENT
  // GENERATE, PRINT, DOWNLOAD, SHARE AND CLOSE QR CODE
  let currentQRProfile = null;
  // Generate QR Code
  function generateQRCode(profileIndex) {
    const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    currentQRProfile = savedProfiles[profileIndex];
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qrcode-container');
    // Clear previous QR code
    container.innerHTML = '';
    // Generate new QR code
    new QRCode(container, {
      text: JSON.stringify(currentQRProfile),
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    modal.style.display = 'block';
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
      const modal = document.getElementById('qr-modal');
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
  // Initialize QR Module
  document.addEventListener('DOMContentLoaded', initQRModal);
  // LOG MOOD FUNCTION    
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
  // SET COVERPHOTO FUNCTION
  function setCoverPhoto(profileIndex, imageIndex) {
    petProfiles[profileIndex].coverPhotoIndex = imageIndex;
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
  // FORM HANDLING WITH REMINDER CREATION //
  function formatFirestoreDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString()
      .split('T')[0]; // "YYYY-MM-DD"
  }
  profileForm?.addEventListener("submit", async (e) => {
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
    // 4. Build profile object
    const newProfile = {
      name: petName,
      breed: petBreed,
      dob: petDob,
      birthday: birthday,
      gallery: galleryFiles.map(file => URL.createObjectURL(file)),
      moodHistory: [],
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
    profileSection.classList.add("hidden");
    // Reset form fields
    profileForm.reset();
    // Re-render profiles
    renderProfiles();
    // Redirect to dashboard
    dashboard.classList.remove("hidden"); // Show dashboard
    authContainer.classList.add("hidden"); // Hide auth container
    window.scrollTo(0, 0); // Optional: Scroll to the top of the page
  });
  // AUTH FORM SWITCHING
  function toggleForms(showLogin) {
    const loginPage = document.getElementById("loginPage");
    const signupPage = document.getElementById("signupPage");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    if(showLogin) {
      loginPage.classList.remove("hidden");
      signupPage.classList.add("hidden");
      // ✅ Enable only login form fields
      Array.from(loginForm.elements)
        .forEach(el => {
          if(el.tagName === 'INPUT') el.required = true;
        });
      Array.from(signupForm.elements)
        .forEach(el => {
          if(el.tagName === 'INPUT') el.required = false;
        });
    }
    else {
      loginPage.classList.add("hidden");
      signupPage.classList.remove("hidden");
      // ✅ Enable only signup form fields
      Array.from(signupForm.elements)
        .forEach(el => {
          if(el.tagName === 'INPUT') el.required = true;
        });
      Array.from(loginForm.elements)
        .forEach(el => {
          if(el.tagName === 'INPUT') el.required = false;
        });
    }
  }
  // 🟡 Add event listeners only if buttons exist
  if(switchToLogin && switchToSignup) {
    switchToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      toggleForms(true);
    });
    switchToSignup.addEventListener("click", (e) => {
      e.preventDefault();
      toggleForms(false);
    });
  }
  // 🔁 Optional: Show login form by default on load
  toggleForms(true);
  // AUTHENTICATION SECTION //
  // AUTH STATE OBSERVER
  function showAuthError(message) {
    // Custom error display function (could be a modal or notification)
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.innerText = `🚫 Authentication Error: ${message}\nPlease try again or check your internet connection.`;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 5000); // Remove the error after 5 seconds
  }
  auth.onAuthStateChanged((user) => {
    if(user) {
      // Authenticated: Show dashboard, hide auth screens
      toggleAuthUI(true);
      setupLogoutButton();
    }
    else {
      // Not authenticated: Show login screen, hide dashboard
      toggleAuthUI(false);
    }
  });
  // Function to toggle visibility of UI elements based on auth state
  function toggleAuthUI(isAuthenticated) {
    const authElements = [authContainer, loginPage, signupPage];
    const dashboardElements = [dashboard, profileSection, fullPageBanner, logoutBtn];
    authElements.forEach((el) => {
      el.classList.toggle('hidden', isAuthenticated);
    });
    dashboardElements.forEach((el) => {
      el.classList.toggle('hidden', !isAuthenticated);
    });
  }
  // Setup logout button functionality
  function setupLogoutButton() {
    if(logoutBtn) {
      logoutBtn.style.display = 'block';
      logoutBtn.addEventListener('click', () => {
        auth.signOut()
          .then(() => {
            console.log('User logged out');
          })
          .catch((error) => {
            console.error('Logout error:', error);
            showAuthError(error.message);
          });
      });
    }
  }
  //=======AUTH FUNCTIONS =============
  // Sign Up Handler
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = signupForm.querySelector("#signupEmail")
      .value.trim();
    const password = signupForm.querySelector("#signupPassword")
      .value.trim();
    const email = `${username}@petstudio.com`;
    if(!username || !password) {
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
        document.getElementById("loginEmail")
          .value = username;
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
    const username = loginForm.querySelector("#loginEmail")
      ?.value.trim();
    const password = loginForm.querySelector("#loginPassword")
      ?.value.trim();
    const email = `${username}@petstudio.com`;
    if(!username || !password) {
      alert("Please fill all fields");
      return;
    }
    const submitBtn = loginForm.querySelector("button[type='submit']");
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
  // Logout Handler
  function setupLogoutButton() {
    if(logoutBtn) {
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
// SERVICE WORKER REGISTRATION AND UPDATE CHECK
// script.js (or your main JavaScript file)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register Service Worker
        navigator.serviceWorker.register('./service-worker.js', {
            scope: '/PetStudio/'
        })
        .then((registration) => {
            console.log('Service Worker registered:', registration.scope);

            // Check for updates immediately
            registration.update();

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('New service worker found:', newWorker);

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New update available
                            if (confirm('New version available! Reload to update?')) {
                                newWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    }
                });
            });
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });

        // Handle controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Controller changed - reloading');
            window.location.reload();
        });
    });
}
  // PUSH NOTIFICATIONS LOGIC
  // Global VAPID Configuration
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
  // Send to Vercel API
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
  // Helper function for VAPID key conversion
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  // Initialize
  if(petProfiles.length > 0) {
    renderProfiles();
  }
});
