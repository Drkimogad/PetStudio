//🌟 Pet Profile Management 🌟
const addPetProfileBtn = document.getElementById("addPetProfileBtn");

// Render all pet profiles
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
//🌟 Updated Profile Form Submission with Cloudinary 🌟
DOM.profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
console.log("🛑 Prevented default form submission.");  
  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '⏳ Saving...';
  submitBtn.disabled = true;

  try {
    // 1. Handle image uploads to Cloudinary
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
        Utils.showErrorToUser(`Failed to upload ${file.name}. Please try again.`);
      } finally {
        showLoading(false);
      }
    }
    // 2. Prepare mood history
    const moodHistory = moodHistoryInput?.value
  ? [{ 
      date: new Date().toISOString().split("T")[0], 
      mood: moodHistoryInput.value 
    }]
  : [];
    // 3. Create profile object
    const newProfile = {
      id: Date.now(),
      name: document.getElementById("petName").value,
      breed: document.getElementById("petBreed").value,
      dob: document.getElementById("petDob").value,
      birthday: document.getElementById("petBirthday").value,
      gallery: uploadedImageUrls, // Using Cloudinary URLs
      moodHistory: moodHistory,
      coverPhotoIndex: 0
    };

    // 4. Save to storage
    if (isEditing) {
      petProfiles[currentEditIndex] = newProfile;
    } else {
      petProfiles.push(newProfile);
    }
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

    // 5. Handle birthday reminders (unchanged Firebase Firestore code)
    if (newProfile.birthday) {
      const reminderData = {
        console.log("👤 Current user at submit time:", auth?.currentUser);
        userId: auth.currentUser?.uid || "anonymous",
        petName: newProfile.name,
        date: formatFirestoreDate(newProfile.birthday),
        message: `It's ${newProfile.name}'s birthday today! 🎉`,
        createdAt: new Date().toISOString()
      };
      
      try {
        await firebase.firestore().collection("reminders").add(reminderData);
      } catch (firestoreError) {
        console.error("Reminder save failed:", firestoreError);
        // Non-blocking error
      }
    }

    // 6. Update UI
   DOM.profileSection.classList.add("hidden");
   DOM.petList.classList.remove("hidden");
   renderProfiles();
   window.scrollTo(0, 0);

// ✅ Add this log right here
   console.log("✅ Profile saved and UI updated");

  } catch (error) {
    console.error("Profile save failed:", error);
    Utils.showErrorToUser("Failed to save profile. Please check your inputs.");
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    showLoading(false);
  }
});

// Helper function (keep this)
function formatFirestoreDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}
// Add Pet Profile Button Listener recently added
addPetProfileBtn?.addEventListener('click', () => {
  console.log("🟡 Add Pet Profile clicked");
  const profileSection = document.getElementById("profileSection");
  if (profileSection) profileSection.classList.remove("hidden");
});
// Handle Logout recently added
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    await firebase.auth().signOut();
    localStorage.removeItem('petProfiles');
    window.location.reload(); // Reload to reset app state
  } catch (error) {
    console.error("Logout failed:", error);
    Utils.showErrorToUser("Logout failed. Please try again.");
  }
});
