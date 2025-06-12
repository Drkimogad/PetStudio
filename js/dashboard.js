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
  }

  const moodInput = document.getElementById("moodHistoryInput");
  if (moodInput) {
    moodInput.value = profile.moodHistory
      .map(entry => `${entry.date}:${entry.mood}`)
      .join("\n");
  }

  DOM.profileSection.classList.remove("hidden"); 
  DOM.fullPageBanner.classList.add("hidden");
}

// 🌀 UPGRADED DELETE BUTTON FUNCTION WAS MISSING
async function deleteProfile(index) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  const profile = petProfiles[index];
  
  try {
    // 1. Delete Cloudinary images first (if they exist)
    if (Array.isArray(profile.gallery)) {
      await Promise.all(profile.gallery.map(async (image) => {
        if (image?.public_id) {
          try {
            await deleteImageFromCloudinary(image.public_id);
          } catch (err) {
            console.warn("Cloudinary delete failed:", err.message);
          }
        }
      }));
    }

    // 2. Delete Firestore documents (if they exist)
    const deletePromises = [];
    
    if (profile.docId) {
      deletePromises.push(
        firebase.firestore().collection("profiles").doc(profile.docId).delete()
      );
    }
    
    if (profile.reminderDocId) {
      deletePromises.push(
        firebase.firestore().collection("reminders").doc(profile.reminderDocId).delete()
      );
    }

    await Promise.all(deletePromises);

    // 3. Delete from local storage
    petProfiles.splice(index, 1);
    localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
    renderProfiles();
    
    Utils.showErrorToUser(`${profile.name}'s profile was deleted.`, true);
    
  } catch (error) {
    console.error("Delete failed:", error);
    Utils.showErrorToUser("Failed to delete profile completely.");
  }
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
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .print-header { 
            text-align: center; 
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #6a0dad;
          }
          .print-header h1 {
            color: #6a0dad;
            margin: 0 0 5px 0;
            font-size: 28px;
          }
          .print-header p {
            color: #666;
            margin: 0;
          }
          .print-details {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .print-details p {
            margin: 8px 0;
            font-size: 15px;
          }
          .print-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin: 25px 0;
          }
          .print-gallery img {
            width: 100%;
            height: 200px;
            object-fit: contain;
            border-radius: 6px;
            border: 1px solid #eee;
            background: #f5f5f5;
            padding: 5px;
            box-sizing: border-box;
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
            font-size: 18px;
          }
          .print-moodlog ul {
            list-style: none;
            padding: 0;
            margin: 10px 0 0 0;
          }
          .print-moodlog li {
            font-size: 15px;
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
            display: none;
          }
          @media print {
            body {
              padding: 0 10px;
            }
            .print-header {
              margin-top: 10px;
            }
            .print-gallery {
              page-break-inside: avoid;
            }
            .print-gallery img {
              height: 180px;
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

// Mood history (💡 LEAVE THIS AS-IS per your request)
const moodInput = document.getElementById("moodHistoryInput");
const moodHistory = moodInput?.value
  ? [{
      date: new Date().toISOString().split("T")[0],
      mood: moodInput.value
    }]
  : [];

// Create profile object (initial version without docId/reminderDocId)
const newProfile = {
  id: newProfileId,
  name: document.getElementById("petName").value,
  breed: document.getElementById("petBreed").value,
  dob: document.getElementById("petDob").value,
  birthday: document.getElementById("petBirthday").value,
  moodHistory: moodHistory,
  coverPhotoIndex: 0 // Optional default
  // ⛔ Do NOT set gallery yet
};

if (isEditing) {
  const oldGallery = petProfiles[currentEditIndex]?.gallery || [];
  
  // Preserve original gallery and only add truly new images
  newProfile.gallery = [...oldGallery]; // Keep original references
  
  // Add new images that aren't duplicates
  for (const newImg of uploadedImageUrls) {
    const isDuplicate = oldGallery.some(oldImg => {
      if (typeof oldImg === 'string') {
        return oldImg === newImg.url; // Compare string URLs
      }
      return oldImg.url === newImg.url; // Compare object URLs
    });
    
    if (!isDuplicate) {
      newProfile.gallery.push(newImg);
    }
  }

  petProfiles[currentEditIndex] = newProfile;
} else {
  // New profile → include the uploaded gallery directly
  newProfile.gallery = uploadedImageUrls;
  petProfiles.push(newProfile);
}
localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
          
// Save to Firestore first and get docId
// Enhanced Firestore Save with proper error handling and validation
try {
  // 1. Validate essential profile data before saving
  if (!newProfile.name || !newProfile.breed) {
    throw new Error("Pet name and breed are required");
  }

  // 2. Save to Firestore with transaction support
  const batch = firebase.firestore().batch();
  const profileRef = firebase.firestore().collection("profiles").doc();
  
  // Prepare profile data (exclude temporary fields)
  const profileData = {
    userId,
    name: newProfile.name,
    breed: newProfile.breed,
    dob: newProfile.dob || null,
    birthday: newProfile.birthday || null,
    gallery: newProfile.gallery || [],
    moodHistory: newProfile.moodHistory || [],
    coverPhotoIndex: newProfile.coverPhotoIndex || 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  batch.set(profileRef, profileData);

  // 3. Handle birthday reminder if exists
  if (newProfile.birthday) {
    try {
      const formattedDate = Utils.formatFirestoreDate(newProfile.birthday);
      if (!formattedDate) throw new Error("Invalid birthday format");
      
      const reminderRef = firebase.firestore().collection("reminders").doc();
      const reminderData = {
        userId,
        petName: newProfile.name,
        date: formattedDate,
        message: `It's ${newProfile.name}'s birthday today! 🎉`,
        petProfileId: profileRef.id, // Reference to main profile
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        notifyDaysBefore: 3 // Optional: Add reminder before birthday
      };

      batch.set(reminderRef, reminderData);
      newProfile.reminderDocId = reminderRef.id;
    } catch (reminderError) {
      console.error("Reminder preparation failed:", reminderError);
      // Continue without failing the entire operation
    }
  }

  // 4. Commit the batch
  await batch.commit();
  newProfile.docId = profileRef.id;

  // 5. Verify the write
  const docSnapshot = await profileRef.get();
  if (!docSnapshot.exists) {
    throw new Error("Failed to verify Firestore creation");
  }

  // 6. Update local storage with complete profile data
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

} catch (error) {
  console.error("Firestore save failed:", error);
  // Revert local changes if Firestore save failed
  if (isEditing) {
    petProfiles[currentEditIndex] = originalProfile; // Keep reference to original
  } else {
    petProfiles.pop(); // Remove the newly added profile
  }
  throw error; // Re-throw for form handler to catch
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
