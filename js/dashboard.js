//🌟 Pet Profile Management 🌟
const addPetProfileBtn = document.getElementById("addPetProfileBtn");
let currentQRProfile = null; // Only new declaration needed
// Load from localStorage on app start

// SAFE GLOBAL INITIALIZATION (compatible with auth.js)
if (typeof petProfiles === 'undefined') {
    window.petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
}
if (typeof isEditing === 'undefined') {
    window.isEditing = false;
}
if (typeof currentEditIndex === 'undefined') {
    window.currentEditIndex = -1;
}

// SAFE DOM REFERENCES (compatible with auth.js)
function initDashboardDOM() {
    // Only initialize missing references
    if (!window.DOM) window.DOM = {};
    
    // Add dashboard-specific references
    DOM.addPetProfileBtn = DOM.addPetProfileBtn || addPetProfileBtn;
    DOM.profileSection = DOM.profileSection || document.getElementById("profileSection");
    DOM.petList = DOM.petList || document.getElementById("petList");
    DOM.fullPageBanner = DOM.fullPageBanner || document.getElementById("fullPageBanner");
    DOM.profileForm = DOM.profileForm || document.getElementById("profileForm");
    
    // Ensure required elements exist
    if (!DOM.petList) console.error("petList element missing");
    if (!DOM.profileSection) console.error("profileSection element missing");
}

// Initialize DOM references when safe
if (document.readyState === 'complete') {
    initDashboardDOM();
} else {
    document.addEventListener('DOMContentLoaded', initDashboardDOM);
}

// RENDER ALL PROFILES FORM OLD 
function renderProfiles() {
  DOM.petList.innerHTML = '';
  if(petProfiles.length === 0) {
    DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
  }
  else {
    petProfiles.forEach((profile, index) => {
      const petCard = document.createElement("div");
      petCard.classList.add("petCard");
      petCard.id = `pet-card-${profile.id}`;    
// ✅ Support both object-based and string-based gallery entries
    const coverImageObj = profile.gallery?.[profile.coverPhotoIndex];
    const coverPhotoUrl = typeof coverImageObj === "string"
      ? coverImageObj
      : coverImageObj?.url;

    const profileHeaderStyle = coverPhotoUrl
      ? `style="background-image: url('${coverPhotoUrl}');"`
      : '';
      
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
        ${profile.gallery.map((img, imgIndex) => {
          const imgUrl = typeof img === "string" ? img : img?.url;
          return `
            <div class="gallery-item">
              <img src="${imgUrl}" alt="Pet Photo" onload="this.classList.add('loaded')">
              <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}"
                      data-index="${imgIndex}">★</button>
            </div>
          `;
        }).join('')}
      </div>
        <div class="mood-tracker">
          <div class="mood-buttons">
  <span>Log Mood:</span>
  <button class="mood-btn" data-mood="happy">😊</button>
  <button class="mood-btn" data-mood="sad">😢</button>
  <button class="mood-btn" data-mood="angry">😠</button>
  <button class="mood-btn" data-mood="excited">😄</button>
  <button class="mood-btn" data-mood="relaxed">😌</button>
  <button class="mood-btn" data-mood="tired">😴</button>
  <button class="mood-btn" data-mood="anxious">😰</button>
  <button class="mood-btn" data-mood="playful">🐾</button>
  <button class="mood-btn" data-mood="bored">🥱</button>
</div>
        <div class="mood-history">
            ${renderMoodHistory(profile)}
          </div>
        </div>
        <div class="action-buttons">
          <button class="editBtn">✏️ Edit</button>
          <button class="deleteBtn">🗑️ Delete</button>
          <button class="printBtn">🖨️ Print</button>
          <button class="shareBtn">📤 Share</button>
          <button class="qrBtn">🔲 QR Code</button>
        </div>
      `;
      
      // Event listeners
      petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
      petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
      petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));
      petCard.querySelector(".shareBtn").addEventListener("click", () => sharePetCard(profile));
      petCard.querySelector(".qrBtn").addEventListener("click", () => generateQRCode(index));
      
      petCard.querySelectorAll(".mood-btn").forEach(btn => {
      btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
      });

      
      petCard.querySelectorAll(".cover-btn").forEach(btn => {
        btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
      });
      
      DOM.petList.appendChild(petCard);
    });
  }
}

// Calculate days until birthday
function getCountdown(birthday) {
  const today = new Date();
  const nextBirthday = new Date(birthday);
  nextBirthday.setFullYear(today.getFullYear());
  if(nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  return `${diffDays} days until birthday! 🎉`;
}

//get emoji updated 
function getMoodEmoji(mood) {
  const emojiMap = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    excited: "😄",
    relaxed: "😌",
    tired: "😴",
    anxious: "😰",
    playful: "🐾",
    bored: "🥱"
  };
  return emojiMap[mood] || "😐"; // default emoji if mood not found
}

// function logMood new
function logMood(profileIndex, mood) {
  const profile = petProfiles[profileIndex];
  if (!profile) return;

  // Create a new mood entry with today's date
  const newMoodEntry = {
    date: new Date().toISOString().split("T")[0],
    mood: mood
  };
  // Append to moodHistory or create new
  if (!Array.isArray(profile.moodHistory)) {
    profile.moodHistory = [];
  }
  profile.moodHistory.push(newMoodEntry);

  // Save updated profiles to localStorage
  localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

  // Update UI (you may call your renderProfiles or a mood-specific re-render)
  renderProfiles(); // or a more targeted update

  console.log(`Mood "${mood}" logged for profile ${profile.name}`);
}
 // Render Mood Log updated
// Pre-fill mood input with the most recent mood ONLY (optional UX)
const moodInput = document.getElementById("moodHistoryInput");
if (moodInput && profile.moodHistory?.length > 0) {
const latestMood = profile.moodHistory[profile.moodHistory.length - 1];
moodInput.value = '';
}
// Render mood history updated
function renderMoodHistory(profile) {
  if (!profile.moodHistory || profile.moodHistory.length === 0) return "No mood logs yet";
  return profile.moodHistory
    .slice(-7)
    .map(entry => `🗓 ${entry.date} — ${getMoodEmoji(entry.mood)} ${capitalizeMood(entry.mood)}`)
    .join('<br>');
}

function capitalizeMood(mood) {
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
}

// CORE BUTTONS FUNCTIONALITY🌀🌀🌀 
// 🌀 EDIT PROFILE BUTTON FUNCTION
function openEditForm(index) {
uploadedImageUrls = []; // ✅ Reset before populating form to avoid duplication
  isEditing = true;
  currentEditIndex = index;

  const profile = petProfiles[index]; // ✅ MUST define this first
  DOM.profileForm.dataset.coverIndex = profile.coverPhotoIndex ?? 0;

  // Populate form fields
  document.getElementById("petName").value = profile.name;
  document.getElementById("petBreed").value = profile.breed;
  document.getElementById("petDob").value = profile.dob;
  document.getElementById("petBirthday").value = profile.birthday;

  // ✅ PREVIEW EXISTING GALLERY
  const galleryPreview = document.getElementById("editGalleryPreview");
  if (galleryPreview && Array.isArray(profile.gallery)) {
    galleryPreview.innerHTML = profile.gallery.map((img, imgIndex) => {
      const imgUrl = typeof img === "string" ? img : img.url;
      return `
        <div class="gallery-item">
          <img src="${imgUrl}" alt="Pet Photo">
          <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}"
                  data-index="${imgIndex}">★</button>
        </div>
      `;
    }).join("");
  
// ⬇️ Add this listener to track cover selection during editing:
galleryPreview.addEventListener("click", (e) => {
  if (e.target.classList.contains("cover-btn")) {
    const newIndex = parseInt(e.target.dataset.index, 10);
    DOM.profileForm.dataset.coverIndex = newIndex;

    // Update button active styles
    [...galleryPreview.querySelectorAll(".cover-btn")].forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");
      }
    });
  }

  DOM.profileSection.classList.remove("hidden"); 
  DOM.fullPageBanner.classList.add("hidden");
}

// 🌀 UPGRADED DELETE BUTTON FUNCTION WAS MISSING
async function deleteProfile(index) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  const profile = petProfiles[index];

  // Delete from Firestore profile
  if (profile.docId) {
    try {
      await firebase.firestore().collection("profiles").doc(profile.docId).delete();
    } catch (err) {
      console.warn("Failed to delete from Firestore:", err.message);
    }
  }

  // Delete reminder from Firestore
  if (profile.reminderDocId) {
    try {
      await firebase.firestore().collection("reminders").doc(profile.reminderDocId).delete();
    } catch (err) {
      console.warn("Failed to delete reminder from Firestore:", err.message);
    }
  }

  // Delete Cloudinary images (if public_id exists)
  if (Array.isArray(profile.gallery)) {
    for (const image of profile.gallery) {
      if (image.public_id) {
        try {
          await deleteImageFromCloudinary(image.public_id);
        } catch (err) {
          console.warn("Image not deleted from Cloudinary:", err.message);
        }
      }
    }
  }

  // Remove from local storage and update UI
  const deleted = petProfiles.splice(index, 1);
  localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
  renderProfiles();
  Utils.showErrorToUser(`${deleted[0].name}'s profile was deleted.`, true);
}

// 🌀 PRINT PROFILE BUTTON FUNCTION
function printProfile(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  printDocument.write(`
  
    <html>
      <head>
        <title>${profile.name}'s Profile</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        padding: 25px;
        color: #333;
        line-height: 1.5;
      }
      .print-header { 
        text-align: center; 
        margin-bottom: 30px;
        border-bottom: 2px solid #6a0dad;
        padding-bottom: 15px;
      }
      .print-header h1 {
        color: #6a0dad;
        margin-bottom: 5px;
      }
      .print-details {
        background: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .print-details p {
        margin: 8px 0;
      }
      .print-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin: 25px 0;
      }
      .print-gallery img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 6px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        border: 1px solid #eee;
      }
      .print-moodlog {
        background: #f5f5ff;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .print-moodlog h3 {
        color: #6a0dad;
        margin-top: 0;
        border-bottom: 1px dashed #ccc;
        padding-bottom: 8px;
      }
      .print-moodlog ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .print-moodlog li {
        font-size: 16px;
        margin-bottom: 8px;
        padding-left: 25px;
        position: relative;
      }
      .print-moodlog li::before {
        content: attr(data-emoji);
        position: absolute;
        left: 0;
        font-size: 18px;
      }
      .print-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      .print-actions button {
        padding: 10px 20px;
        background: #6a0dad;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }
      .print-actions button:hover {
        background: #5a0b9a;
      }
      @media print {
        .print-actions {
          display: none;
        }
        body {
          padding: 0;
        }
        .print-header {
          border-bottom: none;
        }
         .mood-entry::before {
          content: attr(data-emoji);
          margin-right: 8px;
          font-size: 1.2em;
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
${profile.gallery.map(img => 
  `<img src="${img.url}" alt="Pet photo" onload="this.style.opacity = '1'">`
).join('')}
        </div>
        <div class="print-moodlog">
  <h3>Mood Log</h3>
  <ul>
${profile.moodHistory.map(entry => `
  <li data-emoji="${
    entry.mood === 'happy' ? '😊' : 
    entry.mood === 'sad' ? '😞' : 
    entry.mood === 'angry' ? '😠' : 
    entry.mood === 'sick' ? '🤒' : '😐'
  }">
    ${entry.date}: ${entry.mood}
  </li>
`).join('')}
  </ul>
</div>

      <div class="print-actions">
        <button onclick="window.close()">Close</button>
        <button onclick="
          const link = document.createElement('a');
          link.href = location.href;
          link.download = '${profile.name}_profile.html';
          link.click();
        ">
          Save as HTML
        </button>
      </div>
      <script>
        // Force print dialog when fully loaded
        window.onload = () => setTimeout(() => window.print(), 300);
      </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
    
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

// 🌀 HYBRID OPTIMIZED SHARE PET CARD FUNCTION 🌟🌟🌟
async function sharePetCard(profile, event) {  // Explicitly pass event
  try {
    // 1. Try Web Share API first (link only)
    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${profile.name}! 🐾`,
          text: `Check out ${profile.name}'s profile`,
          url: shareUrl
        });
        return;
      } catch (shareError) {
        console.log("Web Share cancelled, falling back");
      }
    }

    // 2. Generate image fallback
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    if (!cardElement) throw new Error("Card element not found");
    
    // Ensure element is visible for html2canvas
    cardElement.style.opacity = '1';
    cardElement.style.position = 'static';
    
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Ensure all styles are copied
        clonedDoc.getElementById(`pet-card-${profile.id}`).style.visibility = 'visible';
      }
    });

    // 3. Offer both download and copy options
    canvas.toBlob(async (blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      // Auto-download as fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name}_profile.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      alert(`${profile.name}'s profile copied! You can paste the image anywhere.`);
    }, 'image/png');
    
  } catch (error) {
    console.error('Sharing failed:', error);
    alert(`Sharing failed: ${error.message}`);
  }
}

//🌀 QR Code Management 🌟
// Generate QR code
function generateQRCode(profileIndex) {
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];
  const modal = document.getElementById('qr-modal');
  const container = document.getElementById('qrcode-container');
  
  container.innerHTML = '';
  
  try {
    new QRCode(container, {
      text: `${window.location.origin}/?profile=${currentQRProfile.id}`,
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

// Print QR code
function printQR() {
  const printContent = document.querySelector('#qr-modal .printable-area').cloneNode(true);
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
  printWindow.document.write(printContent.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// Download QR code
function downloadQR() {
  const canvas = document.querySelector('#qrcode-container canvas');
  if(canvas) {
    const link = document.createElement('a');
    link.download = `${currentQRProfile?.name || 'pet_profile'}_qr.png`.replace(/[^a-z0-9]/gi, '_');
    link.href = canvas.toDataURL();
    link.click();
  }
}

// Share QR code
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
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showQRStatus('Link copied to clipboard!', true);
    }
  } catch (err) {
    showQRStatus('Sharing failed. Please copy manually.', false);
  }
}

// Initialize QR modal (safe initialization)
function initQRModal() {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;
  
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('qr-print')) {
      printQR();
    } else if (e.target.classList.contains('qr-download')) {
      downloadQR();
    } else if (e.target.classList.contains('qr-share')) {
      shareQR();
    } else if (e.target.classList.contains('qr-close') || 
              (e.target === modal && e.target.classList.contains('modal'))) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

// Show QR status message
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
  
// Log mood
function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  if(!petProfiles[profileIndex].moodHistory) petProfiles[profileIndex].moodHistory = [];
  petProfiles[profileIndex].moodHistory.push({
    date: today,
    mood: mood
  });
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Set cover photo
function setCoverPhoto(profileIndex, imageIndex) {
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}
//✅ FINAL INITIALIZATION ✅
function initDashboard() {
  // ✅ Firestore Synconce dashboard starts
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      console.log("🔁 Syncing pet profiles from Firestore...");
      try {
        const snapshot = await firebase.firestore()
          .collection("profiles")
          .where("userId", "==", user.uid)
          .get();

        petProfiles = snapshot.docs.map(doc => doc.data());
        window.petProfiles = petProfiles;
        localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

        if (typeof renderProfiles === 'function') {
          renderProfiles();
        }
        console.log("📥 Synced profiles from Firestore.");
      } catch (error) {
        console.error("❌ Failed to sync profiles:", error);
        Utils.showErrorToUser("Couldn't load your pet profiles.");
      }
    }
  });
  // Initialize only if required elements exist
  if (window.DOM?.petList) renderProfiles();
  if (document.getElementById('qr-modal')) initQRModal();
  
// logout handler (replaces standalone version)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
// Add profiles handler    
const addBtn = document.getElementById('addPetProfileBtn');
if (addBtn) {
  addBtn.addEventListener('click', () => {
    isEditing = false;
    currentEditIndex = -1;
    DOM.profileSection.classList.remove('hidden');
    DOM.petList.classList.add('hidden');
  });
 }
}
// MOVED FORM SUBMISSION HERE
    console.log("✅ Form submission listener attached."); // <== ✅ Add this
    DOM.profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📨 Submit triggered!");  // <== ✅ Added
    console.log("🧪 Auth before saving:", firebase.auth().currentUser);

      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '⏳ Saving...';
      submitBtn.disabled = true;

      try {
// 🔄 This lets us use userId and newProfileId in both the upload and profile object
const userId = firebase.auth().currentUser?.uid || "anonymous";
const newProfileId = Date.now();

// Handle image uploads
const galleryFiles = Array.from(document.getElementById("petGallery").files);
const uploadedImageUrls = [];

for (const file of galleryFiles) {
  try {
    showLoading(true);
    const result = await uploadToCloudinary(file, userId, newProfileId); // 🔄 MODIFIED TO MATCH FILE PATH
    if (result?.url) {
      uploadedImageUrls.push(result); // Stores full object: url, public_id, etc.
    }
  } catch (uploadError) {
    console.error('Failed to upload image:', uploadError);
    Utils.showErrorToUser(`Failed to upload ${file.name}.`);
  } finally {
    showLoading(false);
  }
}

// Mood history (💡 updated)
const moodInput = document.getElementById("moodHistoryInput");
let moodHistory = [];

if (isEditing && petProfiles[currentEditIndex]?.moodHistory) {
  moodHistory = [...petProfiles[currentEditIndex].moodHistory];
}

const newMoodText = moodInput?.value?.trim();
if (newMoodText) {
  moodHistory.push({
    date: new Date().toISOString().split("T")[0],
    mood: newMoodText
  });
}

// 🔄 Create profile object (initial version without docId/reminderDocId)
const newProfile = {
  id: newProfileId,
  name: document.getElementById("petName").value,
  breed: document.getElementById("petBreed").value,
  dob: document.getElementById("petDob").value,
  birthday: document.getElementById("petBirthday").value,
  moodHistory: moodHistory,
  coverPhotoIndex: parseInt(DOM.profileForm.dataset.coverIndex, 10) || 0,
  // ⛔ Do not assign gallery yet!
};

if (isEditing) {
  newProfile.gallery = [...(petProfiles[currentEditIndex].gallery || [])];
  if (uploadedImageUrls.length > 0) {
    newProfile.gallery = [...newProfile.gallery, ...uploadedImageUrls];
  }
  petProfiles[currentEditIndex] = newProfile;
} else {
  newProfile.gallery = uploadedImageUrls;
  newProfile.coverPhotoIndex = 0; // Default for new profiles
  petProfiles.push(newProfile);
}

// 🔥 FIREBASE SAVE OPERATION
try {
  // A. Save/update profile in Firestore
  let profileDocRef;
  if (isEditing && petProfiles[currentEditIndex].docId) {
    profileDocRef = firebase.firestore()
      .collection("profiles")
      .doc(petProfiles[currentEditIndex].docId);
      
    await profileDocRef.set(newProfile, { merge: true });
    newProfile.docId = petProfiles[currentEditIndex].docId;
  } else {
    profileDocRef = await firebase.firestore()
      .collection("profiles")
      .add({
        userId,
        ...newProfile
      });

    newProfile.docId = profileDocRef.id;
    await profileDocRef.update({ docId: profileDocRef.id });
  }

  // B. Reminder logic
  if (newProfile.birthday) {
    const reminderData = {
      userId,
      petName: newProfile.name,
      date: Utils.formatFirestoreDate(newProfile.birthday),
      message: `It's ${newProfile.name}'s birthday today! 🎉`,
      createdAt: new Date().toISOString(),
      profileDocId: newProfile.docId
    };

    const reminderDoc = await firebase.firestore()
      .collection("reminders")
      .add(reminderData);

    await profileDocRef.update({ reminderDocId: reminderDoc.id });
    newProfile.reminderDocId = reminderDoc.id;
    await reminderDoc.update({ reminderId: reminderDoc.id });
  }

  // ✅ Save to localStorage
  if (isEditing) {
    petProfiles[currentEditIndex] = newProfile;
  } else {
    petProfiles[petProfiles.length - 1] = newProfile;
  }
  localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

  // ✅ Final UI update
  DOM.profileSection.classList.add("hidden");
  DOM.petList.classList.remove("hidden");
  renderProfiles();
  window.scrollTo(0, 0);
  console.log("✅ Profile saved and UI updated.");

} catch (err) {
  console.error("Profile save failed:", err);
  Utils.showErrorToUser("Error saving profile.");
 }
}); // ✅ <-- ADD THIS LINE TO CLOSE THE .addEventListener BLOCK
}      // ❗ this closes initDashboard — must come AFTER all nested logic

// Single logout handler function
async function handleLogout() {
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      await firebase.auth().signOut();
    }
    localStorage.removeItem('petProfiles');
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);
    // Use existing error display method if available
    if (typeof Utils !== 'undefined' && Utils.showErrorToUser) {
      Utils.showErrorToUser("Logout failed. Please try again.");
    } else {
      alert("Logout failed. Please try again.");
    }
  }
}
// Start initialization based on document state
document.addEventListener('DOMContentLoaded', () => {
  initDashboardDOM();      // 🧠 Make sure DOM references are set
  initDashboard();         // ✅ Then run main logic
});
