// Global variables
let auth = null;
let provider = null;
let currentQRProfile = null;
// State Management
  let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  let isEditing = false;
  let currentEditIndex = null;

// QR Modal Initialization
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
// Share petcard Function//
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
// Main Initialization //
document.addEventListener("DOMContentLoaded", () => {
  initQRModal();
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
    clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" // ✅ 
  };
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth(); 
// Add this after auth = firebase.auth();
  auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in, initialize Drive API
    initializeDriveAPIForGoogleUsers();
  } else {
    // User is signed out
    console.log("No user authenticated");
  }
});
// ✅ Declare and setup provider
  provider = new firebase.auth.GoogleAuthProvider(); // ✅ Only assigning, not redeclaring
  provider.addScope('https://www.googleapis.com/auth/drive.file');    // Add Drive API scopes
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  
// Initialize Drive Api function //
async function initDriveAPI(accessToken) {
  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: firebaseConfig.apiKey,
          clientId: 'YOUR_GOOGLE_CLOUD_CLIENT_ID',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        gapi.auth.setToken({
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: 3600
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}
  // DOM Elements//
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

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('profile')) {
    const profileIndex = parseInt(urlParams.get('profile'));
    const profile = petProfiles[profileIndex];
    if (profile) {
      printProfile(profile);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
// Drive Folder Management //
async function checkDriveFolder() {
  try {
    const response = await gapi.client.drive.files.list({
      q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)"
    });
    if (response.result.files.length > 0) {
      return response.result.files[0].id;  // return the folder ID
    }
    return null;
  } catch (error) {
    console.error("Drive folder check failed:", error);
    return null;
  }
}
  // 🔄 Helper: Get or Create Drive Folder ID
async function getOrCreateDriveFolderId() {
  const response = await gapi.client.drive.files.list({
    q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id)",
    spaces: 'drive'
  });

  if (response.result.files.length > 0) {
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
async function createDriveFolder() {
  try {
    const response = await gapi.client.drive.files.create({
      resource: {
        name: 'PetStudio',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });
    return response.result.id;
  } catch (error) {
    console.error("Drive folder creation failed:", error);
    return null;
  }
}
// 💾 Save a Profile to Google Drive
async function saveProfileToDrive(profile) {
  try {
    if (!gapi.client.drive) {
      throw new Error("Drive API not initialized");
    }
    const folderId = await getOrCreateDriveFolderId();
    const metadata = {
      name: `${profile.name}_${Date.now()}.json`,
      mimeType: 'application/json',
      parents: [folderId]
    };
    const fileContent = JSON.stringify({
      ...profile,
      lastUpdated: new Date().toISOString()
    });
    const file = await gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: 'application/json',
        body: fileContent
      },
      fields: 'id,name,webViewLink'
    });
    console.log("Saved to Drive:", file.result);
    return file.result;
  } catch (error) {
    console.error("Drive save failed:", error);
    throw error;
  }
}
// 🧩 Unified Save Function (Local + Drive + Firestore fallback)
async function savePetProfile(profile) {
  if (isEditing) {
    petProfiles[currentEditIndex] = profile;
  } else {
    petProfiles.push(profile);
  }
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  // 🔐 Save to Drive if Google user
  const isGoogleUser = auth.currentUser?.providerData?.some(
    p => p.providerId === 'google.com'
  );

  if (isGoogleUser && gapi.client.drive) {
    try {
      await saveProfileToDrive(profile);
    } catch (driveError) {
      console.warn("Drive backup failed, using Firestore fallback");
      await saveToFirestore(profile);
    }
  }
  // 🔄 UI Updates
  renderProfiles();
  profileSection.classList.add("hidden");
  fullPageBanner.classList.remove("hidden");
  isEditing = false;
  currentEditIndex = null;
}
  
  // Pet Profile Functions//
  addPetProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isEditing) {
      profileForm.reset();
      currentEditIndex = null;
    }
    fullPageBanner.classList.add("hidden");
    profileSection.classList.remove("hidden");
    dashboard.classList.remove("hidden");
    authContainer.classList.add("hidden");
  });
  // Delete function with Drive cleanup
  async function deleteProfile(index) {
    const profile = petProfiles[index];
    // NEW: Try to delete from Drive if exists
    if (auth.currentUser?.providerData?.some(p => p.providerId === 'google.com')) {
      try {
        const files = await gapi.client.drive.files.list({
          q: `name contains '${profile.name}' and trashed=false`,
          fields: "files(id,name)"
        });
        if (files.result.files.length > 0) {
          await Promise.all(
            files.result.files.map(file =>
              gapi.client.drive.files.update({
                fileId: file.id,
                resource: {
                  trashed: true
                }
              })
            )
          );
          console.log("Moved to Drive trash:", files.result.files.length, "files");
        }
      } catch (error) {
        console.error("Drive delete failed:", error);
      }
    }
  // render profiles original function //  
function renderProfiles() {
    petList.innerHTML = '';
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
        petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
        petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
        petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));
        petCard.querySelector(".qrBtn").addEventListener("click", () => generateQRCode(index));
        petCard.querySelectorAll(".mood-btn").forEach(btn => {
            btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
        });
        petCard.querySelectorAll(".cover-btn").forEach(btn => {
            btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
        });
        petList.appendChild(petCard);
    });
}
// When creating new profiles
function createNewProfile() {
  const newProfile = {
    id: Date.now(), // Simple unique ID
    name: document.getElementById('petName').value,
    breed: document.getElementById('petBreed').value,
    petDob: document.getElementById("petDob").value,
    birthday: document.getElementById("petBirthday").value,
    gallery: [],
    moodHistory: [],
    coverPhotoIndex: 0
  };
  petProfiles.push(newProfile);
  savePetProfile(newProfile);
  renderProfiles();
}
// Countdown function//
  function getCountdown(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  }
// Mood history function//
  function renderMoodHistory(profile) {
    if (!profile.moodLog || profile.moodLog.length === 0) return "No mood logs yet";
    return profile.moodLog
      .slice(-7)
      .map(entry => `${entry.date}: ${getMoodEmoji(entry.mood)}`)
      .join('<br>');
  }
  function getMoodEmoji(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  }
// Edit profile function //
  function openEditForm(index) {
    isEditing = true;
    currentEditIndex = index;
    const profile = petProfiles[index];
    document.getElementById("petName").value = profile.name;
    document.getElementById("petBreed").value = profile.breed;
    document.getElementById("petDob").value = profile.dob;
    document.getElementById("petBirthday").value = profile.birthday;
    profileSection.classList.remove("hidden");
    fullPageBanner.classList.add("hidden");
  }
// Existing deletion logic
    petProfiles.splice(index, 1);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
// Delete profile function//
  function deleteProfile(index) {
    petProfiles.splice(index, 1);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
// Print profile function //
  function printProfile(profile) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
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
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 10px; 
                    margin: 20px 0; 
                }
                .print-gallery img { 
                    width: 100%; 
                    height: 150px; 
                    object-fit: cover; 
                    opacity: 0; /* Initial hidden state */
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
                ${profile.gallery.map(img => `<img src="${img}" alt="Pet photo">`).join('')}
            </div>
            <script>
                window.onload = function() {
                    const images = Array.from(document.querySelectorAll('img'));
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
                            img.onerror = checkAllLoaded; // Handle broken images
                        }
                    });

                    // Fallback if all images are already cached
                    if(images.length === 0 || images.every(img => img.complete)) {
                        window.print();
                    }
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
  }
// share function is up in the file  //
// ======== QR CODE GENERATION function========
// age calculation function//
  function calculateAge(dobString) {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        years--;
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${years} years, ${months} months`;
    } catch {
      return 'N/A';
    }
  }

// Generate/print/download/ share/close QR code//
function printQR() {
  const printContent = document.querySelector('#qr-modal .printable-area').innerHTML;
  const originalContent = document.body.innerHTML; 
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent; 
  // Re-show modal after printing
  document.getElementById('qr-modal').style.display = 'block';
}
function downloadQR() {
  const canvas = document.querySelector('#qrcode-container canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = (currentQRProfile?.name || 'pet_profile') + '_qr.png';
    link.href = canvas.toDataURL();
    link.click();
  }
}
  // this might be a duplicate//
async function shareQR() {
  try {
    await navigator.share?.({
      title: `${currentQRProfile?.name || 'Pet'} Profile`,
      text: `Check out ${currentQRProfile?.name || 'this pet'}'s details!`,
      url: window.location.href
    });
  } catch {
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}
function generateQRCode(profileIndex) {
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];
  const modal = document.getElementById('qr-modal');
  const container = document.getElementById('qrcode-container');  
  // Clear and regenerate
  container.innerHTML = '';
  modal.style.display = 'block'; 
  new QRCode(container, {
    text: JSON.stringify(currentQRProfile),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}
  function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  if (!petProfiles[profileIndex].moodLog) petProfiles[profileIndex].moodLog = [];
  petProfiles[profileIndex].moodLog.push({
    date: today,
    mood: mood
  });
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}
function setCoverPhoto(profileIndex, imageIndex) {
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}
// ======== Form Handling with Reminder Creation===========
function formatFirestoreDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}
profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
// 1. Hardcoded user ID (temporary until auth implementation)
  const userId = "test-user";
  // 2. Get form values
  const petName = document.getElementById("petName").value;
  const petBreed = document.getElementById("petBreed").value;
  const petDob = document.getElementById("petDob").value;
  const birthday = document.getElementById("petBirthday").value;
  const galleryFiles = Array.from(document.getElementById("petGallery").files);
  // 3. Firestore birthday reminder (if birthday is provided)
  if (birthday) {
    const reminderData = {
      userId: userId,
      petName: petName,
      date: formatFirestoreDate(birthday), // "YYYY-MM-DD"
      message: `It's ${reminder.petname}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
      createdAt: new Date().toISOString()
    };
    try {
      await firebase.firestore().collection("reminders").add(reminderData);
      console.log("Reminder created successfully");
    } catch (error) {
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
    moodLog: [],
    coverPhotoIndex: 0
  };
  if (isEditing) {
    petProfiles[currentEditIndex] = newProfile;
  } else {
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
// ========== Auth Form Switching ============
function toggleForms(showLogin) {
  const loginPage = document.getElementById("loginPage");
  const signupPage = document.getElementById("signupPage");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (showLogin) {
    loginPage.classList.remove("hidden");
    signupPage.classList.add("hidden");
// ✅ Enable only login form fields
    Array.from(loginForm.elements).forEach(el => {
      if (el.tagName === 'INPUT') el.required = true;
    });
    Array.from(signupForm.elements).forEach(el => {
      if (el.tagName === 'INPUT') el.required = false;
    });
  } else {
    loginPage.classList.add("hidden");
    signupPage.classList.remove("hidden");
// ✅ Enable only signup form fields
    Array.from(signupForm.elements).forEach(el => {
      if (el.tagName === 'INPUT') el.required = true;
    });
    Array.from(loginForm.elements).forEach(el => {
      if (el.tagName === 'INPUT') el.required = false;
    });
  }
}
// 🟡 Add event listeners only if buttons exist
if (switchToLogin && switchToSignup) {
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
  //=======Auth Functions =============
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
  // Logout Handler //
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
// Global Google Auth Provider configuration//
provider = new firebase.auth.GoogleAuthProvider(); // ✅ Assign only
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
async function initializeDriveAPIForGoogleUsers() {
  try {
    await gapi.load('client:auth2', async () => {
      await gapi.client.init({
        apiKey: firebaseConfig.apiKey,
        clientId: firebaseConfig.clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email'
      });

      console.log("Drive API initialized for Google user.");
    });
  } catch (error) {
    console.error("Drive init failed:", error);
  }
}  
// Auth State Observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Authenticated: Show dashboard, hide auth screens
    authContainer.classList.add("hidden");
    dashboard.classList.remove("hidden");
    profileSection.classList.add("hidden");
    fullPageBanner.classList.remove("hidden");

    if (logoutBtn) {
      logoutBtn.style.display = "block";
      setupLogoutButton();
    }
    // Initialize Google Drive API
    try {
      await initializeDriveAPIForGoogleUsers();
    } catch (error) {
      console.log("Drive init skipped:", error);
    }
    if (petProfiles.length > 0) {
      renderProfiles();
    } else {
      petList.innerHTML = '';
    }

  } else {
    // Not authenticated: Show login and Google Sign-In button
    authContainer.classList.remove("hidden");
    dashboard.classList.add("hidden");
    if (logoutBtn) logoutBtn.style.display = "none";
    loginPage?.classList.remove("hidden");
    signupPage?.classList.add("hidden");

    // Show Google Sign-In button once
    if (!document.getElementById('googleSignInBtn')) {
      const googleSignInHTML = `
        <button id="googleSignInBtn" class="auth-btn google-btn">
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google logo">
          Continue with Google
        </button>
      `;
      authContainer.insertAdjacentHTML('beforeend', googleSignInHTML);

      document.getElementById('googleSignInBtn').addEventListener('click', async () => {
        try {
          const result = await auth.signInWithPopup(provider);
          const credential = result.credential;
          const accessToken = credential.accessToken;

          await initDriveAPI(accessToken);
          await initializeDriveAPIForGoogleUsers();
        } catch (error) {
         if (error.code === 'auth/popup-closed-by-user') {
         console.log("User closed the popup before completing the sign-in.");
       } else {
          console.error(error);
         }
       }
      });
    }
  }
});
// Service Worker Registration//
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(registration => {
      console.log('Service Worker registered:', registration.scope);

      // Clear old cache versions
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName !== 'pet-studio-cache-v1') {
            caches.delete(cacheName);
          }
        });
      });

      // Wait for service worker to be ready
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            subscribeUserToPushNotifications(registration);
          }
        });
      });
    })
    .catch(error => console.error('Registration failed:', error));

  // Controller change handler
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Controller changed, reloading...');
    window.location.reload();
  });
}
// ====== Push Notification Logic ===========
// Global VAPID Configuration
const VAPID_PUBLIC_KEY = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk';
const VERCEL_API = 'https://pet-studio.vercel.app/api/save-subscription';
// Push Notification Subscription
async function subscribeUserToPushNotifications(registration) {
  try {
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed:', existingSubscription);
      return sendSubscriptionToServer(existingSubscription);
    }
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await sendSubscriptionToServer(newSubscription);
    console.log('Push subscription successful:', newSubscription);
  } catch (error) {
    console.error('Subscription failed:', error);
  }
}
// Send to Vercel API
async function sendSubscriptionToServer(subscription) {
  try {
    const user = auth.currentUser;
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
  } catch (error) {
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
if (petProfiles.length > 0) 
  renderProfiles();
});
