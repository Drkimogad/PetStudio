// 🌟 Global declarations 🌟
let currentQRProfile = null;
let generatingQR = false;
let sessionExpiryTimer = null; // Add this for session timeout tracking
const SESSION_EXPIRY_MINUTES = 30; // Session expires after 30 minutes of inactivity
setupPetProfileDelegation();
// Add this:
const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeModal();
};

// ===== SESSION RECOVERY WITH EXPIRY =====
function initSessionRecovery() {
  // Check for existing session
  const sessionData = JSON.parse(sessionStorage.getItem('petStudioSession'));
  
  if (sessionData) {
    // Check if session is expired
    const now = new Date();
    const expiry = new Date(sessionData.expiry);
    
    if (now < expiry) {
      // Session is valid - restore state
      isEditing = sessionData.isEditing;
      currentEditIndex = sessionData.currentEditIndex;
      uploadedImageUrls = sessionData.uploadedImageUrls || [];
      
      // Reset expiry timer
      resetSessionTimer();
      
      // If we were editing, reopen the form
      if (isEditing) {
        setTimeout(() => {
          openEditForm(currentEditIndex);
        }, 500); // Small delay to allow DOM to initialize
      }
      
      console.log("Session restored successfully");
    } else {
      // Session expired - clear it
      clearSession();
      console.log("Expired session cleared");
    }
  }
}

function saveSession() {
  const now = new Date();
  const expiry = new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000);
  
  const sessionData = {
    isEditing,
    currentEditIndex,
    uploadedImageUrls,
    expiry: expiry.toISOString()
  };
  
  sessionStorage.setItem('petStudioSession', JSON.stringify(sessionData));
  resetSessionTimer();
  console.log("Session saved");
}

function clearSession() {
  sessionStorage.removeItem('petStudioSession');
  if (sessionExpiryTimer) {
    clearTimeout(sessionExpiryTimer);
    sessionExpiryTimer = null;
  }
  console.log("Session cleared");
}

function resetSessionTimer() {
  if (sessionExpiryTimer) {
    clearTimeout(sessionExpiryTimer);
  }
  
  sessionExpiryTimer = setTimeout(() => {
    clearSession();
    if (isEditing) {
      // If session expires while editing, cancel the edit
      cancelEdit();
      Utils.showErrorToUser("Your session has expired. Please start again.");
    }
  }, SESSION_EXPIRY_MINUTES * 60000);
}

// Add activity listeners to reset timer on user interaction
['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
  document.addEventListener(event, resetSessionTimer, { passive: true });
});


// 🌍 Load from localStorage only on initial boot
if (!window.petProfiles || !Array.isArray(window.petProfiles) || window.petProfiles.length === 0) {
  let savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  window.petProfiles = savedProfiles;
}

// SAFE GLOBAL INITIALIZATION (compatible with auth.js)
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

// ======================
// 🎨 THEME CONFIGURATION (Global)
// ======================
const THEMES = {
  balloons: { 
    emoji: '🎈',
    class: 'theme-balloons',
    bgColor: '#ffebee',  // Light red
    textColor: '#d32f2f',
    border: '2px dashed #f44336'
  },
  paws: {
    emoji: '🐾',
    class: 'theme-paws',
    bgColor: '#e8f5e9',  // Light green
    textColor: '#2e7d32',
    border: '2px dotted #4caf50'
  },
  party: {
    emoji: '🎊',
    class: 'theme-party',
    bgColor: '#fff3e0',  // Light orange
    textColor: '#e65100',
    border: '2px solid #ff9800'
  },
  elegant: {
    emoji: '✨',
    class: 'theme-elegant',
    bgColor: '#f3e5f5',  // Light purple
    textColor: '#7b1fa2',
    border: '1px solid #9c27b0'
  },
  minimal: {
    emoji: '🎂',
    class: 'theme-minimal',
    bgColor: '#ffffff',  // Pure white
    textColor: '#212121',
    border: '1px solid #bdbdbd'
  }
};

// Optional: Default theme fallback
const DEFAULT_THEME = 'balloons';


// ==============================
// 🎨 previewTheme() - Live Theme Preview
// ==============================
function previewTheme(selectedTheme) {
  // Visual selection
  document.querySelectorAll('.theme-preview').forEach(el => {
    el.classList.toggle('selected-theme', el.classList.contains(`${selectedTheme}-mini`));
  });
  
  // Live card preview (if on edit screen)
  if (isEditing) {
    const previewCard = document.querySelector(`.petCard[data-index="${currentEditIndex}"]`);
    if (previewCard) applyTheme(previewCard, selectedTheme);
  }
}
//======================================
// Helper for theme-specific icons
//=======================================
function getThemeIcon(theme) {
  const icons = {
    balloons: '🎈',
    paws: '🐾',
    party: '🎊',
    elegant: '✨',
    minimal: '🎂'
  };
  return icons[theme] || '🎉';
}

// ======================
// URL VALIDATION UTILITY
// ======================
/**
 * Validates image URLs with Cloudinary checks
 * @param {string} url - Image URL to validate
 * @returns {string} - Original URL if valid, placeholder if invalid
 */
function validateImageUrl(url) {
  if (!url) return ''; // Return empty if no URL
  
  // Check for Cloudinary URLs or data URIs
  const isCloudinary = url.includes('res.cloudinary.com');
  const isDataUri = url.startsWith('data:image/');
  
  return (isCloudinary || isDataUri) ? url : '';
}

//========================
// R 🎨 RENDERING ===================================
// LOADSAVEDPROFILES()
//==========================
function loadSavedProfiles() {
  // ➡️ ADD THIS LINE to use the correct data and trace actual rendering
  const petProfiles = window.petProfiles || []; // 👈 Always check window.petProfiles
  console.log("✅ Rendering profiles count:", petProfiles.length);

  if (!DOM.petList) {
    console.error("❌ petList not found");
    return;
  }

  DOM.petList.innerHTML = '';
  if (petProfiles.length === 0) {
    DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
    return;
    
  } else {
    petProfiles.forEach((profile, index) => {
      // Ensure gallery exists and is initialized
      if (!profile.gallery) {
        console.warn(`Initializing empty gallery for profile ${profile.id}`);
        profile.gallery = [];
        petProfiles[index] = profile; // Update the array
      }

      const petCard = document.createElement("div");
      petCard.classList.add("petCard");
      petCard.style.marginBottom = "2rem";
      petCard.id = `pet-card-${profile.id}`;

      // ✅ Support both object-based and string-based gallery entries
      const coverImageObj = profile.gallery?.[profile.coverPhotoIndex];
       //validate coverphoto url
      const coverPhotoUrl = validateImageUrl(
      typeof coverImageObj === "string" ? coverImageObj : coverImageObj?.url
      );
  // using coverphoto as a header background
      const petCardHeaderStyle = coverPhotoUrl 
  ? `background-image: url('${coverPhotoUrl}')` 
  : '';


petCard.innerHTML = `
  <!-- ==================== -->
  <!-- 1. PETCARD HEADER SECTION -->
  <!-- ==================== -->
  <div class="petCard-header" style="${petCardHeaderStyle}">
  <div class="petCard-header-content">
    <h3>${profile.name}</h3>
    ${profile.nicknames ? `<p class="nickname">"${profile.nicknames}"</p>` : ''}
  </div>
  ${profile.nextBirthday ? `
    <div class="countdown-badge">🎂${Utils.getCountdown(profile.nextBirthday)}</div>
  ` : ''}
 </div>

<!-- ==================== -->
<!--2. GALLERY SECTION -->
<!-- ==================== -->
  <!-- Main Gallery Display (for viewing) -->
<div class="gallery-grid">
  ${profile.gallery?.length > 0 
    ? profile.gallery.map((img, imgIndex) => `
      <div class="gallery-item ${!img?.url ? 'error' : ''}">
        <img src="${typeof img === 'string' ? img : img.url}" 
             alt="Pet photo ${imgIndex + 1}"
             onerror="this.classList.add('error'); this.src='placeholder.jpg';"
             loading="lazy">
        <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}" 
                data-id="${profile.id}" 
                data-index="${index}" 
                data-photo-index="${imgIndex}">
          ★
        </button>
      </div>
    `).join('') 
    : '<div class="empty-gallery-msg">No photos yet</div>'
  }
</div>

<!-- Edit Preview Container (empty until form interaction) -->
<div id="editGalleryPreview" class="gallery-preview"></div>

<!-- Status Messages -->
<div id="galleryWarning" class="gallery-warning hidden">
  ⚠️ Duplicate image detected
</div>
<div id="errorBox" class="error-box"></div>


  <!-- ==================== -->
  <!-- 3. TAGS SECTION -->
  <!-- ==================== -->
  ${profile.tags?.length ? `
    <div class="tags-container">
      ${profile.tags.map(tag => `
        <span class="tag-pill">${tag}</span>
      `).join('')}
    </div>
  ` : ''}

  <!-- ==================== -->
  <!-- 4. DETAILS SECTION -->
  <!-- ==================== -->
  <div class="pet-info">
  <p><strong>Breed:</strong> ${profile.breed || 'Not specified'}</p>
  <p><strong>DOB:</strong> ${profile.dob || 'Unknown'}</p>
    <!-- ====ADDED RECENTLY AGE DISPLAY OR PREVIEW===== -->
  ${profile.dob ? `
    <p class="pet-age-display">
      <i class="fas fa-dog"></i>
      <span>Today, ${profile.name} is <strong>${Utils.calculateAge(profile.dob)}</strong></span>
      <i class="fas fa-birthday-cake"></i>
    </p>
  ` : ''}
    <!-- ==FOR UPCOMING BIRTHDAY== -->
  ${profile.nextBirthday ? `
    <p><strong>Upcoming Birthday:</strong> ${Utils.formatDate(profile.nextBirthday)}</p>
  ` : ''}
</div>

<!-- ===5. Age display removed ============ -->

<!-- ==================== -->
<!-- 6. BIRTHDAY REMINDER -->
<!-- ==================== -->
${profile.nextBirthday ? `
  <div class="profile-reminder-section">
    <div class="profile-reminder">
      <p><strong>Birthday Reminder:</strong> It's ${profile.name}'s birthday on ${new Date(profile.nextBirthday).toLocaleDateString()} 🎉</p>
    </div>
  </div>
` : ''}

  <!-- ==================== -->
  <!--7. EMERGENCY INFO -->
  <!-- ==================== -->
  <div class="emergency-info">
    <h4>Emergency Contact</h4>
    <p><strong>Name:</strong> ${profile.emergencyContact?.name || 'Not set'}</p>
    <p><strong>Phone:</strong> ${profile.emergencyContact?.phone || 'Not set'}</p>
    <p><strong>Relationship:</strong> ${profile.emergencyContact?.relationship || 'Not set'}</p>
    <p><strong>Microchip:</strong> ${profile.microchipNumber || 'Not registered'}</p>
  </div>

  <!-- ==================== -->
  <!-- 8. MOOD TRACKER -->
  <!-- ==================== -->
  <div class="mood-tracker">
    <div class="mood-buttons">
      <span>Log Mood:</span>
      <button class="mood-btn" data-mood="happy" data-index="${index}">😊</button>
      <button class="mood-btn" data-mood="depressed" data-index="${index}">😔</button>
      <button class="mood-btn" data-mood="sad" data-index="${index}">😞</button>
      <button class="mood-btn" data-mood="angry" data-index="${index}">😠</button>
      <button class="mood-btn" data-mood="sick" data-index="${index}">🤒</button>
    </div>
    <div class="mood-history">
     ${profile.moodHistory?.length ? Utils.renderMoodHistory(profile) : 'No mood history yet'}    </div>
  </div>

  <!-- ==================== -->
  <!-- 9. NOTES SECTION -->
  <!-- ==================== -->
  <div class="pet-notes">
    <strong>Notes & Memories:</strong>
    <p>${profile.notes?.replace(/\n/g, '<br>') || 'No notes yet'}</p>
  </div>

  <!-- ==================== -->
  <!-- 10. ACTION BUTTONS -->
  <!-- ==================== -->
  <div class="pet-card" data-doc-id="${profile.docId}">
    <div class="action-buttons">
      <button class="edit-profile" data-index="${index}" data-doc-id="${profile.docId}">✏️ Edit Petcard</button>
      <button class="delete-profile" data-index="${index}" data-doc-id="${profile.docId}">🗑️ Delete Petcard</button>
      <button class="print-profile" data-index="${index}" data-doc-id="${profile.docId}">🖨️ Print Petcard</button>
      <button class="share-profile" data-index="${index}" data-doc-id="${profile.docId}">📤 Share Petcard</button>
      <button class="generate-qr" data-index="${index}" data-doc-id="${profile.docId}">🔲 Generate QR Code</button>
      <button class="collage-btn" data-index="${index}" data-doc-id="${profile.docId}">🖼️ Collage</button>
      <button class="celebrate-btn" data-index="${index}" data-doc-id="${profile.docId}">🎉 Celebrate</button>
    </div>
  </div>
`; // ← ONLY ONE CLOSING BACKTICK

      DOM.petList.appendChild(petCard);
    });
  }
}

//==============  
// Log mood HAS TO STAY IN DASHBOARD.JS
// MOST FUNCTIONS RELY ON IT 
//================
function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  
  // Safer initialization
  if (!petProfiles[profileIndex].moodHistory || !Array.isArray(petProfiles[profileIndex].moodHistory)) {
    petProfiles[profileIndex].moodHistory = [];
  }
  
  petProfiles[profileIndex].moodHistory.push({
    date: today,
    mood: mood
  });
  
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  loadSavedProfiles();
}

//==========================================
// Helper functions for theme togling
//==========================================
function toggleCelebrateButton(dateInput) {
  const isValid = !!dateInput.value;

  // Optional: update visual feedback (if you're previewing something)
  if (isValid) {
    dateInput.style.borderColor = "green";
  } else {
    dateInput.style.borderColor = "red";
  }

  // Optional: update internal temp data model if you're previewing live
  if (isEditing && typeof currentEditIndex === 'number') {
    window.petProfiles[currentEditIndex].birthday = dateInput.value;
  }
}


// ==============================
// 🎨 previewTheme() - Unified Live Theme Preview
// ==============================
function previewTheme(selectedTheme) {
  const preview = document.getElementById('birthday-card-preview');
  if (!preview) return;

  const theme = THEMES[selectedTheme] || THEMES[DEFAULT_THEME];
  
  // Build preview using live form data or fallbacks
  let name, coverPhoto, ageText;
  
  if (isEditing && currentEditIndex !== null) {
    // EDIT MODE: Use actual profile data
    const profile = petProfiles[currentEditIndex];
    name = document.getElementById('petName').value || profile.name || "Unnamed Pet";
    
    const coverImg = profile.gallery?.[profile.coverPhotoIndex];
    coverPhoto = typeof coverImg === 'string' ? coverImg : coverImg?.url;
    
    ageText = profile.dob ? `Age: ${Utils.calculateAge(profile.dob)}` : "";
  } else {
    // CREATE MODE: Use form inputs or fallbacks
    name = document.getElementById('petName')?.value || "Your Pet's Name";
    coverPhoto = null; // Will trigger fallback
    ageText = "";
  }

  // Apply theme styles
  preview.className = `petCard theme-${selectedTheme}`;
  preview.style.backgroundColor = theme.bgColor;
  preview.style.border = theme.border;

  // Build HTML (with fallback for missing cover photo)
  preview.innerHTML = `
    <div class="petCard-header" style="
      ${coverPhoto ? `background-image: url('${coverPhoto}')` : ''};
      color: ${theme.textColor};
      border-bottom: ${theme.border};
    ">
      <h3>${name}</h3>
      ${!coverPhoto ? `<div class="theme-emoji">${theme.emoji}</div>` : ''}
    </div>
    <div class="preview-content" style="color: ${theme.textColor}">
      ${ageText ? `<p>${ageText}</p>` : ''}
      <p>Theme: <strong>${selectedTheme}</strong></p>
    </div>
  `;

  // Always make visible (remove 'hidden' class)
  preview.classList.remove('hidden');
}




// 🌀🌀🌀 CORE BUTTONS FUNCTIONALITY🌀🌀🌀 
//======================================
// ✏️  EDIT PROFILE BUTTON FUNCTION IMAGE PREVIEW TO BE FIXED
//======================================
// 1. OPENEDITFORM FUNCTION
//=========================
function openEditForm(index) {
  const loader = document.getElementById('processing-loader');
  
  try {
    // ======================
    // 🔄 Loader ON (Improved visibility)
    // ======================
    loader.style.display = 'flex'; // Changed to flex for better centering
    loader.querySelector('p').textContent = 'Loading pet profile...';

    // ======================
    // 1. INITIALIZATION & PROFILE CHECK
    // ======================
    console.log("✏️ Opening edit form for index:", index);
    uploadedImageUrls = [];
    isEditing = true;
    currentEditIndex = index;

    const profile = petProfiles[index];
    if (!profile) {
      throw new Error("Profile not found");
    }
   // Reset before populating
    resetForm(false); // ← Keeps visual states

  // 1️⃣ Make sure the section and form are visible to be used for theme live preview container
  DOM.profileSection.classList.remove('hidden');   // unhide the outer section
  DOM.profileForm.style.display = 'block';         // show the form itself if it was display:none


    // ======================
    // 2. FORM FIELD POPULATION
    // ======================
    document.getElementById("petName").value = profile.name || "";
    document.getElementById("petBreed").value = profile.breed || "";
    document.getElementById("petDob").value = profile.dob || "";
    document.getElementById("nextBirthday").value = profile.nextBirthday || "";
    document.getElementById("petNicknames").value = profile.nicknames || "";
    document.getElementById("petNotes").value = profile.notes || "";
    // UPDATED LINES
    document.getElementById("nextBirthday").value = profile.nextBirthday || "";
    document.getElementById("birthdayReminder").value = profile.birthdayReminder || "";

    // Emergency contact
    document.getElementById("emergencyName").value = profile.emergencyContact?.name || "";
    document.getElementById("emergencyPhone").value = profile.emergencyContact?.phone || "";
    document.getElementById("emergencyRelationship").value = profile.emergencyContact?.relationship || "";
    document.getElementById("microchipNumber").value = profile.microchipNumber || "";

    // Tags - Corrected version
const tagCheckboxes = document.querySelectorAll('input[name="petTags"]');
tagCheckboxes.forEach(checkbox => {
  checkbox.checked = profile.tags?.includes(checkbox.value);
});
  
// ======================
// 3. GALLERY PREVIEW SETUP (UPDATED TO USE updateGalleryPreviews now)
// ======================
    // after resetForm before poppulating fields.
  // 1.Copy gallery to memory
  petProfiles[currentEditIndex].gallery = [...(profile.gallery || [])];

  // 2.Set current cover index in form dataset
  DOM.profileForm.dataset.coverIndex = profile.coverPhotoIndex ?? 0;

  //3.Update gallery preview
updateGalleryPreviews(); // refresh gallery,– populates thumbnails with remove and cover buttons.
  //highlights the chosen theme and applies it to the live card preview.   
const matchingRadio = document.querySelector(`input[name="theme"][value="${profile.theme}"]`);
if (matchingRadio) matchingRadio.checked = true;
previewTheme(profile.theme || DEFAULT_THEME); 

// 5.Add live change listener to radios
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) previewTheme(e.target.value);
  });
});

// 6. Make live preview container visible
  const previewContainer = document.getElementById('birthday-card-preview');
  if (previewContainer) previewContainer.classList.add('visible');

  // 7. Initialize gallery interactions
  initGalleryInteractions();

     
    // ======================
    // 4. MOOD HISTORY UI
    // ======================
    const moodInput = document.getElementById("moodHistoryInput");
    if (moodInput) {
      moodInput.value = "";
      moodInput.placeholder = profile.moodHistory?.length
        ? `Last mood: ${profile.moodHistory.slice(-1)[0]?.mood}`
        : "Add new mood...";
    }

    // ======================
    // 5. CANCEL BUTTON SETUP
    // ======================
    if (!document.getElementById("cancelEditBtn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancelEditBtn";
      cancelBtn.type = "button";
      cancelBtn.className = "button cancel-btn pill";
      cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';

      cancelBtn.addEventListener("click", () => {
        if (confirm('Discard all changes?')) cancelEdit();
      });

      const submitBtn = DOM.profileForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.after(cancelBtn);
    }
       // 🎯 INSERT HERE ▼ (after fields, before UI updates)
    updateGalleryPreviews(); // Refresh gallery with existing images
    

    // ======================
    // 6. UI STATE UPDATES & LOADER HANDLING
    // ======================
    const transitionUI = () => {
      // Smooth transition to form view
      DOM.petList.classList.add('hidden');
      DOM.profileSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Final loader state
      loader.querySelector('p').textContent = 'Profile loaded successfully!';
      loader.style.backgroundColor = '#4CAF50'; // Success green
      
      // Delay hide for better UX
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          loader.style.opacity = '1';
          loader.style.backgroundColor = ''; // Reset color
        }, 300);
      }, 500);
    };

    transitionUI();
    console.log("✅ Edit form ready for:", profile.name);

  } catch (error) {
    // ======================
    // ❌ ERROR HANDLING (ENHANCED)
    // ======================
    console.error("Edit form error:", error);
    
    // Visual error state
    loader.querySelector('p').textContent = 'Failed to load profile';
    loader.style.backgroundColor = '#f44336'; // Error red
    
    // Error animation
    loader.classList.add('error-pulse');
    Utils.showErrorToUser("Profile failed to load. Please try again.");
    
    // Reset after delay
    setTimeout(() => {
      loader.classList.remove('error-pulse');
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        loader.style.opacity = '1';
        loader.style.backgroundColor = '';
        cancelEdit();
      }, 300);
    }, 2000);
  }
} // ← End of openEditForm

//====≈===================
// 2. OPENCREATEFORM()
//==========================
function openCreateForm() {
  console.log("➕ Opening form to create new pet profile");
  
  // 1. RESET STATE & FLAGS
  // ======================
  isEditing = false;
  currentEditIndex = null;
  uploadedImageUrls = [];
  
  // Initialize live preview (if container exists)
  // 2. CLEAR FORM FIELDS
  // ======================
  resetForm(); // Handles all field/gallery clearing
  
  // Right after restform
  // Default cover index for new profiles
  DOM.profileForm.dataset.coverIndex = 0;

  // 1. Set first theme radio as default
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  if (themeRadios.length) themeRadios[0].checked = true;

  // 2. Initialize gallery previews
  updateGalleryPreviews();

  //3. Initialize preview with empty state
  const preview = document.getElementById('birthday-card-preview');
  if (preview) {
    preview.innerHTML = `
      <div class="petCard-header" style="text-align: center">
        <h3>New Pet Profile</h3>
      </div>
      <div class="preview-content">
        <p>Add details to see live preview</p>
      </div>
    `;
    preview.classList.remove('hidden');
  }

  // 4. Preview default theme
  previewTheme(themeRadios[0]?.value || DEFAULT_THEME);

  // 5. 🎯 Live theme preview on radio change
 // after reset,updategallerypreview and before initgalleryinteractions called
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      previewTheme(e.target.value);
    }
  });
});

  // 6. Initialize gallery interactions
  initGalleryInteractions();

  // 4. CANCEL BUTTON SETUP
  // ======================
  if (!document.getElementById("cancelEditBtn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.type = "button";
    cancelBtn.className = "button cancel-btn pill";
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';

    cancelBtn.addEventListener("click", () => {
      if (confirm("Discard this new profile?")) {
        cancelEdit();
      }
    });

    const submitBtn = DOM.profileForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.after(cancelBtn);
  }

  // 5. SHOW FORM / HIDE DASHBOARD
  // ======================
  DOM.profileSection.classList.remove("hidden");
  DOM.petList.classList.add("hidden");
  window.scrollTo(0, 0);

  console.log("✅ Create form ready for new profile");
}

//=====================================================
// 3. RESET FORM FOR BOTH OPENEDIT AND OPENCREATEFORMS
//========================================================
/**
 * Resets all form fields and UI states to default
 * @param {boolean} fullReset - When true, also resets non-field states (default: true)
 */
function resetForm(fullReset = true) {
  // 1. FORM FIELDS RESET
  // ======================
  DOM.profileForm.reset();
  
  // 2. SPECIAL INPUT CLEARING
  // ======================
  // Tags - Corrected version
const tagCheckboxes = document.querySelectorAll('input[name="petTags"]');
tagCheckboxes.forEach(checkbox => {
  checkbox.checked = false;
});

  // Emergency contact (if not caught by form.reset())
  document.getElementById("emergencyName").value = "";
  document.getElementById("emergencyPhone").value = "";
  document.getElementById("emergencyRelationship").value = "";
  document.getElementById("microchipNumber").value = "";

  // 3. GALLERY RESET
  // ======================
  const galleryPreview = document.getElementById("galleryPreview");
  if (galleryPreview) galleryPreview.innerHTML = "";
  DOM.profileForm.dataset.coverIndex = "0";

  // 4. MOOD INPUT
  // ======================
  const moodInput = document.getElementById("moodHistoryInput");
  if (moodInput) {
    moodInput.value = "";
    moodInput.placeholder = "Add new mood...";
  }
  
  // Ensure theme selection resets properly
const themeRadios = document.querySelectorAll('input[name="theme"]');
if (themeRadios.length) {
  themeRadios[0].checked = true; // Balloons is first
 previewTheme('balloons');

}

  // 5. FULL STATE RESET (optional)
  // ======================
  if (fullReset) {
    // Visual states
    document.querySelectorAll('.cover-btn.active').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Clear any temporary previews
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = "");
  }
}

//=================================================
//4. helper function for gallery preview in edit form
//=====================================================
// Update your initGalleryInteractions() function:
function initGalleryInteractions() {
  // Remove button functionality
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(e.target.closest('.gallery-thumbnail').dataset.index);
      if (isEditing) {
        petProfiles[currentEditIndex].gallery.splice(index, 1);
      } else {
        uploadedImageUrls.splice(index, 1);
      }
      updateGalleryPreviews();
    });
  });

  // Cover photo selection
 document.querySelectorAll('.cover-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault(); // 🛠 Prevent form submission or unwanted navigation

    const index = parseInt(
      e.target.closest('.gallery-thumbnail').dataset.index
    );

    if (isEditing) {
      // Just mark the new cover photo in memory
      petProfiles[currentEditIndex].coverPhotoIndex = index;
    } else {
      // In create form, mark in temp array
      DOM.profileForm.dataset.coverIndex = index;
    }

    // Refresh the preview to visually update the active star
    updateGalleryPreviews();
  });
});
} // closes the function 

// Helper function to update both form previews
function updateGalleryPreviews() {
  const gallery = isEditing ? petProfiles[currentEditIndex].gallery : uploadedImageUrls;
  const preview = document.getElementById('galleryPreview');
  
  if (preview) {
    preview.innerHTML = gallery.map((img, idx) => `
      <div class="gallery-thumbnail" data-index="${idx}">
        <img src="${typeof img === 'string' ? img : img.url}" 
             class="preview-thumb"
             onerror="this.src='placeholder.jpg'">
        <button class="remove-btn">×</button>
        <button class="cover-btn ${
          idx === (
            isEditing 
              ? petProfiles[currentEditIndex].coverPhotoIndex 
              : parseInt(DOM.profileForm.dataset.coverIndex || 0, 10) // 🔹 FIXED: use dataset value instead of hardcoded 0
          ) 
          ? 'active' 
          : ''
        }">
          ★
        </button>
      </div>
    `).join('');
    
    initGalleryInteractions();
  }
}


//================================
//5. FUNCTION CANCEL EDIT
//===============================
function cancelEdit() {
  // 1. Show loader immediately
  const loader = document.getElementById('processing-loader');
  loader.style.display = 'block';
  loader.querySelector('p').textContent = 'Resetting editor...';
  
  resetForm(); // ← Clear all fields including gallery

  // 2. Core reset (sync)
  isEditing = false;
  currentEditIndex = null;
  uploadedImageUrls = [];
  
  // Reset file input
  const fileInput = document.getElementById('petGallery');
  if (fileInput) fileInput.value = '';
  
  // 4. Switch views
  DOM.profileSection.classList.add('hidden');
  DOM.petList.classList.remove('hidden');
  console.log("❌ Edit cancelled");

  // 5. Hide loader after minimal delay (UX polish)
  setTimeout(() => {
    loader.style.display = 'none';
  }, 300); // Just enough time to show the message
}




//==========≈==============
// 🛑  UPGRADED DELETE BUTTON WORKS FOR BOTH LOCALSTORAGE AND FIRESTORE
// DELET CLOUDINARY SDK FUNCTION TO BE IMPLEMENTED LATER
//=========================
async function deleteProfile(index) {
  // 1. Enhanced Confirmation UI
  if (!confirm(`Permanently delete ${petProfiles[index]?.name}'s profile?\nThis cannot be undone!`)) return;

  const loader = document.getElementById('processing-loader');
  loader.style.display = 'block';
  loader.querySelector('p').textContent = 'Deleting profile...';

  try {
    const profile = petProfiles[index];
    if (!profile) throw new Error("Profile not found");

    // 2. Parallel Deletions (Firestore + Cloudinary)
    const deletions = [];

    // Firestore Profile
    if (profile.docId) {
      deletions.push(
        firebase.firestore().collection("profiles").doc(profile.docId).delete()
          .catch(err => console.warn("Firestore profile deletion warning:", err))
      );
    }

    // Firestore Reminder
    if (profile.reminderDocId) {
      deletions.push(
        firebase.firestore().collection("reminders").doc(profile.reminderDocId).delete()
          .catch(err => console.warn("Firestore reminder deletion warning:", err))
      );
    }

    // Cloudinary Images (Filter + Parallel)
    if (Array.isArray(profile.gallery)) {
      profile.gallery
        .filter(img => img?.public_id)
        .forEach(img => {
          deletions.push(
            deleteImageFromCloudinary(img.public_id)
              .catch(err => console.warn("Cloudinary deletion warning:", img.public_id, err))
          );
        });
    }

    // 3. Await All Deletions
    await Promise.allSettled(deletions);

    // 4. Update Local State
    const [deletedProfile] = petProfiles.splice(index, 1);
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

    // 5. UI Feedback
    Utils.showErrorToUser(`Successfully deleted ${deletedProfile.name}'s profile.`, true);

  } catch (error) {
    console.error("Critical deletion error:", error);
    Utils.showErrorToUser("Deletion failed - please try again");
  } finally {
    // 6. Always Update UI and Hide Loader
    loadSavedProfiles();
    loader.style.display = 'none';
  }
}



//===========================================
//  PRINT PROFILE BUTTON FUNCTION
// OPTIMISED FOR TABLLET AND DESKTOIP
//================================================
async function printProfile(profile) {
     // Add this validation FIRST
  if (!profile?.id) {
    console.error("Invalid profile data:", profile);
    return;
  }
  
  // Change selector to use the specific card ID
  const petCard = document.getElementById(`pet-card-${profile.id}`);
    // Fallback to old method if no card found
  if (!petCard) {
    console.warn('Pet card not found, using fallback method');
    return fallbackHtmlPrint(profile);
  }

  // Add temporary styling for print capture
  petCard.style.boxShadow = '0 0 0 10px white'; // Adds white border for print
  const originalTransition = petCard.style.transition;
  petCard.style.transition = 'none'; // Disable transitions during capture

  // Capture with html2canvas
  try {
    const canvas = await html2canvas(petCard, {
      scale: 1.8,
      logging: true, // Helpful for debugging
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Ensure any hidden elements are visible for printing
        clonedDoc.querySelectorAll('[style*="display:none"]').forEach(el => {
          el.style.display = 'block';
        });
      }
    });

    openPrintWindow(canvas, profile);
    
  } catch (error) {
    console.error('Canvas capture failed:', error);
    alert('Advanced print failed, using standard version instead');
    fallbackHtmlPrint(profile);
  } finally {
    // Restore original styles
    petCard.style.boxShadow = '';
    petCard.style.transition = originalTransition;
  }
}


// Fallback to original HTML method
function fallbackHtmlPrint(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  printDocument.write(`
  
    <html>
      <head>
        <title>${profile.name}'s Profile</title>   
      </head>
      <body>
        <div class="print-header">
          <h1>${profile.name}'s Profile</h1>
          <p><strong>Nicknames:</strong> ${profile.nicknames || 'None'}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="print-details">
          <p><strong>Breed:</strong> ${profile.breed}</p>
          <p><strong>Date of Birth:</strong> ${profile.dob}</p>
          <p><strong>Upcoming Birthday:</strong> ${profile.nextbirthday}</p>
          <p><strong>Birthday Reminder:</strong> ${profile.birthdayReminder}</p>
        </div>
        
        ${profile.tags?.length ? `
        <div class="print-tags">
           <h3>Tags</h3>
           ${profile.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        ` : ''}

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
        
        <div class="emergency-contact">
         <h3>Emergency Contact</h3>
         <p><strong>Name:</strong> ${profile.emergencyContact?.name || 'Not set'}</p>
         <p><strong>Phone:</strong> ${profile.emergencyContact?.phone || 'Not set'}</p>
         <p><strong>Relationship:</strong> ${profile.emergencyContact?.relationship || 'Not set'}</p>
         <p><strong>Microchip:</strong> ${profile.microchipNumber || 'Not registered'}</p>
       </div>

       <div class="print-notes">
         <h3>Notes & Memories</h3>
         <p>${profile.notes?.replace(/\n/g, '<br>') || 'No notes yet'}</p>
        </div>

      
        <h3>Gallery</h3>
        <div class="print-gallery">
          ${profile.gallery.map(img => 
           `<img src="${img.url}" alt="Pet photo" onload="this.style.opacity = '1'">`
         ).join('')}


      <div class="print-actions">
        <button onclick="window.close()">Close</button>
        <button onclick="
          const link = document.createElement('a');
          link.href = location.href;
          link.download = '${profile.name}_profile.html';
          link.click();
        ">
          Save as Image
        </button>
      </div>
      <script>
        // Force print dialog when fully loaded
        window.onload = () => setTimeout(() => window.print(), 300);
      </script>
      </body>
    </html>
  `);
}

// Handle the print window creation
function openPrintWindow(canvas, profile) {
  const printWindow = window.open('', '_blank');
  const printDate = new Date().toLocaleDateString();

  // IN THIS HTML STRUCTURE THE HEADER AND FOOTER CAUSED PAGE BREAK AND OPTED FOR HIDING THEM
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${profile.name}'s Profile</title>
     <style>
  /* ===== SCREEN STYLES (visible in browser) ===== */
  @media screen {
    body {
      padding: 20px;
      background: #f5f5f5;
      max-width: 90%; /* was 800px*/
      max-height: 90%; 
      margin: 0 auto;
    }
    
    .print-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin: 25px 0;
    }
    
    .print-actions button {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    
    .print-actions button:hover {
      background: #45a049;
    }
    
    .print-footer {
      margin-top: 20px;
      font-size: 1em;
      color: #666;
      text-align: center;
    }
  }

  /* ===== PRINT STYLES (visible when printing) ===== */          
  @media print {
    body { 
      margin: 0 !important;
      padding: 5mm !important; /* Printer-safe units */
    }
    .print-container {
      height: 100vh;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }
    .print-header {
      display: none !important; /* Completely remove header */
    }
    .print-image {
      flex-grow: 1;
      object-fit: contain;
      max-height: 85vh !important; /* was ~85vh — more vertical stretch */
    }
     .print-footer {
      display: none !important; /* Completely remove footer */
    }
    .print-actions {
      display: none !important; /* Hide buttons when printing */
    }
  }
   </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h1>${profile.name}'s Profile</h1>
            <p>Generated on ${printDate}</p>
          </div>
          
          <img class="print-image" src="${canvas.toDataURL('image/png')}" 
               alt="${profile.name}'s Profile Card">
          
          <p class="print-footer">
            Printed from Pet Profile App • ${printDate}
          </p>
        </div>

        <div class="print-actions">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
          <button onclick="
            const img = document.querySelector('.print-image');
            if(img && img.src.startsWith('data:')) {
              const a = document.createElement('a');
              a.href = img.src;
              a.download = '${profile.name.replace(/[^a-z0-9]/gi, '_')}_profile.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              alert('Please wait for image to load fully');
            }
          ">Save as Image</button>
        </div>

        <script>
          window.onload = () => {
            const printBtn = document.querySelector('button');
            printBtn.focus();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}


//===============================
//  🎂 Generate Birthday card() WORKS
//===============================
async function generateBirthdayCard(index) {
  let blobUrl = null;

  try {
    // 1. Fetch the pet's profile
    const petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    const profile = window.petProfiles[index];
    const theme = profile.theme || 'balloons'; // Fallback to balloons

    if (!profile || !profile.nextBirthday) return;
    
   // ENSURE COVERPHOTO EXISTS AND VALIDATE IT
    const coverPhoto = profile.gallery?.[profile.coverPhotoIndex];
    const coverUrl = typeof coverPhoto === 'string'
     ? coverPhoto
     : coverPhoto?.url || '';
    const validCover = coverUrl && !coverUrl.includes('{{');

  // Add this debug line right after getting coverUrl:
     console.log("Cover Photo Debug:", {
     index: profile.coverPhotoIndex,
     galleryLength: profile.gallery?.length,
     coverPhoto,
     coverUrl,
     validCover
     });
  
    // Add this debugging lines RIGHT AFTER getting coverUrl but BEFORE creating the card
    const testImg = new Image();
    testImg.src = coverUrl;
    testImg.onload = () => console.log("✅ Image loads successfully:", coverUrl);
    testImg.onerror = () => console.log("❌ Image FAILED to load:", coverUrl);

        // ✅ Append temporarily (hidden)
    // 2. Create card container FIRST (this was missing)
    const card = document.createElement('div');
    card.style.position = "fixed";
    card.style.left = "-9999px";
    document.body.appendChild(card);

    // 3. Create a birthday-themed card container
 //  const profile = window.petProfiles[index];
   const themeKey = profile.theme || 'balloons'; // e.g., 'balloons', 'stars'
   const themeConfig = THEMES[themeKey] || THEMES['balloons'];

card.className = `birthday-card theme-${themeKey}`; // Now works, card is defined
card.innerHTML = `
  <div class="birthday-header" style="background:${themeConfig.bgColor}">
    ${themeConfig.emoji} ${profile.name}'s Birthday! ${themeConfig.emoji}
  </div>
  <div class="birthday-countdown">${Utils.getCountdown(profile.nextBirthday)}</div>
  ${
    validCover
      ? `<img src="${coverUrl}" alt="${profile.name}" class="birthday-photo">`
      : `<div class="birthday-photo-placeholder">No valid cover image</div>`
  }
  <div class="birthday-footer">Celebrate on ${new Date(profile.nextBirthday).toLocaleDateString()}</div>
`;

   // 4. Convert to PNG (reuse your html2canvas logic)
    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: '#fff8e6', // Light yellow
      useCORS: true, // Add this
      async: true // Add this so canvas await for image to load
    });

   // Add this right before showBirthdayCardModal() call
   if (window.currentBirthdayCanvas) {
   URL.revokeObjectURL(window.currentBirthdayCanvas.toDataURL());
   }
   window.currentBirthdayCanvas = canvas; // Store reference
    
       // 5. ADD NEW PREVIEW MODAL LOGIC]
    showBirthdayCardModal(canvas, profile); // New function call

    // 6. CLEANUP]
    document.body.removeChild(card);
    
  } catch (error) {
    console.error("Generation failed:", error);
    Utils.showErrorToUser("Couldn't generate card. Please try again.");
 } 
} // FUNCTION

//================================================================================================
// [ADD NEW FUNCTION FOR SHARING&DOWNLOADING BIRTHDAYCARD (place near your collage modal code)]
//================================================================================================
function showBirthdayCardModal(canvas, profile) {
  // ===== [CLEANUP SECTION - NEW] =====
  // 1. Check for existing modal and clean up
  const existingModal = document.getElementById('birthday-card-modal');
  if (existingModal) {
    // Clean up previous listeners to prevent duplicates
    document.removeEventListener('keydown', handleKeyDown);
    existingModal.querySelector('.modal-close').onclick = null;
    existingModal.querySelector('.modal-backdrop').onclick = null;
  }

  // ===== [MODAL CREATION - EXISTING CODE] ===== 
  if (!existingModal) {
    const modalHTML = `
      <div id="birthday-card-modal" class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <h3>${profile.name}'s Birthday Card!</h3>
          <div class="card-preview-container">
            <img id="birthday-card-preview-img" src="${canvas.toDataURL()}" alt="Birthday Card">
          </div>
          <div class="modal-actions">
            <button id="share-birthday-btn" class="button share-btn">
              <i class="fas fa-share-alt"></i> Share
            </button>
            <button id="download-birthday-btn" class="button download-btn">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ===== [MODAL SHOW - EXISTING CODE] =====
  const modal = document.getElementById('birthday-card-modal');
  modal.classList.remove('hidden');


  // Update these event listeners:
  document.getElementById('share-birthday-btn').onclick = async () => {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `${profile.name}_birthday.png`, {
        type: 'image/png'
      });
      
      try {
        // First try native sharing
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${profile.name}'s Birthday Card`,
            files: [file],
            text: `Celebrate ${profile.name}'s birthday!` 
          });
        } 
        // Fallback for desktop browsers
        else {
          // Create temporary share link
          const shareUrl = URL.createObjectURL(blob);
          const tempInput = document.createElement('input');
          tempInput.value = shareUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          alert('Image link copied to clipboard! Paste it anywhere to share.');
        }
      } catch (error) {
        console.error('Sharing failed:', error);
        downloadCard(canvas, profile.name); // Fallback to download
      }
    });
  };

  document.getElementById('download-birthday-btn').onclick = () => {
    downloadCard(canvas, profile.name);
  };
  // ===== [CLEAN LISTENER SETUP - NEW] =====
  // 3. Close handlers (now using single references)
  const closeBtn = modal.querySelector('.modal-close');
  const backdrop = modal.querySelector('.modal-backdrop');
  
  closeBtn.onclick = closeModal;
  backdrop.onclick = closeModal;
  document.addEventListener('keydown', handleKeyDown);
} // closes the modal

//======================================
// HANDLE KEY DOWN FUNCTION FOR CLOSE BUTTON
// IT HAS BEEN DECLARED GLOBALLY
//======================================

//=============================
// CLOSE MODAL FUNCTION
//==================================
//Keep the modal in DOM but add proper state cleanup:
function closeModal() {
  const modal = document.getElementById('birthday-card-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  // 1. Cleanup canvas references
  const img = document.getElementById('birthday-card-preview-img');
  if (img && img.src.startsWith('blob:')) {
    URL.revokeObjectURL(img.src);
    img.removeAttribute('src'); // Important for memory cleanup
  }

  // 2. Reset any interactive elements
  const downloadBtn = document.getElementById('download-birthday-btn');
  if (downloadBtn) downloadBtn.onclick = null;

  // 3. Hide the modal
  modal.classList.add('hidden');
}

// ========================
// BIRTHDAY CARD DOWNLOAD FUNCTION (updated)
// ========================
function downloadCard(canvas, petName) {
  const sanitizedName = petName.replace(/[^a-z0-9]/gi, '_'); // Added sanitization
  const link = document.createElement('a');
  link.download = `${sanitizedName}_birthday.png`;
  link.href = canvas.toDataURL();
  document.body.appendChild(link); // More reliable for some browsers
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Added cleanup
  }, 100);
}

//===============================
//  EVERYTHING RELATED TO COLLAGE GENERATION, CREATE COLLAGE/HELPER FUNCTIONS(2) AND GENERATE COLLAGE AS PNG
// CORS ISSUE IS STILL TO BE FIXED BUT FUNCTION IS WORKING
//====================================================================================
// FUNCTION TO ENSURE COLLAGE MODAL EXISTS/MOVED MODAL HTML FROM HTML TO DASHBOARD.JS
//=========================================================================================
// PHASE 1
// ===============================
function ensureCollageModalExists() {
  if (!document.getElementById('collage-modal')) {
    const modalHTML = `
      <div id="collage-modal" class="modal hidden">
        <div class="modal-content">
          <h3>Create Collage</h3>
          <h4>To proceed please choose 2 images or more...</h4>
          <div class="image-grid" id="collage-image-grid"></div>
          
          <div class="layout-options">
            <button data-layout="2x2">2×2</button>
            <button data-layout="3x3">3×3</button>
            <button data-layout="1x3">1×3</button>
          </div>
          
          <div class="collage-buttons">
            <button id="generate-collage" disabled>Generate Collage</button>
            <button id="close-collage">Close</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// ===============================
// Modal Show/Hide Helpers
// ===============================
function hideModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';
  }, 300); // match CSS transition
}

function showModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'auto';
  setTimeout(() => modal.classList.remove('hidden'), 10);
}

// ===============================
// Create Collage Modal Logic
// ===============================
function createPetCollage(index) {
  window.currentPetIndex = index;
  ensureCollageModalExists();

  const profile = window.petProfiles[index];
  if (!profile?.gallery?.length) {
    showQRStatus("No photos available for collage.", false);
    return;
  }

  const modal = document.getElementById('collage-modal');
  showModal(modal);

  const grid = document.getElementById('collage-image-grid');
  grid.innerHTML = '';

  profile.gallery.forEach((img, i) => {
    const imgElement = document.createElement('img');
    imgElement.src = typeof img === 'string' ? img : img.url;
    imgElement.dataset.index = i;
    imgElement.addEventListener('click', toggleImageSelection);
    grid.appendChild(imgElement);
  });
}

// ===============================
// Reset Collage Selections
// ===============================
function resetCollageSelections() {
  selectedImages = [];
  selectedLayout = '2x2';
  document.querySelectorAll('#collage-image-grid img.selected')
    .forEach(img => img.classList.remove('selected'));
  
  const genBtn = document.getElementById('generate-collage');
  if (genBtn) genBtn.disabled = true;
}

// ===============================
// Toggle Image Selection
// ===============================
let selectedImages = [];
let selectedLayout = '2x2';

function toggleImageSelection(e) {
  const img = e.target.closest('img');
  if (!img) return;

  img.classList.toggle('selected');
  const index = parseInt(img.dataset.index);

  if (img.classList.contains('selected')) {
    if (!selectedImages.includes(index)) selectedImages.push(index);
  } else {
    selectedImages = selectedImages.filter(i => i !== index);
  }

  const genBtn = document.getElementById('generate-collage');
  if (genBtn) genBtn.disabled = selectedImages.length < 2;
}

// ===============================
// Global Delegated Listeners
// ===============================
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.layout-options button')) {
    selectedLayout = e.target.dataset.layout;
  }
  else if (e.target.id === 'generate-collage') {
    const profile = window.petProfiles[currentPetIndex];
    generateCollagePNG(profile); // Phase 2 hook
  }
  else if (e.target.id === 'close-collage') {
    const modal = document.getElementById('collage-modal');
    hideModal(modal);
    resetCollageSelections();
  }
});



//==================================
// PHASE 2. THEN GENERATE COLLAGE PNG
//==================================
 async function generateCollagePNG(profile) {
  try {
    // 1. Improved URL handling
    const getCloudinaryUrl = (url) => {
      if (!url?.includes('res.cloudinary.com')) return url;
      try {
        const urlObj = new URL(url);
        urlObj.protocol = 'https:';
        urlObj.search = ''; // Remove query params
        return urlObj.toString();
      } catch {
        return url.replace('http://', 'https://').split('?')[0];
      }
    };

    // 2. Create container
    const collage = document.createElement('div');
    collage.className = `collage-layout-${selectedLayout}`;
    
    // 3. Configure proxy with error handling
    const proxyBase = 'https://petstudio.dr-kimogad.workers.dev/?url=';
    const imagesToLoad = [];

    // Load all images first
    for (const index of selectedImages) {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 5px;
      `;

      const originalUrl = typeof profile.gallery[index] === 'string' 
        ? profile.gallery[index] 
        : profile.gallery[index]?.url;
      
      if (!originalUrl) continue;

      const cloudinaryUrl = getCloudinaryUrl(originalUrl);
      img.src = `${proxyBase}${encodeURIComponent(cloudinaryUrl)}&_cache=${Date.now()}`;
      
      imagesToLoad.push(new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Image failed to load: ${img.src}`));
      }));

      collage.appendChild(img);
    }

    // Wait for images with timeout
    await Promise.race([
      Promise.all(imagesToLoad),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Image loading timeout (15s)')), 15000)
      )
    ]);

    // 4. Apply layout
    // 1. Define layout config (keep this)
const layoutConfig = {
  '2x2': { gridTemplate: 'repeat(2, 1fr)', height: '600px' },
  '3x3': { gridTemplate: 'repeat(3, 1fr)', height: '600px' },
  '1x3': { gridTemplate: 'repeat(3, 1fr)', height: '200px' }
};

// 2. Validate layout (keep this)
if (!['2x2', '3x3', '1x3'].includes(selectedLayout)) {
  console.warn(`Unknown layout: ${selectedLayout}. Defaulting to 2x2`);
  selectedLayout = '2x2';
}

// 3. Get the configured layout values
const { gridTemplate, height } = layoutConfig[selectedLayout];

// 4. Apply ALL styles at once (modified)
collage.style.cssText = `
  display: grid;
  gap: 5px;
  width: 600px;
  height: ${height};
  grid-template-columns: ${gridTemplate};
  position: fixed;
  left: -9999px;
  background: white;
  padding: 10px;
  box-sizing: border-box;
`;
//==================do not remove===================
// to override css scaling restrictions before canvas rendering 
       // 1. Clone images to avoid affecting original modal
const clonedImages = Array.from(collage.querySelectorAll('img')).map(img => {
  const clone = img.cloneNode(true);
  clone.style.cssText = `
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important; /* Show full image */
  `;
  return clone;
});
//===================================================================
// 2. Clear and repopulate collage with fixed-size containers
collage.innerHTML = '';    
clonedImages.forEach(clone => {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
  `;
  container.appendChild(clone);
  collage.appendChild(container);
});

// 3. Adjust collage container sizing
collage.style.cssText = `
  display: grid;
  grid-template-columns: ${gridTemplate};
  gap: 10px;
  width: ${selectedLayout === '1x3' ? '400px' : '600px'};
  height: ${height};
  background: white;
  padding: 10px;
  position: absolute;
  top: 0;
  left: 0;
`;

    
    // 5. Render with html2canvas
   document.body.appendChild(collage);
    
    const canvas = await html2canvas(collage, {
      useCORS: true,
      allowTaint: false,
      scale: 1,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (clonedDoc) => {
        clonedDoc.body.style.background = 'white';
      }
    });

    // 6. Create blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas conversion failed')),
        'image/png',
        0.92
      );
    });
    
// Inside generateCollagePNG(), after canvas generation:
showCollagePreview(canvas, profile);
    
  } catch (error) {
    console.error('Collage generation error:', error);
    showQRStatus(`Failed: ${error.message}`, false);
    throw error;
  } finally {
    // Cleanup
    const collageEl = document.querySelector(`.collage-layout-${selectedLayout}`);
    if (collageEl) collageEl.remove();
    
    const modal = document.getElementById('collage-modal');
  // modal?.classList.add('hidden');
    selectedImages = [];
  }
 }

//==========================
// PHASE 3. SHOW COLLAGE PREVIEW ()
//==========================
function showCollagePreview(canvas, profile) {
  // Remove any existing preview modal to avoid duplicates/leaks
  const existingModal = document.getElementById('collage-preview-modal');
  if (existingModal) existingModal.remove();

  // Create modal
  document.body.insertAdjacentHTML('beforeend', `
    <div id="collage-preview-modal" class="modal" style="pointer-events:auto;">
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${profile.name}'s Collage</h3>
          <span class="modal-close" role="button" tabindex="0">&times;</span>
        </div>
        <div class="collage-preview-container">
          <img id="collage-preview-image" alt="Collage Preview">
        </div>
        <div class="modal-actions">
          <button id="share-collage" class="btn-share">
            <i class="fas fa-share-alt"></i> Share
          </button>
          <button id="download-collage" class="btn-download">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    </div>
  `);

  const modal = document.getElementById('collage-preview-modal');
  const img = modal.querySelector('#collage-preview-image');
  img.src = canvas.toDataURL();

  // === Helper to close and cleanup ===
  const closeModal = () => {
    // Immediate removal (no leftover backdrop)
    modal.remove();
    URL.revokeObjectURL(img.src);
    removeListeners();
  };

  // === Listener cleanup ===
  const removeListeners = () => {
    modal.querySelector('.modal-close').onclick = null;
    modal.querySelector('.modal-backdrop').onclick = null;
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  // === Bind listeners ===
  modal.querySelector('.modal-close').onclick = closeModal;
  modal.querySelector('.modal-backdrop').onclick = closeModal;
  document.addEventListener('keydown', handleKeyDown);

  // === Button: Share ===
  modal.querySelector('#share-collage').onclick = async () => {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `${profile.name}_collage.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${profile.name}'s Collage`,
          files: [file],
          text: 'Check out this pet collage!'
        });
      } else {
        throw new Error('Share API not available');
      }
    } catch (error) {
      console.log('Sharing not supported, downloading instead');
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `${profile.name}_collage.png`;
      link.click();
    }
  };

  // === Button: Download ===
  modal.querySelector('#download-collage').onclick = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `${profile.name}_collage.png`;
    link.click();
  };

  // === Show modal ===
  modal.classList.remove('hidden');
}

// ========================
//  COLLAGE DOWNLOAD (updated)
// ========================
function downloadCollage(canvas, petName) {
  const sanitizedName = petName.replace(/[^a-z0-9]/gi, '_');
  const link = document.createElement('a');
  link.download = `${sanitizedName}_collage.png`;
  link.href = canvas.toDataURL();
  document.body.appendChild(link); // More reliable
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
}

//====================================================
// 🌀 OPTIMIZED SHARE PET CARD FUNCTION
//=======================================================
async function sharePetCard(profile, event) {

  try {
    const petStudioLink = "https://drkimogad.github.io/PetStudio/";

    // ==== CHANGE 1: REORDERED LOGIC - TRY PNG SHARING FIRST FOR MOBILE ====
    // Generate the card as PNG (mobile/tablets prefer images)
    const cardElement = document.getElementById(`pet-card-${profile.id}`);
    if (!cardElement) throw new Error("Card element not found");

    // ==== CHANGE 2: ADDED URL VISIBLY EMBEDDED IN THE CARD ====
    const linkElement = document.createElement('div');
    linkElement.textContent = `View more: ${petStudioLink}`;
    linkElement.style.marginTop = '10px';
    linkElement.style.fontWeight = 'bold'; // Highlight URL
    linkElement.style.color = '#0066cc'; // Make URL stand out
    cardElement.appendChild(linkElement);

    // Capture as PNG (higher quality for sharing)
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        clonedDoc.getElementById(`pet-card-${profile.id}`).style.visibility = 'visible';
      }
    });

    // ==== CHANGE 3: PRIORITIZE NATIVE SHARE WITH PNG (MOBILE/TABLETS) ====
    if (navigator.share && navigator.canShare) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `${profile.name}_profile.png`, {
          type: 'image/png'
        });
        try {
          await navigator.share({
            title: `Meet ${profile.name}! 🐾`,
            text: `Check out ${profile.name}'s profile!`, // Optional text
            files: [file],
          });
          return; // Exit if PNG share succeeds
        } catch (shareError) {
          console.log("Image share failed, falling back to text/URL");
        }
      });
    }

    // ==== CHANGE 4: FALLBACK TO CLIPBOARD + DOWNLOAD (DESKTOP/MOBILE) ====
    canvas.toBlob(async (blob) => {
      try {
        // Copy PNG to clipboard
        const item = new ClipboardItem({
          'image/png': blob
        });
        await navigator.clipboard.write([item]);
      } catch (clipboardError) {
        console.log("Clipboard copy failed, falling back to download");
      }

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

      // ==== CHANGE 5: DESKTOP-FRIENDLY ALERT WITH LINK ====
      alert(`${profile.name}'s profile saved as PNG! Download it or paste the image.\n\nOr share this link: ${petStudioLink}`);
    }, 'image/png');

  } catch (error) {
    console.error('Sharing failed:', error);
    // ==== CHANGE 6: FALLBACK TO TEXT SHARING IF ALL ELSE FAILS ====
    if (navigator.share) {
      await navigator.share({
        title: `Meet ${profile.name}! 🐾`,
        text: `🐾 Meet ${profile.name}!\nBreed: ${profile.breed}\nBirthday: ${profile.nextBirthday}\n\nView more: ${petStudioLink}`,
      });
    } else {
      alert(`Share this link manually: ${petStudioLink}`);
    }
  }
}

//===============================
//🌀 QR Code Managementenhanced to be finalised ⛔️
//===========================
//1. Generate QR code
function generateQRCode(profileIndex) {
  if (generatingQR) return;
  generatingQR = true;
  // why it doesn't rely on window.Profiles like other functions?
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];

const qrContent =   
`Name: ${currentQRProfile.name}
Breed: ${currentQRProfile.breed}
Birthday: ${currentQRProfile.nextBirthday}
Tags: ${currentQRProfile.tags?.join(', ') || 'None'}
Emergency Contact: ${currentQRProfile.emergencyContact?.name || 'N/A'} (${currentQRProfile.emergencyContact?.phone || 'N/A'})
Microchip: ${currentQRProfile.microchipNumber || 'Not registered'}
Notes: ${(currentQRProfile.notes || 'None').substring(0, 100)}
Profile: https://drkimogad.github.io/PetStudio/`;


  const container = document.getElementById('qrcode-container');
  container.innerHTML = '';

  try {
    new QRCode(container, {
      text: qrContent,
      width: 256,
      height: 256,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
    document.getElementById('qr-modal').style.display = 'block';
  } catch (error) {
    console.error('QR Generation Error:', error);
    container.innerHTML = `<p>View profile: <a href="https://drkimogad.github.io/PetStudio/">PetStudio</a></p>`;
  } finally {
    generatingQR = false;
  }
}

// 2.Print QR code
function printQR() {
  const printableArea = document.querySelector('#qr-modal .printable-area');
  if (!printableArea) {
    showQRStatus('QR code not ready for printing.', false);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback for popup-blocked tablets
    showQRStatus('Allow popups to print. Printing current view...', true);
    setTimeout(() => window.print(), 500); // Delay for rendering
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${currentQRProfile?.name || 'Pet'} QR Code</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          body { 
            display: flex !important; 
            justify-content: center !important; 
            align-items: center !important; 
            height: 100vh !important; 
            margin: 0 !important; 
          }
          #qr-controls { display: none !important; }
        </style>
      </head>
      <body>${printableArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500); // Critical for tablets
}

//3. Download QR code
function downloadQR() {
  if (!currentQRProfile) return; // Null check
  const canvas = document.querySelector('#qrcode-container canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = `${currentQRProfile?.name || 'pet_profile'}_qr.png`.replace(/[^a-z0-9]/gi, '_');
    link.href = canvas.toDataURL();
    link.click();
  }
}

//4. Share QR code
async function shareQR() {
  if (!currentQRProfile) return;

  try {
    const canvas = document.querySelector('#qrcode-container canvas');
        const text = 
  `Check out ${currentQRProfile.name}'s profile!

Breed: ${currentQRProfile.breed}
Upcoming Birthday: ${currentQRProfile.nextBirthday}
Tags: ${currentQRProfile.tags?.join(', ') || 'None'}
Emergency Contact: ${currentQRProfile.emergencyContact?.name || 'N/A'} (${currentQRProfile.emergencyContact?.phone || 'N/A'})
Microchip: ${currentQRProfile.microchipNumber || 'Not registered'}
Notes: ${(currentQRProfile.notes || 'None').substring(0, 50)}${currentQRProfile.notes?.length > 50 ? '...' : ''}

View more: https://drkimogad.github.io/PetStudio/`;

    // Priority: Share QR as PNG (mobile/tablets)
    if (canvas && navigator.share && navigator.canShare) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `${currentQRProfile.name}_qr.png`, {
        type: 'image/png'
      });

      if (navigator.canShare({
          files: [file]
        })) {
        await navigator.share({
          title: `${currentQRProfile.name}'s QR Code`,
          files: [file],
          text: text // Optional companion text
        });
        return;
      }
    }

    // Fallback 1: Share text via Web Share API
    if (navigator.share) {
      await navigator.share({
        title: 'Pet Profile',
        text
      });
    }
    // Fallback 2: Copy text to clipboard
    else {
      await navigator.clipboard.writeText(text);
      showQRStatus('Link copied!', true);
    }
  } catch (err) {
    showQRStatus('Sharing failed. Copy manually.', false);
  }
}
// Initialize QR modal (safe initialization)
//=============================================
function initQRModal() {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;

  document.addEventListener('click', (e) => {
    console.log('Button clicked:', e.target.className); // for clicking handling
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
//==========================
function showQRStatus(message, isSuccess) {
  const statusEl = document.getElementById('qr-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? '#28a745' : '#dc3545';
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.style.color = '';
  }, 3000);
}

//=================
// Set cover photo
//====================
//=================
// Set cover photo
//====================
function setCoverPhoto(profileIndex, imageIndex) {
  // Update model
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

  // Visually update ★ buttons
  const galleryItems = document.querySelectorAll(`.gallery-item button[data-index="${profileIndex}"]`);
  galleryItems.forEach(btn => btn.classList.remove("active"));

  const selectedBtn = document.querySelector(`.gallery-item button[data-index="${profileIndex}"][data-photo-index="${imageIndex}"]`);
  if (selectedBtn) selectedBtn.classList.add("active");

  // 🔹 NEW: Update current form state if inside create/edit form
  if (DOM && DOM.profileForm) {
    DOM.profileForm.dataset.coverIndex = imageIndex; // 🔹 Added line
  }

  // 🔹 NEW: If we are editing, keep in-memory consistency
  if (typeof uploadedImageUrls !== "undefined" && uploadedImageUrls.length) {
    // No need to reorder array — just ensure previews match active star
    // This keeps the cover photo choice visible in birthday card preview
  }

  // Re-render if needed
  loadSavedProfiles();
}


//==========================================
// ✅ FINALIZED - setupPetProfileDelegation
// Handles all profile card actions centrally
//==========================================
function setupPetProfileDelegation() {
  if (!DOM.petList) return;

  DOM.petList.addEventListener("click", (e) => {
    const target = e.target;
    const index = parseInt(target.dataset.index, 10);
    const docId = target.dataset.docId || null;

    if (isNaN(index)) {
       // Only warn for elements that should have valid indices
      if (!event.target.closest('.pet-age, .pet-info, .birthday-card')) { 
      console.warn("⚠️ Ignored click: Invalid or missing data-index", target);
    }
      return;
    }

    if (target.classList.contains("edit-profile")) {
      openEditForm(index, docId);
    } else if (target.classList.contains("delete-profile")) {
      deleteProfile(index, docId);
    } else if (target.classList.contains("print-profile")) {
      printProfile(window.petProfiles[index]);
    } else if (target.classList.contains("share-profile")) {
      sharePetCard(window.petProfiles?.[index]);
    } else if (target.classList.contains("generate-qr")) {
      generateQRCode(index);
    } else if (target.classList.contains("collage-btn")) {
      createPetCollage(index);
    } else if (target.classList.contains("celebrate-btn")) {
      generateBirthdayCard(index);
    } else if (target.classList.contains("mood-btn")) {
      const mood = target.dataset.mood;
      if (mood) logMood(index, mood);
    } else if (target.classList.contains("cover-btn")) {
      const photoIndex = parseInt(target.dataset.photoIndex, 10);
      if (!isNaN(photoIndex)) {
        setCoverPhoto(index, photoIndex);
        if (isEditing) {
          DOM.profileForm.dataset.coverIndex = photoIndex;
        }
      }
    }
  });
}

//=============================
//✅ FINAL INITIALIZATION ✅
//================================
function initializeDashboard() {
  petProfiles = window.petProfiles || [];

  // Theme preference listener (add this near other init code)
  const themeRadios = document.querySelectorAll('input[name="theme"]');
  if (themeRadios.length > 0) {
    // Set saved theme or default
    const savedTheme = localStorage.getItem('birthdayTheme') || 'balloons';
    themeRadios.forEach(radio => {
      radio.checked = (radio.value === savedTheme);
      radio.addEventListener('change', (e) => {
        localStorage.setItem('birthdayTheme', e.target.value);
      });
    });
  }

  // Rest of your existing code
  if (petProfiles.length > 0 && DOM.petList) {
    loadSavedProfiles();
  }
  setupPetProfileDelegation();
  attachFormListenerWhenReady();

  if (document.getElementById('qr-modal')) {
    initQRModal();
  }

  const addBtn = document.getElementById('addPetProfileBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      //isEditing = false;
     // currentEditIndex = -1;
     // DOM.profileSection.classList.remove('hidden');
     // DOM.petList.classList.add('hidden');
     // attachFormListenerWhenReady();
      openCreateForm();
    });
  }
  
// for gallery preview
  const galleryInput = document.getElementById("petGallery");
if (galleryInput) {
  galleryInput.addEventListener("change", function (e) {
    const previewContainer = document.getElementById("galleryPreview");
    if (!previewContainer) return;

    previewContainer.innerHTML = '';

    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-thumb';
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
 }
  
// Add this:
setInterval(() => {
  const now = new Date();
  console.log("Midnight check at:", now.toLocaleTimeString()); // Debug line
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    console.log("Triggering midnight refresh..."); 
    loadSavedProfiles();
  }
}, 60000);
} // closes the initializedashboard ()

 // ==================================================
// ENHANCED FORM SUBMISSION HANDLER (PRODUCTION-READY)
// ==================================================
function attachFormListenerWhenReady() {
  console.log("🔄 Initializing form listener..."); // DEBUG LINE KEPT

  // ✅ Only attach once
  if (DOM.profileForm && !DOM.profileForm.dataset.listenerAttached) {
    console.log("✅ Form element found, attaching listeners..."); // DEBUG LINE KEPT

    // ========================
    // SECTION 1: GALLERY PREVIEW
    // ========================
    document.getElementById("petGallery").addEventListener("change", function() {
      console.log("📸 Gallery input changed"); // DEBUG LINE KEPT
      const preview = document.getElementById("editGalleryPreview");
      const files = Array.from(this.files);
      
      if (!preview) {
        console.warn("⚠️ Preview container not found"); // DEBUG LINE KEPT
        return;
      }

      preview.innerHTML = "";
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.innerHTML += `<img src="${e.target.result}" class="preview-thumb" />`;
          console.log("🖼️ Added preview for:", file.name); // DEBUG LINE KEPT
        };
        reader.readAsDataURL(file);
      });
    });

    // ========================
    // SECTION 2: FORM SUBMISSION
    // ========================
    DOM.profileForm.addEventListener("submit", async (e) => {
      console.log("📨 Form submit triggered"); // DEBUG LINE KEPT
      e.preventDefault();

          // 🟢 1. NEW PROFILE CREATION LOADER MESSAGE
      //define loader to init properly
     const loader = document.getElementById('processing-loader');
     const loaderText = loader.querySelector('p'); // Define loaderText here

     loaderText.innerHTML = isEditing ? 
    '<i class="fas fa-save"></i> Updating profile...' : 
    '<i class="fas fa-paw"></i> Creating pet profile...';
     loader.style.display = 'block';
     document.body.style.pointerEvents = 'none';


      // ✅ UI State Management
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;

      try {
        // ========================
        // SECTION 3: AUTH & SETUP
        // ========================
        console.log("🔐 Checking auth state..."); // DEBUG LINE KEPT
        const userId = firebase.auth().currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");
        
        const newProfileId = Date.now();
        console.log("🆕 New profile ID:", newProfileId); // DEBUG LINE KEPT

        // ========================
        // SECTION 4: GALLERY UPLOAD
        // ========================
        console.log("📁 Processing gallery..."); // DEBUG LINE KEPT
        const galleryFiles = Array.from(document.getElementById("petGallery").files);
        const uploadedImageUrls = [];

        if (galleryFiles.length > 0) {
          console.log("🔼 Found", galleryFiles.length, "files to upload"); // DEBUG LINE KEPT
          for (const file of galleryFiles) {
            try {
              console.log("⬆️ Uploading:", file.name); // DEBUG LINE KEPT
              const result = await uploadToCloudinary(file, userId, newProfileId);
              
              if (result?.url) {
                console.log("✅ Upload success:", result.url); // DEBUG LINE KEPT
                uploadedImageUrls.push(result);
              }
            } catch (uploadError) {
              console.error('❌ Upload failed:', uploadError); // DEBUG LINE KEPT
              Utils.showErrorToUser(`Failed to upload ${file.name}`);
            }
          } // closes for loop
        } // closes if galleryFiles.length

        // ========================
        // SECTION 5: MOOD HANDLING
        // ========================
          console.log("😊 Processing mood data..."); // DEBUG LINE KEPT
        let moodHistory = [];
         if (isEditing && Array.isArray(petProfiles[currentEditIndex]?.moodHistory)) {
          moodHistory = [...petProfiles[currentEditIndex].moodHistory];
           console.log("♻️ Loaded existing mood history"); // DEBUG LINE KEPT
          }

        const newMood = document.getElementById("moodHistoryInput")?.value?.trim();
        if (newMood) {
          moodHistory.push({
            date: new Date().toISOString().split("T")[0],
            mood: newMood
          });
          console.log("➕ Added new mood entry:", newMood); // DEBUG LINE KEPT
        }

    // ========================
    // SECTION 6: PROFILE ASSEMBLY
    // ========================
        // ✅ Extract tags BEFORE creating newProfile
        const selectedTags = Array.from(
        document.querySelectorAll('input[name="petTags"]:checked')).map(checkbox => checkbox.value);
        
        console.log("🧩 Building profile object..."); // DEBUG LINE KEPT

        // 🧠 Construct newProfile object
        const newProfile = {
          id: newProfileId,
          name: document.getElementById("petName").value,
          nicknames: document.getElementById("petNicknames")?.value || "",
          breed: document.getElementById("petBreed").value,
          
          dob: document.getElementById("petDob").value, // needed for age calculation
          nextBirthday: document.getElementById("nextBirthday").value, // needed for age calculation
          
          birthdayReminder: document.getElementById("birthdayReminder").value,
          gallery: uploadedImageUrls, // ✅ Replace empty array with uploaded URLs
          emergencyContact: {
            name: document.getElementById("emergencyName").value.trim(),
            phone: document.getElementById("emergencyPhone").value.trim(),
            relationship: document.getElementById("emergencyRelationship").value.trim()
          },
          microchipNumber: document.getElementById("microchipNumber").value.trim(),
          theme: document.querySelector('input[name="theme"]:checked').value || 'balloons', // default theme
          
          notes: document.getElementById("petNotes")?.value.trim() || "",
          tags: selectedTags, // ✅ Inserted properly now
          coverPhotoIndex: parseInt(DOM.profileForm.dataset.coverIndex, 10) || 0,
          
          // Fixed version (dashboard.js)
          moodHistory: (() => {
          const newMood = document.getElementById("moodHistoryInput")?.value?.trim();
          const history = isEditing && Array.isArray(petProfiles[currentEditIndex]?.moodHistory) 
          ? [...petProfiles[currentEditIndex].moodHistory] 
          : [];
    
        if (newMood) {
         history.push({
         date: new Date().toISOString().split("T")[0],
         mood: newMood
         });
          }
        return history;
         })() // END OF MOOD HISTORY 
        };
        // ✅ ADD THIS LINE IMMEDIATELY AFTER required for firestore saving
        newProfile.userId = userId;

        // 🖼️ Gallery Consolidation
        if (isEditing) {
          console.log("✏️ Merging with existing gallery..."); // DEBUG LINE KEPT
          const oldGallery = petProfiles[currentEditIndex]?.gallery || [];
          newProfile.gallery = [...oldGallery, ...uploadedImageUrls];
        } else {
          newProfile.gallery = uploadedImageUrls;
        }
        

       // ========================
        // SECTION 7: FIRESTORE SYNC
        // ========================
        console.log("🔥 Saving to Firestore..."); // DEBUG LINE KEPT
        let docRef;
        if (isEditing && petProfiles[currentEditIndex]?.docId) {
          docRef = firebase.firestore().collection("profiles").doc(petProfiles[currentEditIndex].docId);
          await docRef.set(newProfile, { merge: true });
          console.log("🔄 Updated existing profile"); // DEBUG LINE KEPT
        } else {
          docRef = await firebase.firestore().collection("profiles").add(newProfile);
          await docRef.update({ docId: docRef.id });
          console.log("✨ Created new profile"); // DEBUG LINE KEPT
        }

        /// 🎉 Add birthday reminder if needed (updated to use upcomingBirthday)
        if (newProfile.nextBirthday) {
        const reminderData = {
        userId,
        petName: newProfile.name,
        date: Utils.formatFirestoreDate(newProfile.nextBirthday),
        type: "birthday",
        message: `${newProfile.name}'s birthday: ${Utils.getCountdown(newProfile.nextBirthday)}`, // "5 days until birthday! 🎉"
        createdAt: new Date().toISOString(),
        profileDocId: newProfile.docId,
        countdownDays: parseInt(Utils.getCountdown(newProfile.nextBirthday).split(' ')[0]), // Stores "5" (number)
        nickname: newProfile.nicknames || null
        };

          try {
            const reminderDoc = await firebase.firestore().collection("reminders").add(reminderData);
            newProfile.reminderDocId = reminderDoc.id;
            await reminderDoc.update({
              reminderId: reminderDoc.id
            });
          } catch (reminderErr) {
            console.warn("Reminder not saved:", reminderErr.message);
          }
        }

        // 🧠 Update local array & localStorage
        if (isEditing) {
          petProfiles[currentEditIndex] = newProfile;
        } else {
          petProfiles.push(newProfile);
        }

        localStorage.setItem("petProfiles", JSON.stringify(petProfiles));

       // ========================
// SECTION 8: UI UPDATE
// ======================== 
console.log("🖥️ Updating UI..."); // DEBUG LINE KEPT

// 🟢 SUCCESS MESSAGE
loaderText.innerHTML = isEditing ? 
  '<i class="fas fa-check-circle"></i> Profile updated!' : 
  '<i class="fas fa-check-circle"></i> Pet profile created!';

setTimeout(() => {
  showDashboard();
  loader.style.display = 'none';
  document.body.style.pointerEvents = 'auto';
  window.scrollTo(0, 0); // Ensures consistent scrolling
}, 1500);

} catch (err) {
  console.error("Profile save failed:", err);
  // 🟢 ERROR MESSAGE
  loaderText.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to save';
    setTimeout(() => loader.style.display = 'none', 3000);
    window.scrollTo(0, 0);
    console.error("Save failed:", err);

} finally {
  submitBtn.innerHTML = originalBtnText;
  submitBtn.disabled = false;

        // ✅ Safely clear petGallery input
        const galleryInput = document.getElementById("petGallery");
        if (galleryInput) galleryInput.value = "";

        // ✅ Refresh gallery preview after submission/wrapped in an if block
          if (typeof newProfile !== "undefined") {
        const galleryPreview = document.getElementById("editGalleryPreview");
       if (galleryPreview && newProfile.gallery?.length) {
        galleryPreview.innerHTML = newProfile.gallery.map(img => 
        `<img src="${typeof img === 'string' ? img : img.url}" class="preview-thumb">`
      ).join('');
          }
        } // closes if 
      } // ✅ closes finally
    }); // ✅ closes addEventListener

    DOM.profileForm.dataset.listenerAttached = "true"; // ✅ Prevent duplicates
  } // closes the if (!Dom.profileForm.dataset.listenerAttached)
} // closes the function

//==============================================
// Start initialization based on document state
//=================================================
document.addEventListener('DOMContentLoaded', () => {
  initDashboardDOM(); // 🧠 Make sure DOM references are set
  initializeDashboard(); // ✅ Use the correct one
  initSessionRecovery(); // Initialize session recovery when DOM is ready
});

