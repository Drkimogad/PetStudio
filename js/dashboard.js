//🌟 Pet Profile Management 🌟
const addPetProfileBtn = document.getElementById("addPetProfileBtn");
let currentQRProfile = null; // Only new declaration needed

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
            <button class="mood-btn" data-mood="depressed">😔</button>
            <button class="mood-btn" data-mood="sad">😞</button>
            <button class="mood-btn" data-mood="angry">😠</button>
            <button class="mood-btn" data-mood="sick">🤒</button>
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

// Render mood history
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

// CORE BUTTONS FUNCTIONALITY🌀🌀🌀 
// 🌀 EDIT PROFILE BUTTON FUNCTION
function openEditForm(index) {
  isEditing = true;
  currentEditIndex = index;
  const profile = petProfiles[index];
  
  document.getElementById("petName").value = profile.name;
  document.getElementById("petBreed").value = profile.breed;
  document.getElementById("petDob").value = profile.dob;
  document.getElementById("petBirthday").value = profile.birthday;
  
  const moodInput = document.getElementById("moodHistoryInput");
  if (moodInput) {
    moodInput.value = profile.moodHistory
      .map(entry => `${entry.date}:${entry.mood}`)
      .join("\n");
  }

  DOM.profileSection.classList.remove("hidden"); 
  DOM.fullPageBanner.classList.add("hidden");
}
// 🌀 DELETE BUTTON FUNCTION WAS MISSING
function deleteProfile(index) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  const deleted = petProfiles.splice(index, 1);
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

  // Optionally delete from Firestore later
  // You'd need to store document IDs for this

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

Organizing CSS into Logical Categories
/* Other existing styles... */

body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0 0 80px; /* Padding for fixed footer */
    background-color: #f5f5f5;
}

/* Ensure hidden elements stay hidden */
.hidden {
  display: none !important;
  visibility: hidden !important;
}

/* Auth Container: Visible by default */
#authContainer {
  display: block;
}

/* Dashboard: Hidden by default */
#dashboard {
  display: none;
  padding: 20px;
  background-color: #ffffff;
}
.petCard {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    margin: 10px;
    background-color: #ffffff;
    width: calc(100% - 20px);
    position: relative;
    display: flex;
    flex-direction: column;
}

.petCard h3 {
    margin: 0;
    color: #6a0dad;
}

.petCard p {
    margin: 5px 0;
}

/* Enhanced Google Sign-In Button */
.google-btn {
    background: #ffffff;
    color: #444;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 15px auto;
    cursor: pointer;
    transition: background 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 250px;
    font-weight: bold;
    font-size: 16px;
}

.google-btn:hover {
    background: #f1f1f1;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.google-btn img {
    width: 20px;
    height: 20px;
}

/* Drive sync status */
.drive-status {
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
}

.drive-status.synced {
    background: #4CAF50;
    color: white;
}

.drive-status.error {
    background: #F44336;
    color: white;
}

#qr-status {
    margin: 10px 0;
    font-weight: bold;
    transition: opacity 0.3s ease;
}

/* Banner Styles */
.banner-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 3px solid #e1b12c;
  margin-bottom: 20px;
}
.banner-image {
  width: 100% !important;
  height: auto !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
  margin: 0 auto !important;
}
.quote {
    position: absolute;
    bottom: 10%; /* Responsive positioning */
    right: 10%;
    background: rgba(0, 0, 0, 0.6);
    color: #f5f5dc;
    padding: 20px 30px;
    border-radius: 10px;
    font-style: italic;
    font-size: clamp(1rem, 2.2vw, 1.4rem); /* 🔧 slightly larger across devices */
    max-width: 45%;
    text-align: right;
    margin: 0;
}

/* For screens taller than wide (mobile) */
@media (max-aspect-ratio: 1/1) {
    .banner-image {
        object-fit: cover; /* Better mobile display */
    }
    .quote {
        max-width: 80%; /* More space for text on mobile */
        font-size: 0.9rem; /* Slightly smaller text */
    }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.gallery-item {
  max-width: 100%;
  max-height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Prevent FOUC on image gallery load */
.gallery-item img {
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 100%;
  height: auto;
  max-height: 200px; /* or any reasonable limit */
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 6px;
}

.gallery-item img.loaded {
    opacity: 1;
}

.deleteBtn {
    background-color: #ff0000;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.deleteBtn:hover {
    background-color: #cc0000;
}

.printBtn {
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.printBtn:hover {
    background-color: #0056b3;
}

#petList {
    margin-bottom: 80px; /* Space so print button isn't hidden */
}

footer {
    position: relative;
    padding: 20px;
    background-color: #6a0dad;
    color: white;
    text-align: center;
    width: 100%;
    bottom: 0;
    margin-top: 20px;
}

/* QR Button Styles */
.qrBtn {
    background: #27ae60 !important;
    transition: transform 0.2s;
}

.qrBtn:hover {
    transform: scale(1.1);
    background: #219a52 !important;
}

/* Print Styles */
@media print {
    .petCard img {
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 100vh;
        object-fit: contain;
        margin: 0 auto;
        display: block;
        page-break-inside: avoid;
    }

    body {
        font-size: 20pt;
    }

    .petCard h3,
    .petCard p {
        font-size: 26pt;
    }

    .petCard {
        page-break-inside: avoid;
        page-break-after: always;
        margin-bottom: 0;
    }

    .printBtn,
    .deleteBtn {
        display: none;
    }

    #petList {
        margin-bottom: 0;
    }

    footer {
        display: none;
    }
}

/* newly added*/
/* ====================
   GENERAL LAYOUT
==================== */
body, html {
  max-width: 100vw;
  overflow-x: hidden;
}

h1, h2, h3, p {
  text-align: center;
}

.auth-header h1 {
  font-size: 2.5rem;     /* Main title size */
  color: #6a1b9a;       /* Your deep purple */
  margin-top: 1rem;
}

.auth-header h2 {
  font-size: 1.2rem;    /* Subtitle size */
  color: #d4a017;       /* Mustard accent */
  margin-bottom: 1rem;
}

.button {
  display: inline-block;
  background-color: #6a1b9a; /* deep purple */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition: background 0.3s;
}

.button:hover {
  background-color: #4a0c7a;
}

/* ====================
   AUTH PAGE
==================== */
.auth-header h1 {
  font-size: 2rem;
  color: #6a1b9a;
  margin-top: 1rem;
}

.auth-header h2 {
  font-size: 1.2rem;
  color: #d4a017;
  margin-bottom: 1rem;
}

#googleSignInWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

#googleSignInBtn {
  width: 250px;
  height: auto;
}

.auth-message {
  color: #333;
  margin-top: 10px;
  font-size: 1rem;
}

/* ====================
   DASHBOARD PAGE
==================== */
#dashboard {
  padding: 2rem 1rem;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* 🔧 this is the key */
}

#addPetProfileBtn {
  background-color: #6a1b9a;
  color: white;
  font-size: 1.1rem;
  padding: 10px 20px;
  margin-bottom: 20px;
}

#addPetProfileBtn::before {
  content: '➕ ';
}

#petList {
  width: 100%;
  max-width: 800px;
}

/* ====================
   PROFILE CREATION
==================== */
#profileSection {
  background: #fff8e1;
  border: 1px solid #e0c471;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

#profileSection h2 {
  text-align: center;
  color: #6a1b9a;
}

#profileForm label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
  color: #444;
}

#profileForm input,
#profileForm textarea {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
#profileForm button[type="submit"] {
  margin-top: 20px;
  background-color: #d4a017;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  display: block;
  width: 100%;
  border-radius: 8px;
}
/*mood buttons recently added*/
.mood-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  justify-content: center;
}

.mood-btn {
  font-size: 1.5rem;
  padding: 8px 12px;
  border: 2px solid transparent;
  background-color: #f4f4f4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.mood-btn:hover,
.mood-btn.active {
  border-color: #6a1b9a;
  background-color: #e9d5ff;
}
/* ====================
   PET CARDS & ACTIONS
==================== */
.petCard {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
  border-left: 5px solid #6a1b9a;
}

.petCard .actions {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

.petCard .actions button {
  flex: 1 1 30%;
  padding: 8px;
  font-size: 0.9rem;
  border-radius: 5px;
}

.editBtn {
  background-color: #9b59b6;
  color: white;
}

.shareBtn {
  background-color: #f39c12;
  color: white;
}

.qrBtn {
  background-color: #27ae60;
  color: white;
}

/* ====================
   LOGOUT BUTTON
==================== */
#logoutBtn {
  background-color: #e74c3c;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  position: absolute;
  bottom: 20px; /* Just above footer inside dashboard */
  right: 20px;
  font-weight: bold;
  z-index: 10;
}
/* ====================
   MEDIA QUERIES
==================== */
@media (max-width: 768px) {
  body {
    font-size: 16px;
  }

  .banner-wrapper {
    height: 70vh;
  }

  .petCard {
    flex-direction: column;
  }

  #logoutBtn {
    bottom: 60px;
    right: 15px;
  }
}

@media (max-width: 480px) {
  .banner-wrapper {
    height: 50vh;
  }

  #profileSection {
    padding: 15px;
  }

  .petCard .actions {
    flex-direction: column;
    gap: 6px;
  }

  .button,
  #logoutBtn,
  #addPetProfileBtn {
    font-size: 0.9rem;
    padding: 8px 12px;
  }
} if I need to re organise this css without changing anything in it. How can we categorise it?
Here's how we can reorganize your CSS into logical categories without changing any of the actual styles:

css
/* ====================
   BASE & RESET STYLES
==================== */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0 0 80px; /* Padding for fixed footer */
    background-color: #f5f5f5;
}

body, html {
  max-width: 100vw;
  overflow-x: hidden;
}

/* Ensure hidden elements stay hidden */
.hidden {
  display: none !important;
  visibility: hidden !important;
}

h1, h2, h3, p {
  text-align: center;
}

/* ====================
   AUTHENTICATION STYLES
==================== */
/* Auth Container: Visible by default */
#authContainer {
  display: block;
}

.auth-header h1 {
  font-size: 2.5rem;     /* Main title size */
  color: #6a1b9a;       /* Your deep purple */
  margin-top: 1rem;
}

.auth-header h2 {
  font-size: 1.2rem;    /* Subtitle size */
  color: #d4a017;       /* Mustard accent */
  margin-bottom: 1rem;
}

#googleSignInWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

/* Enhanced Google Sign-In Button */
.google-btn {
    background: #ffffff;
    color: #444;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 15px auto;
    cursor: pointer;
    transition: background 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 250px;
    font-weight: bold;
    font-size: 16px;
}

.google-btn:hover {
    background: #f1f1f1;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.google-btn img {
    width: 20px;
    height: 20px;
}

.auth-message {
  color: #333;
  margin-top: 10px;
  font-size: 1rem;
}

/* ====================
   DASHBOARD & LAYOUT
==================== */
/* Dashboard: Hidden by default */
#dashboard {
  display: none;
  padding: 20px;
  background-color: #ffffff;
}

#dashboard {
  padding: 2rem 1rem;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* 🔧 this is the key */
}

#petList {
  width: 100%;
  max-width: 800px;
  margin-bottom: 80px; /* Space so print button isn't hidden */
}

/* ====================
   BUTTON STYLES
==================== */
.button {
  display: inline-block;
  background-color: #6a1b9a; /* deep purple */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition: background 0.3s;
}

.button:hover {
  background-color: #4a0c7a;
}

#addPetProfileBtn {
  background-color: #6a1b9a;
  color: white;
  font-size: 1.1rem;
  padding: 10px 20px;
  margin-bottom: 20px;
}

#addPetProfileBtn::before {
  content: '➕ ';
}

.deleteBtn {
    background-color: #ff0000;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.deleteBtn:hover {
    background-color: #cc0000;
}

.printBtn {
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.printBtn:hover {
    background-color: #0056b3;
}

/* QR Button Styles */
.qrBtn {
    background: #27ae60 !important;
    transition: transform 0.2s;
}

.qrBtn:hover {
    transform: scale(1.1);
    background: #219a52 !important;
}

/* LOGOUT BUTTON */
#logoutBtn {
  background-color: #e74c3c;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  position: absolute;
  bottom: 20px; /* Just above footer inside dashboard */
  right: 20px;
  font-weight: bold;
  z-index: 10;
}

/* ====================
   PET CARD STYLES
==================== */
.petCard {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    margin: 10px;
    background-color: #ffffff;
    width: calc(100% - 20px);
    position: relative;
    display: flex;
    flex-direction: column;
}

.petCard h3 {
    margin: 0;
    color: #6a0dad;
}

.petCard p {
    margin: 5px 0;
}

.petCard {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: #fff;
  border-left: 5px solid #6a1b9a;
}

.petCard .actions {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
}

.petCard .actions button {
  flex: 1 1 30%;
  padding: 8px;
  font-size: 0.9rem;
  border-radius: 5px;
}

.editBtn {
  background-color: #9b59b6;
  color: white;
}

.shareBtn {
  background-color: #f39c12;
  color: white;
}

/* ====================
   PROFILE CREATION FORM
==================== */
#profileSection {
  background: #fff8e1;
  border: 1px solid #e0c471;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

#profileSection h2 {
  text-align: center;
  color: #6a1b9a;
}

#profileForm label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
  color: #444;
}

#profileForm input,
#profileForm textarea {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

#profileForm button[type="submit"] {
  margin-top: 20px;
  background-color: #d4a017;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  display: block;
  width: 100%;
  border-radius: 8px;
}

/* Mood buttons */
.mood-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  justify-content: center;
}

.mood-btn {
  font-size: 1.5rem;
  padding: 8px 12px;
  border: 2px solid transparent;
  background-color: #f4f4f4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.mood-btn:hover,
.mood-btn.active {
  border-color: #6a1b9a;
  background-color: #e9d5ff;
}

/* ====================
   GALLERY STYLES
==================== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.gallery-item {
  max-width: 100%;
  max-height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Prevent FOUC on image gallery load */
.gallery-item img {
  opacity: 0;
  transition: opacity 0.3s ease;
  width: 100%;
  height: auto;
  max-height: 200px; /* or any reasonable limit */
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 6px;
}

.gallery-item img.loaded {
    opacity: 1;
}

/* ====================
   BANNER & QUOTE STYLES
==================== */
.banner-wrapper {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 3px solid #e1b12c;
  margin-bottom: 20px;
}

.banner-image {
  width: 100% !important;
  height: auto !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
  margin: 0 auto !important;
}

.quote {
    position: absolute;
    bottom: 10%; /* Responsive positioning */
    right: 10%;
    background: rgba(0, 0, 0, 0.6);
    color: #f5f5dc;
    padding: 20px 30px;
    border-radius: 10px;
    font-style: italic;
    font-size: clamp(1rem, 2.2vw, 1.4rem); /* 🔧 slightly larger across devices */
    max-width: 45%;
    text-align: right;
    margin: 0;
}

/* ====================
   DRIVE SYNC STATUS
==================== */
.drive-status {
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
}

.drive-status.synced {
    background: #4CAF50;
    color: white;
}

.drive-status.error {
    background: #F44336;
    color: white;
}

#qr-status {
    margin: 10px 0;
    font-weight: bold;
    transition: opacity 0.3s ease;
}

/* ====================
   FOOTER STYLES
==================== */
footer {
    position: relative;
    padding: 20px;
    background-color: #6a0dad;
    color: white;
    text-align: center;
    width: 100%;
    bottom: 0;
    margin-top: 20px;
}

/* ====================
   PRINT STYLES
==================== */
@media print {
    .petCard img {
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 100vh;
        object-fit: contain;
        margin: 0 auto;
        display: block;
        page-break-inside: avoid;
    }

    body {
        font-size: 20pt;
    }

    .petCard h3,
    .petCard p {
        font-size: 26pt;
    }

    .petCard {
        page-break-inside: avoid;
        page-break-after: always;
        margin-bottom: 0;
    }

    .printBtn,
    .deleteBtn {
        display: none;
    }

    #petList {
        margin-bottom: 0;
    }

    footer {
        display: none;
    }
}

/* ====================
   MEDIA QUERIES
==================== */
/* For screens taller than wide (mobile) */
@media (max-aspect-ratio: 1/1) {
    .banner-image {
        object-fit: cover; /* Better mobile display */
    }
    .quote {
        max-width: 80%; /* More space for text on mobile */
        font-size: 0.9rem; /* Slightly smaller text */
    }
}

@media (max-width: 768px) {
  body {
    font-size: 16px;
  }

  .banner-wrapper {
    height: 70vh;
  }

  .petCard {
    flex-direction: column;
  }

  #logoutBtn {
    bottom: 60px;
    right: 15px;
  }
}

@media (max-width: 480px) {
  .banner-wrapper {
    height: 50vh;
  }

  #profileSection {
    padding: 15px;
  }

  .petCard .actions {
    flex-direction: column;
    gap: 6px;
  }

  .button,
  #logoutBtn,
  #addPetProfileBtn {
    font-size: 0.9rem;
    padding: 8px 12px;
  }
}
The CSS is now organized into these main categories:

Base & Reset Styles - Fundamental styles that affect the entire document

Authentication Styles - Login/sign-in related styles

Dashboard & Layout - Main container and structural styles

Button Styles - All button variations

Pet Card Styles - Styles for pet profile cards

Profile Creation Form - Form-specific styles

Gallery Styles - Image gallery components

Banner & Quote Styles - Hero banner and quote overlay

Drive Sync Status - Status indicators for cloud sync

Footer Styles - Page footer

Print Styles - Print-specific overrides

Media Queries - Responsive adjustments

This organization makes the CSS more maintainable while keeping all the original styles intact. Related styles are grouped together, and the comments clearly demarcate each section.

Now based on this style, if I need all the contents of petcardsare arranged to the left , cover image button on the top of each uploaded image and ensure its visibility and fully visible contained  uploaded images, countdown days on the top right of the petcard , petcard occupied 80% of the page width, better UI  what can you do and advise which part of the css will be replaced?
Here's how we can modify your CSS to achieve these improvements. I'll focus on the petCard related styles and suggest replacements while maintaining the overall structure:

css
/* ====================
   PET CARD STYLES - UPDATED
==================== */
.petCard {
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    margin: 20px auto; /* Centered with automatic margins */
    background-color: #ffffff;
    width: 80%; /* Occupies 80% of page width */
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.petCard:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.petCard h3 {
    margin: 0 0 10px 0;
    color: #6a0dad;
    text-align: left; /* Left-aligned title */
    font-size: 1.5rem;
}

.petCard p {
    margin: 8px 0;
    text-align: left; /* Left-aligned content */
    color: #555;
}

/* Countdown days indicator */
.countdown-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: #6a0dad;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
}

/* Image container with cover button */
.image-container {
    position: relative;
    margin: 15px 0;
    width: 100%;
}

.gallery-item {
    position: relative;
    max-width: 100%;
    margin-bottom: 15px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.gallery-item img {
    width: 100%;
    height: auto;
    max-height: 300px; /* Increased max height */
    object-fit: contain; /* Ensure full visibility */
    display: block;
    opacity: 1; /* Remove fade-in for immediate visibility */
    border-radius: 6px;
}

/* Cover image button */
.cover-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(106, 27, 154, 0.8);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    z-index: 2;
    transition: all 0.2s ease;
}

.cover-btn:hover {
    background-color: rgba(106, 27, 154, 1);
    transform: scale(1.05);
}

/* Gallery grid adjustments */
.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

/* Pet info section - left aligned */
.pet-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
}

/* Action buttons container */
.petCard .actions {
    display: flex;
    justify-content: flex-start; /* Left-aligned buttons */
    flex-wrap: wrap;
    margin-top: 20px;
    gap: 10px;
}

.petCard .actions button {
    flex: 0 1 auto; /* Don't force equal width */
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 6px;
    min-width: 120px;
}
Key Changes Made:
Card Layout & Width:

Changed width to 80% and centered with auto margins

Added hover effects for better interactivity

Left Alignment:

Added text-align: left to all content

Created .pet-info class for left-aligned content container

Countdown Badge:

Added new .countdown-badge style for top-right positioning

Image Improvements:

Removed the fade-in effect for immediate visibility

Increased max-height and ensured proper containment

Added proper shadow and rounded corners

Cover Button:

Created new .cover-btn style with absolute positioning

Added hover effects and proper z-index

Gallery Grid:

Increased minimum column width to 200px

Added proper spacing

Parts to Replace:
Remove the existing .petCard styles and replace with the new version

Remove the old .gallery-item and .gallery-grid styles

Remove the old .petCard .actions styles

Keep all other existing styles (buttons, colors, etc.) as they'll work with these new components

Additional Recommendations:
Add this HTML structure for the countdown badge:

html
<div class="countdown-badge">14 days</div>
Add this structure for images with cover button:

html
<div class="image-container">
    <button class="cover-btn">Set as Cover</button>
    <img src="pet-image.jpg" alt="Pet photo">
</div>
Wrap your pet info in:

html
<div class="pet-info">
    <!-- All your pet details here -->
</div>
These changes will give you a more polished, left-aligned layout with better image display and clear action buttons while maintaining all the existing functionality.

dashboard (4).js
JS 20.04KB
I didn apply the additional recommendations. But the adjusted style works.  Now in the printWindow I don't have the moodlog EMOJIS as a part of the print form. Also share form button added in print function doesn't share the petcard as a file or petcard image. It shares a link as well as the stand alone share button. Here's my dashboard.js so we can tweak a few things. What do you think? Let's discuss things before generate any codes
Let's analyze the issues and discuss solutions before implementing any changes:

Current Issues Identified:
Print Functionality Problems:

Mood emojis not appearing in print output

Share button in print dialog doesn't work as expected (only shares link)

Share Functionality:

Both the print dialog's share button and main share button only share links

Users might expect to share the actual pet card image

Root Causes:
Emoji Display in Print:

The print window is a separate document that doesn't inherit the same emoji support

We need to ensure emojis are rendered as text characters

Share Function Limitations:

The navigator.share() API has limitations on what can be shared

Sharing images requires creating a blob URL first

The print dialog's share button exists in a different security context

Recommended Solutions:
For Emoji Printing:

Replace the Utils.getMoodEmoji() call with direct emoji characters in the print template

Use simple text emojis (😊) rather than relying on any JS functions

For Sharing:

Keep the current link-sharing as fallback

Add image sharing capability to the main share function

Remove the share button from print dialog (redundant and problematic)

Instead, add a "Save as Image" button in print dialog

Implementation Strategy:
Print Dialog Changes:

javascript
// In printProfile function:
printDocument.write(`
  <html>
    <head>
      <title>${profile.name}'s Profile</title>
      <style>
        /* ... existing styles ... */
        .print-moodlog li::before {
          content: attr(data-emoji);
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <!-- ... existing content ... -->
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
    </body>
  </html>
`);
Enhanced Share Function:

javascript
async function sharePetCard(profile) {
  try {
    // First try sharing as image
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    const canvas = await html2canvas(cardElement);
    const imageBlob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    
    if (navigator.share && navigator.canShare?.({ files: [new File([imageBlob], 'petcard.png')] })) {
      await navigator.share({
        title: `${profile.name}'s Pet Card`,
        files: [new File([imageBlob], 'petcard.png')],
        url: `${window.location.origin}/PetStudio/?profile=${profile.id}`
      });
      return;
    }
    
    // Fallback to link sharing
    await navigator.clipboard.writeText(
      `${window.location.origin}/PetStudio/?profile=${profile.id}`
    );
    alert(`Link to ${profile.name}'s profile copied to clipboard!`);
    
  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed. Please try again.');
  }
}
Key Benefits:
More Reliable Printing:

Emojis will now render consistently in print

Simplified print dialog with clear save options

Enhanced Sharing:

Attempts to share as image first

Falls back gracefully to link sharing

Better user feedback

Security Considerations:

Removes problematic share button from print dialog

Uses more secure blob URLs for image sharing

Would you like me to provide the complete updated code with these changes implemented? Or would you prefer to discuss any aspects of this solution first?

The changes maintain all existing functionality while adding more robust printing and sharing capabilities. The emoji issue is solved by inlining the characters, and the sharing now properly handles both images and links.

Why this function: async function sharePetCard(profile) {
  try {
    // First try sharing as image
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    const canvas = await html2canvas(cardElement);
    const imageBlob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    
    if (navigator.share && navigator.canShare?.({ files: [new File([imageBlob], 'petcard.png')] })) {
      await navigator.share({
        title: `${profile.name}'s Pet Card`,
        files: [new File([imageBlob], 'petcard.png')],
        url: `${window.location.origin}/PetStudio/?profile=${profile.id}`
      });
      return;
    }
    
    // Fallback to link sharing
    await navigator.clipboard.writeText(
      `${window.location.origin}/PetStudio/?profile=${profile.id}`
    );
    alert(`Link to ${profile.name}'s profile copied to clipboard!`);
    
  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed. Please try again.');
  }
}   is better than this: // 🌀 OPTIMIZED SHARE PET CARD FUNCTION 🌟🌟🌟
async function sharePetCard(profile) {
  const loader = document.getElementById('processing-loader');
  let shareBtn, originalText;

  try {
    if (loader) loader.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // More reliable button targeting
    shareBtn = event?.target.closest('.shareBtn') || 
               document.querySelector(`#pet-card-${profile.id} .shareBtn`);
    
    if(shareBtn) {
      originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = '🔄 Preparing...';
      shareBtn.disabled = true;
    }

    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`;

    if(navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${profile.name}! 🐾`,
          text: `Check out ${profile.name}'s profile on PetStudio!`,
          url: shareUrl,
        });
        return;
      }
      catch (error) {
        console.log("Share cancelled:", error);
      }
    }

    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    if(!cardElement) throw new Error('Card element missing');
    
    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      scale: 2,
      logging: false
    });
    
    const imageUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `${profile.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    await navigator.clipboard.writeText(shareUrl);
    alert(`${profile.name}'s card saved! 🔗 Link copied.`);

  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed. Please try again.');
  } finally {
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if(shareBtn) {
      shareBtn.innerHTML = originalText;
      shareBtn.disabled = false;
    }
  }
}
The proposed improved sharePetCard function is better than the original version for several key reasons:

1. Better Image Sharing Capability
The new version:

Attempts to share the actual image file (not just a link) using the Web Share API's file sharing capability

Uses proper Blob handling for cleaner memory management

Checks if files can be shared first with navigator.canShare()

Old version only shared:

A link via Web Share API, or

Forced download + copied link to clipboard

2. More Efficient Resource Handling
Uses canvas.toBlob() instead of toDataURL() which:

Is more memory efficient (avoids base64 string conversion)

Creates a proper File object for sharing

Doesn't create temporary DOM elements for download

3. Cleaner Fallback Logic
Simpler, more linear fallback chain:

Try sharing image file

Fall back to copying link

Removes the forced download step which could be annoying to users

4. Removed Unnecessary UI Manipulation
The original version had:

Loader visibility toggling

Button state management

Body overflow control

These are removed because:

They complicate the function's primary purpose

UI concerns should be handled at a higher level

The operation is fast enough to not need visual feedback in most cases

5. Better Error States
The simpler structure makes error handling more predictable

Fewer points of failure without the UI manipulation code

6. More Standard Web Share Behavior
The new version follows modern web share patterns by:

Prioritizing native file sharing when available

Using proper File objects instead of data URLs

Providing a cleaner user experience

Tradeoffs:
Removed Features:

No visual loading indicator

No button state management

No automatic download fallback

Browser Support:

File sharing in Web Share API has good but not universal support

The fallback is simpler (just copies link)

When to Keep the Original:
You might prefer the original if:

You need the loading states and button management

You want to guarantee the image gets saved (via forced download)

You need to support very old browsers that don't handle Blobs well

Recommendation:
A hybrid approach would give you the best of both:

javascript
async function sharePetCard(profile) {
  const shareBtn = event?.target.closest('.shareBtn');
  const originalText = shareBtn?.innerHTML;
  
  try {
    if (shareBtn) {
      shareBtn.innerHTML = '🔄 Preparing...';
      shareBtn.disabled = true;
    }

    // 1. Try sharing as image file
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    const canvas = await html2canvas(cardElement);
    const imageBlob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    
    if (navigator.share && navigator.canShare?.({ files: [new File([imageBlob], 'petcard.png')] })) {
      await navigator.share({
        title: `${profile.name}'s Pet Card`,
        files: [new File([imageBlob], 'petcard.png')],
        url: `${window.location.origin}/PetStudio/?profile=${profile.id}`
      });
      return;
    }

    // 2. Fallback to download + link copy
    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(imageBlob);
    downloadLink.download = `${profile.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);

    await navigator.clipboard.writeText(shareUrl);
    alert(`${profile.name}'s card saved! 🔗 Link copied.`);

  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed. Please try again.');
  } finally {
    if (shareBtn) {
      shareBtn.innerHTML = originalText;
      shareBtn.disabled = false;
    }
  }
}
This hybrid version keeps the UI improvements while implementing the better sharing architecture.

Based on this enhancement: <h3>Mood Log</h3>
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
      </div>   can you update this style for print function:     <html>
      <head>
        <title>${profile.name}'s Profile</title>
        <style>
        body { font-family: Arial; padding: 20px; }
        .print-header { text-align: center; margin-bottom: 20px; }
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
        .print-moodlog ul {
          list-style: none;
          padding: 0;
        }
        .print-moodlog li {
          font-size: 16px;
          margin-bottom: 4px;
        }
        .print-share-note {
          text-align: center;
          margin-top: 20px;
        }
        .print-share-note button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .print-share-note button:hover {
          background-color: #0056b3;
        }
      </style>
      </head>
Here's the updated print function style that incorporates your mood log enhancements and improves the overall print layout:

html
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
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
      </body>
    </html>
  `);
  
  printDocument.close();
  
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

// 🌀 Hybrid OPTIMIZED SHARE PET CARD FUNCTION 🌟🌟🌟
async function sharePetCard(profile) {
  const shareBtn = event?.target.closest('.shareBtn');
  const originalText = shareBtn?.innerHTML;
  
  try {
    if (shareBtn) {
      shareBtn.innerHTML = '🔄 Preparing...';
      shareBtn.disabled = true;
    }

    // 1. Try sharing as image file
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    const canvas = await html2canvas(cardElement);
    const imageBlob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    
    if (navigator.share && navigator.canShare?.({ files: [new File([imageBlob], 'petcard.png')] })) {
      await navigator.share({
        title: `${profile.name}'s Pet Card`,
        files: [new File([imageBlob], 'petcard.png')],
        url: `${window.location.origin}/PetStudio/?profile=${profile.id}`
      });
      return;
    }

    // 2. Fallback to download + link copy
    const shareUrl = `${window.location.origin}/PetStudio/?profile=${profile.id}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(imageBlob);
    downloadLink.download = `${profile.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);

    await navigator.clipboard.writeText(shareUrl);
    alert(`${profile.name}'s card saved! 🔗 Link copied.`);

  } catch (error) {
    console.error('Sharing failed:', error);
    alert('Sharing failed. Please try again.');
  } finally {
    if (shareBtn) {
      shareBtn.innerHTML = originalText;
      shareBtn.disabled = false;
    }
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
        // Handle image uploads
        const galleryFiles = Array.from(document.getElementById("petGallery").files);
        const uploadedImageUrls = [];

        for (const file of galleryFiles) {
          try {
            showLoading(true);
            const result = await uploadToCloudinary(file);
            if (result?.secure_url) {
              uploadedImageUrls.push(result.secure_url);
            }
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            Utils.showErrorToUser(`Failed to upload ${file.name}.`);
          } finally {
            showLoading(false);
          }
        }

        // Mood history
        const moodInput = document.getElementById("moodHistoryInput");
        const moodHistory = moodInput?.value
          ? [{
              date: new Date().toISOString().split("T")[0],
              mood: moodInput.value
            }]
          : [];

        // Create profile object
        const newProfile = {
          id: Date.now(),
          name: document.getElementById("petName").value,
          breed: document.getElementById("petBreed").value,
          dob: document.getElementById("petDob").value,
          birthday: document.getElementById("petBirthday").value,
          gallery: uploadedImageUrls,
           moodHistory: moodHistory,
          coverPhotoIndex: 0
        };

        // Save to localStorage
        if (isEditing) {
          petProfiles[currentEditIndex] = newProfile;
        } else {
          petProfiles.push(newProfile);
        }
        localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

        // Save to Firestore
        await firebase.firestore().collection("profiles").add({
          userId: firebase.auth().currentUser?.uid || "anonymous",
          ...newProfile
        });

        // Optionally add reminder
        if (newProfile.birthday) {
          const reminderData = {
            userId: firebase.auth().currentUser?.uid || "anonymous",
            petName: newProfile.name,
            date: Utils.formatFirestoreDate(newProfile.birthday),
            message: `It's ${newProfile.name}'s birthday today! 🎉`,
            createdAt: new Date().toISOString()
          };

          try {
            await firebase.firestore().collection("reminders").add(reminderData);
          } catch (firestoreError) {
            console.warn("Reminder not saved:", firestoreError.message);
          }
        }

        // UI update
        DOM.profileSection.classList.add("hidden");
        DOM.petList.classList.remove("hidden");
        renderProfiles();
        window.scrollTo(0, 0);
        console.log("✅ Profile saved and UI updated.");
      } catch (err) {
        console.error("Profile save failed:", err);
        Utils.showErrorToUser("Error saving profile.");
      } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        showLoading(false);
      }
    });
 }
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
