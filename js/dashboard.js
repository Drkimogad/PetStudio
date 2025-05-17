// DOM Elements Collection
const DOM = {
  // Form Elements
  profileSection: document.getElementById('profileSection'),
  fullPageBanner: document.getElementById('fullPageBanner'),
  petList: document.getElementById('petList'),
  profileForm: document.getElementById('profileForm'),
  
  // Input Fields
  petName: document.getElementById('petName'),
  petBreed: document.getElementById('petBreed'),
  petDob: document.getElementById('petDob'),
  petBirthday: document.getElementById('petBirthday'),
  moodHistoryInput: document.getElementById('moodHistoryInput'),
  
  // QR Modal
  qrModal: document.getElementById('qr-modal')
};

// Utility Functions 
const Utils = {
  getCountdown: function(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  },

  getMoodEmoji: function(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  },

  formatFirestoreDate: function(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  calculateAge: function(dobString) {
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
  },

  showErrorToUser: function(message, isSuccess = false) {
    try {
      const errorDiv = document.getElementById('error-message');
      if (!errorDiv) {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'error-message';
        newErrorDiv.className = isSuccess ? 'success-message' : 'auth-error';
        newErrorDiv.textContent = message;
        document.querySelector('#authContainer').prepend(newErrorDiv);
      } else {
        errorDiv.textContent = message;
        errorDiv.className = isSuccess ? 'success-message' : 'auth-error';
      }
    } catch (fallbackError) {
      alert(message);
    }
  },

  disableUI: function() {
    document.body.innerHTML = `
      <h1 style="color: red; padding: 2rem; text-align: center">
        Critical Error: Failed to load application interface
      </h1>
    `;
  }
};

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/PetStudio/service-worker.js', {
      scope: '/PetStudio/'
    }).then(registration => {
      console.log('SW registered for scope:', registration.scope);
    }).catch(error => {
      console.error('SW registration failed:', error);
    });
  });
}

//🌟 Pet Profile Management 🌟
// Unified save function - REPLACE THIS ENTIRE FUNCTION
async function savePetProfile(profile) {
  if (isEditing) {
    petProfiles[currentEditIndex] = profile;
  } else {
    petProfiles.push(profile);
  }
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

  // NEW GOOGLE DRIVE INTEGRATION (replaces Dropbox/Firestore)
    if (window.currentUser?.email && window.GoogleDrive) {
      await new Promise(resolve => {
        GoogleDrive.saveProfile(profile, (result) => {
          profile.driveId = result.fileId;
          Utils.showErrorToUser('Saved to Google Drive!', true);
          resolve();
        });
      });
    }
  } catch (error) {
    console.error("Save failed:", error);
    Utils.showErrorToUser("Failed to save to Google Drive");
   }
  }
}

// ADD THESE NEW FUNCTIONS RIGHT AFTER savePetProfile
async function loadFromDrive() {
  if (!window.GoogleDrive || !window.currentUser) return [];

  try {
    // 1. Get folder ID
    const folderId = await new Promise(resolve => 
      GoogleDrive.getOrCreateFolder(resolve));

    // 2. List all JSON files in the folder
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
      fields: 'files(id,name)',
      orderBy: 'modifiedTime desc'
    });

    // 3. Download and parse each file
    const driveProfiles = [];
    for (const file of response.result.files) {
      const fileContent = await gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media'
      });
      
      try {
        const profile = JSON.parse(fileContent.body);
        profile.driveId = file.id; // Track Drive file ID
        driveProfiles.push(profile);
      } catch (e) {
        console.warn(`Failed to parse ${file.name}`, e);
      }
    }

    return driveProfiles;
  } catch (error) {
    console.error("Drive load failed:", error);
    showErrorToUser("Failed to load from Google Drive");
    return [];
  }
}

function mergeProfiles(local, drive) {
  const merged = [...local];
  drive.forEach(driveProfile => {
    const exists = merged.some(p => p.id === driveProfile.id);
    if (!exists) merged.push(driveProfile);
  });
  return merged;
}

// 🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀🌀  
// RENDER ALL PET PROFILES
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

// Create new profile
function createNewProfile() {
  const timestamp = Date.now();
  const newProfile = {
    id: timestamp,
    fileName: `pet_${timestamp}`,
    name: document.getElementById('petName').value,
    breed: document.getElementById('petBreed').value,
    dob: document.getElementById("petDob").value,
    birthday: document.getElementById("petBirthday").value,
    gallery: [],
    moodHistory: [],
    coverPhotoIndex: 0
  };
  petProfiles.push(newProfile);
  savePetProfile(newProfile);
  renderProfiles();
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

// Open edit form
function openEditForm(index) {
  isEditing = true;
  currentEditIndex = index;
  const profile = petProfiles[index];
  
  DOM.petName.value = profile.name;
  DOM.petBreed.value = profile.breed;
  DOM.petDob.value = profile.dob;
  DOM.petBirthday.value = profile.birthday;
  
  if (DOM.moodHistoryInput) {
    DOM.moodHistoryInput.value = profile.moodHistory
      .map(entry => `${entry.date}:${entry.mood}`)
      .join("\n");
  }

  DOM.profileSection.classList.remove("hidden"); 
  DOM.fullPageBanner.classList.add("hidden");
}

// Print profile
function printProfile(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  printDocument.write(`
    <html>
      <head>
        <title>${profile.name}'s Profile</title>
        <style>
          body { font-family: Arial; padding: 20px; -webkit-print-color-adjust: exact !important; }
          .print-header { text-align: center; margin-bottom: 20px; }
          .print-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 20px 0; }
          .print-gallery img { width: 100%; height: auto; object-fit: cover; }
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
} // <-- THIS WAS MISSING (closing brace for sharePetCard)

//🌟 QR Code Management 🌟
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

// Initialize QR modal
function initQRModal() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#qr-modal')) return;
    const modal = document.getElementById('qr-modal');
    modal.style.display = 'block'; 
    document.body.style.overflow = 'hidden';
      
    if(e.target.classList.contains('qr-print')) {
      printQR();
    } else if(e.target.classList.contains('qr-download')) {
      downloadQR();
    } else if(e.target.classList.contains('qr-share')) {
      shareQR();
    } else if(e.target.classList.contains('qr-close')) {
      modal.style.display = 'none';
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

// Profile form submission
DOM.profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = "test-user";
  const petName = document.getElementById("petName").value;
  const petBreed = document.getElementById("petBreed").value;
  const petDob = document.getElementById("petDob").value;
  const birthday = document.getElementById("petBirthday").value;
  const galleryFiles = Array.from(document.getElementById("petGallery").files);
  
  if(birthday) {
    const reminderData = {
      userId: userId,
      petName: petName,
      date: formatFirestoreDate(birthday),
      message: `It's ${petName}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
      createdAt: new Date().toISOString()
    };
    try {
      await firebase.firestore().collection("reminders").add(reminderData);
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  }

  const moodHistoryInput = document.getElementById("moodHistoryInput");
  const moodHistory = moodHistoryInput && moodHistoryInput.value.trim()
    ? moodHistoryInput.value.trim().split("\n").map(line => {
        const [date, mood] = line.split(":");
        return { date: date.trim(), mood: mood.trim() };
      })
    : [];

  const galleryUrls = await Promise.all(
    galleryFiles.map(async file => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise(resolve => {
        img.onerror = resolve;
        img.onload = resolve;
        img.src = url;
      });
      return url;
    })
  );

  const newProfile = {
    id: Date.now(),
    name: petName,
    breed: petBreed,
    dob: petDob,
    birthday: birthday,
    gallery: galleryUrls,
    moodHistory: moodHistory,
    coverPhotoIndex: 0
  };

  if(isEditing) {
    petProfiles[currentEditIndex] = newProfile;
  } else {
    petProfiles.push(newProfile);
  }

  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
// NEWLY ADDED THIS DRIVE SYNC CALL:
  if (window.currentUser?.email && window.GoogleDrive) {
    try {
      await new Promise(resolve => {
        GoogleDrive.saveProfile(newProfile, (result) => {
          newProfile.driveId = result.fileId;
          resolve();
        });
      });
    } catch (driveError) {
      console.warn("Drive sync failed:", driveError);
    }
  }
  
  DOM.profileSection.classList.add("hidden");
  DOM.petList.classList.remove("hidden");
  renderProfiles();
  window.scrollTo(0, 0);
});

function formatFirestoreDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
 }
