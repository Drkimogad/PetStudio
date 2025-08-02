// image preview in new creation and open edit form to be fixed
// QR code to be finalized.

//🌟 Global declarations 🌟
let currentQRProfile = null; // Only new declaration needed
let generatingQR = false; // <== global scope
setupPetProfileDelegation();

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

//========================
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
  if(petProfiles.length === 0) {
    DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
    return;
  }
  else {
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
    const coverPhotoUrl = typeof coverImageObj === "string"
      ? coverImageObj
      : coverImageObj?.url;

    const profileHeaderStyle = coverPhotoUrl
      ? `style="background-image: url('${coverPhotoUrl}');"`
      : '';
      
      petCard.innerHTML = `
      
        <div class="profile-header" ${profileHeaderStyle}>
          <h3>${profile.name}</h3>
           ${profile.nicknames ? `<p class="nickname">"${profile.nicknames}"</p>` : ''}
          <p class="countdown">${getCountdown(profile.birthday)}</p>
        </div>
        
        <div class="profile-details">
          <p><strong>Breed:</strong> ${profile.breed}</p>
          <p><strong>DOB:</strong> ${profile.dob}</p>
          <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
        </div>

      <!-- === ADD HERE CELEBRATE BUTTON CLICKING WILL TRIGGERE THE TEMPLATES! === -->
    <div class="birthday-reminder">
      ${profile.birthday ? `
        <span>${getCountdown(profile.birthday)}</span>
      ` : ''}
    </div>

      <div class="profile-reminder">
           <p><strong>Reminder:</strong> It's ${profile.name}'s birthday on ${profile.birthday} 🎉</p>
        </div>
        
<div class="gallery-grid">
  ${(() => {
    // Debug first - log the gallery data with both profile.id AND index
    console.log('Validating gallery for profile:', { 
      id: profile.id, 
      index: index,
      gallery: profile.gallery 
    });
    
    // Fixed validation with index in warning
    if (!Array.isArray(profile.gallery)) {
      console.warn(`Gallery is not an array for profile (Index:${index}, ID:${profile.id})`);
      return '<p class="gallery-warning">⚠️ No valid gallery data</p>';
    }
    
    if (profile.gallery.length === 0) {
      console.warn(`Empty gallery for profile (Index:${index}, ID:${profile.id})`);
      return '<p class="gallery-empty">No photos yet</p>';
    }
    
    return profile.gallery.map((img, imgIndex) => {
      let imgUrl = '';
      
      if (typeof img === 'string') {
        imgUrl = img;
      } else if (img?.url) {
        imgUrl = img.url;
      }

      // Skip if URL contains template tags
      if (imgUrl.includes('{{') || imgUrl.includes('%7B%7B')) {
        console.warn(`Skipping invalid image URL at index ${imgIndex}`);
        return '';
      }

      return `
        <div class="gallery-item">
          <img src="${imgUrl}" alt="Pet photo ${imgIndex + 1}">
          <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}"
            data-index="${index}" data-photo-index="${imgIndex}">★</button>
        </div>
      `;
    }).join('');
  })()}
</div>

<div id="editGalleryPreview"></div>
<div id="galleryWarning" class="text-red-600 text-sm mt-2 hidden">
  ⚠️ Duplicate image detected. Please check your gallery!
</div>
<div id="errorBox" style="display:none; color: red; font-weight: bold;"></div>

       <div class="emergency-info">
    <h4>Emergency Contact</h4>
    <p><strong>Name:</strong> ${profile.emergencyContact?.name || 'Not set'}</p>
    <p><strong>Phone:</strong> ${profile.emergencyContact?.phone || 'Not set'}</p>
    <p><strong>Relationship:</strong> ${profile.emergencyContact?.relationship || 'Not set'}</p>
    <p><strong>Microchip:</strong> ${profile.microchipNumber || 'Not registered'}</p>
  </div>

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
            ${renderMoodHistory(profile)}
       </div>

      <div class="pet-notes">
        <strong>Notes:</strong> 
       <p>${profile.notes?.replace(/\n/g, '<br>') || ''}</p>
       </div>
       
      <!-- Add this after other details but before buttons for tags -->
      ${profile.tags?.length ? `
       <div class="tags-container">
        ${profile.tags.map(tag => `
         <span class="tag-pill">${tag}</span>
        `).join('')}
       </div>
      ` : ''}  
       
      </div>
        <div class="pet-card" data-doc-id="${profile.docId}">
        <div class="action-buttons">
        <button class="edit-btn" data-index="${index}" data-doc-id="${profile.docId}">✏️ Edit Petcard</button>
        <button class="delete-btn" data-index="${index}" data-doc-id="${profile.docId}">🗑️ Delete Petcard</button>
        <button class="print-btn" data-index="${index}" data-doc-id="${profile.docId}">🖨️ Print Petcard</button>
        <button class="share-btn" data-index="${index}" data-doc-id="${profile.docId}">📤 Share Petcard</button>
        <button class="qr-btn" data-index="${index}" data-doc-id="${profile.docId}">🔲 Generate QR Code</button>
        <button class="collage-btn" data-index="${index}" data-doc-id="${profile.docId}">🖼️ Create Collage</button>
        <button 
            class="celebrate-btn" 
            data-index="${index}" 
            data-id="${profile.id}"
            ${!profile.birthday ? 'disabled style="opacity:0.5"' : ''}
          >
          🎉 Preview Card
        </button>        

        </div>
      </div>  
      `;
   
      DOM.petList.appendChild(petCard);
    });
  }
}

//==============================
// Calculate days until birthday
//=================================
function getCountdown(birthday) {
  const today = new Date();
  const nextBirthday = new Date(birthday);
  nextBirthday.setFullYear(today.getFullYear());
  if(nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  return `${diffDays} days until birthday! 🎉`;
}

//=============================
// Render mood history
//==========================
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
//==========================================
// Helper functions for theme togling
//==========================================
function toggleCelebrateButton(dateInput, index) {
  const petCard = document.querySelector(`.petCard[data-index="${index}"]`);
  const celebrateBtn = petCard.querySelector('.celebrate-btn');
  
  // Update button state
  celebrateBtn.disabled = !dateInput.value;
  celebrateBtn.style.opacity = dateInput.value ? 1 : 0.5;
  
  // Update data model if needed
  if (dateInput.value) {
    window.petProfiles[index].birthday = dateInput.value;
  }
}

//====================================
// CREATE COLLAGE HELPER FUNCTION
//===================================
let selectedImages = [];
let selectedLayout = '2x2';

function toggleImageSelection(e) {
  const img = e.target;
  img.classList.toggle('selected');
  const index = parseInt(img.dataset.index);

  if (img.classList.contains('selected')) {
    selectedImages.push(index);
  } else {
    selectedImages = selectedImages.filter(i => i !== index);
  }

  // Enable/disable generate button
  document.getElementById('generate-collage').disabled = selectedImages.length < 2;
}

// CORE BUTTONS FUNCTIONALITY🌀🌀🌀 
//======================================
// 🌀 EDIT PROFILE BUTTON FUNCTION IMAGE PREVIEW TO BE FIXED
//======================================
function openEditForm(petId, index, docId) {
  uploadedImageUrls = [];
  isEditing = true;
  currentEditIndex = index;
//added to debug
 console.log("petProfiles:", window.petProfiles);
 console.log("Requested index:", index);

  // Prefer using petId when possible
  const profile = window.petProfiles.find(p => p.id === petId) || 
                 window.petProfiles[index];
  if (!profile) {
    console.error("❌ No profile found at index", index);
    return;
  }

  // Fill form fields
  const nameField = document.getElementById("petName");
  const breedField = document.getElementById("petBreed");
  const dobField = document.getElementById("petDob");
  const bdayField = document.getElementById("petBirthday");
  const moodInput = document.getElementById("moodHistoryInput");

  if (nameField) nameField.value = profile.name || "";
  if (breedField) breedField.value = profile.breed || "";
  if (dobField) dobField.value = profile.dob || "";
  if (bdayField) bdayField.value = profile.birthday || "";
  if (moodInput && profile.moodHistory?.length > 0) moodInput.value = "";

  // Setup cover photo index on form (used on save)
  DOM.profileForm.dataset.coverIndex = profile.coverPhotoIndex ?? 0;

// ✅ Show gallery preview when editing
const galleryPreview = document.getElementById("editGalleryPreview");
if (galleryPreview && profile.gallery?.length) {
  galleryPreview.innerHTML = profile.gallery.map(img => {
    const imgUrl = typeof img === "string" ? img : img?.url;
    const safeUrl = imgUrl?.replace(/^http:/, 'https:');
    return `<img src="${safeUrl}" class="preview-thumb" style="max-height:60px; margin-right:5px;" />`;
  }).join('');
}
  
  // ✅ Insert Cancel button if not already added
  const form = document.getElementById("profileForm");
  if (form && !document.getElementById("cancelEditBtn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.type = "button";
    cancelBtn.className = "button cancel-edit-btn";
    cancelBtn.textContent = "❌ Cancel Edit";
    cancelBtn.style.marginLeft = "1rem";
    cancelBtn.addEventListener("click", cancelEdit);

    // Insert after submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.after(cancelBtn);
  }

  // Reveal editor
  DOM.profileSection.classList.remove("hidden");
  DOM.petList.classList.add("hidden");
  DOM.fullPageBanner.classList.add("hidden");
  window.scrollTo(0, 0); // scroll top
}


// function cancel edit recently added
function cancelEdit() {
  console.log("🛑 Cancel Edit triggered.");
  isEditing = false;
  currentEditIndex = -1;
  
 const preview = document.getElementById("editGalleryPreview");
 if (preview) preview.innerHTML = "";

  // Hide form, show dashboard again
  DOM.profileSection.classList.add("hidden");
  DOM.petList.classList.remove("hidden");
  DOM.fullPageBanner.classList.remove("hidden");

  // Remove cancel button
  const cancelBtn = document.getElementById("cancelEditBtn");
  if (cancelBtn) cancelBtn.remove();

  // Optionally reset form values (clean state)
  document.getElementById("profileForm").reset();
  window.scrollTo(0, 0); // scroll top
}

//==========≈==============
// 🌀 UPGRADED DELETE BUTTON WORKS FOR BOTH LOCALSTORAGE AND FIRESTORE
// DELET CLOUDINARY SDK FUNCTION TO BE IMPLEMENTED LATER
//=========================
async function deleteProfile(petId, index, docId) {
  if (!confirm("Are you sure you want to delete this profile?")) return;

  // Prefer using petId when possible
  const profile = window.petProfiles.find(p => p.id === petId) || 
                 window.petProfiles[index];
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
  loadSavedProfiles();
  Utils.showErrorToUser(`${deleted[0].name}'s profile was deleted.`, true);
}

//===========================================
// 🌀 PRINT PROFILE BUTTON FUNCTION
// OPTIMISED FOR TABLLET AND DESKTOIP
//================================================
function printProfile(profile) {
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

//===============================
// Generate Birthday card()
//==============================
//===============================
// Generate Birthday card()
//===============================
async function generateBirthdayCard(petId, index) {
    let blobUrl = null;
  
    try {
        // 1. Fetch the pet's profile
        const petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
        const profile = petProfiles.find(p => p.id === petId);
        if (!profile || !profile.birthday) return;

        // 2. Create a birthday-themed card container
        const card = document.createElement('div');
        card.className = 'birthday-card';
        card.innerHTML = `
            <div class="birthday-header">🎉 ${profile.name}'s Birthday! 🎉</div>
            <div class="birthday-countdown">${getCountdown(profile.birthday)}</div>
            <img src="${profile.gallery[profile.coverPhotoIndex]}" alt="${profile.name}" class="birthday-photo">
            <div class="birthday-footer">Celebrate on ${new Date(profile.birthday).toLocaleDateString()}</div>
        `;

        // 3. Convert to PNG (reuse your html2canvas logic)
        const canvas = await html2canvas(card, { 
            scale: 2,
            backgroundColor: '#fff8e6' // Light yellow
        });

        // 4. Share or download
        await new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                try {
                    const file = new File([blob], `${profile.name}_birthday.png`, { type: 'image/png' });
                    blobUrl = URL.createObjectURL(blob);

                    if (navigator.share?.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `${profile.name}'s Birthday Card`,
                            files: [file]
                        });
                    } else {
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${profile.name}_birthday.png`;
                        link.click();
                    }
                    resolve();
                } catch (error) {
                    console.error("Sharing failed:", error);
                    if (blobUrl) {
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${profile.name}_birthday.png`;
                        link.click();
                    }
                    reject(error);
                } finally {
                    if (blobUrl) {
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Generation failed:", error);
        throw error; // Re-throw if you want calling code to handle it
    }
}
//===============================
//  Create  AND GENERATE collage Core functionS
//===============================
// 1. CREATE COLLAGE FIRST
async function generateBirthdayCard(petId, index) {
  const profile = window.petProfiles?.[index];
  if (!profile?.gallery?.length) {
    showQRStatus("No photos available for collage.", false);
    return;
  }
  
  // Open modal
  const modal = document.getElementById("collage-modal");
  // Verify the modal exists in DOM before showing
  if (!modal) {
    console.error('Collage modal not found');
    return;
  }
  modal.classList.remove("hidden");

  // Populate image grid
  const grid = document.getElementById("collage-image-grid");
  grid.innerHTML = '';
  profile.gallery.forEach((img, i) => {
    const imgElement = document.createElement('img');
    imgElement.src = typeof img === 'string' ? img : img.url;
    imgElement.dataset.index = i;
    imgElement.addEventListener('click', toggleImageSelection);
    grid.appendChild(imgElement);
  });

  // Set up layout buttons
  document.querySelectorAll('.layout-options button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedLayout = e.target.dataset.layout;
    });
  });

  // Generate collage
  document.getElementById('generate-collage').addEventListener('click', () => {
    generateCollagePNG(profile);
  });
}

// 2. THEN GENERATE COLLAGE PNG
async function generateCollagePNG(profile) {
  if (selectedImages.length < 2) return;

  // Create collage container
  const collage = document.createElement('div');
  collage.className = `collage-layout-${selectedLayout}`;

  // Add selected images
  selectedImages.forEach(i => {
    const img = document.createElement('img');
    img.src = typeof profile.gallery[i] === 'string' ? profile.gallery[i] : profile.gallery[i].url;
    collage.appendChild(img);
  });

  // Apply layout-specific CSS
  const layoutStyles = {
    '2x2': 'grid-template-columns: repeat(2, 1fr);',
    '3x3': 'grid-template-columns: repeat(3, 1fr);',
    '1x3': 'grid-template-columns: repeat(3, 1fr); height: 200px;'
  };
  collage.style.cssText = `
    display: grid;
    gap: 5px;
    width: 600px;
    ${layoutStyles[selectedLayout]}
  `;

  // Convert to PNG
  try {
    const canvas = await html2canvas(collage);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    // Share or download
    if (navigator.share && navigator.canShare({ files: [new File([blob], 'collage.png')] })) {
      await navigator.share({
        title: `${profile.name}'s Collage`,
        files: [new File([blob], 'collage.png')]
      });
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.name}_collage.png`;
      link.click();
    }
  } catch (error) {
    console.error("Collage generation failed:", error);
    showQRStatus("Failed to create collage.", false);
  } finally {
    document.getElementById('collage-modal').classList.add('hidden');
    selectedImages = [];
  }
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
    linkElement.style.fontWeight = 'bold';  // Highlight URL
    linkElement.style.color = '#0066cc';    // Make URL stand out
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
        const file = new File([blob], `${profile.name}_profile.png`, { type: 'image/png' });
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
        const item = new ClipboardItem({ 'image/png': blob });
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
        text: `🐾 Meet ${profile.name}!\nBreed: ${profile.breed}\nBirthday: ${profile.birthday}\n\nView more: ${petStudioLink}`,
      });
    } else {
      alert(`Share this link manually: ${petStudioLink}`);
    }
  }
}

//===============================
//🌀 QR Code Managementenhanced
//===========================
//1. Generate QR code
function generateQRCode(profileIndex) {
  if (generatingQR) return;
  generatingQR = true;
  
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];

  const qrContent = JSON.stringify({
    n: currentQRProfile.name,
    b: currentQRProfile.breed,
    d: currentQRProfile.birthday,
    l: "https://drkimogad.github.io/PetStudio/"
  });

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
  if(canvas) {
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
    const text = `Check out ${currentQRProfile.name}'s profile!\n\nBreed: ${currentQRProfile.breed}\nBirthday: ${currentQRProfile.birthday}\n\nView more: https://drkimogad.github.io/PetStudio/`;

    // Priority: Share QR as PNG (mobile/tablets)
    if (canvas && navigator.share && navigator.canShare) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `${currentQRProfile.name}_qr.png`, { type: 'image/png' });
      
      if (navigator.canShare({ files: [file] })) {
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
      await navigator.share({ title: 'Pet Profile', text });
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
  if(!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? '#28a745' : '#dc3545';
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.style.color = '';
  }, 3000);
}


//==============  
// Log mood
//================
function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  if(!petProfiles[profileIndex].moodHistory) petProfiles[profileIndex].moodHistory = [];
  petProfiles[profileIndex].moodHistory.push({
    date: today,
    mood: mood
  });
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  loadSavedProfiles();
}
//=================
// Set cover photo
//====================
function setCoverPhoto(profileIndex, imageIndex) {
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  loadSavedProfiles();
}
  
//==========================================
// ✅ FINALIZED - setupPetProfileDelegation
// Handles all profile card actions centrally
//==========================================
function setupPetProfileDelegation() {
  DOM.petList?.addEventListener("click", (e) => {
    const target = e.target.closest('button');
    if (!target || !target.dataset.id) return; // Check for petId existence

    // Safely get all attributes - USE TARGET CONSISTENTLY
    const petId = target.dataset.id;
    const index = parseInt(target.dataset.index || "-1");
    const docId = target.dataset.docId;

    if (isNaN(index)) {
      console.warn("Invalid index on:", target.className);
      return;
    }

    // Debugging line - add this temporarily
    console.log('Button clicked:', target.className, {index, petId, docId});

    // === Action buttons ===
    if (target.classList.contains("edit-btn")) {
      openEditForm(petId, index, docId);
    } 
    else if (target.classList.contains("delete-btn")) {
      deleteProfile(petId, index, docId);
    } 
    else if (target.classList.contains("print-btn")) {
      printProfile(window.petProfiles[index] || 
                 window.petProfiles.find(p => p.id === petId));
    } 
    else if (target.classList.contains("share-btn")) {
      sharePetCard(window.petProfiles[index] || 
                 window.petProfiles.find(p => p.id === petId));
    } 
    else if (target.classList.contains("qr-btn")) {
      generateQRCode(index, petId); // Update function to accept both
    }
    else if (target.classList.contains("collage-btn")) {
      createPetCollage(index, petId); // Now takes both params
    }
    else if (target.classList.contains("celebrate-btn")) {
     generateBirthdayCard(petId, index); // petId comes from data-id
    }
    else if (target.classList.contains("mood-btn")) {
      const mood = target.dataset.mood;
      if (mood) logMood(index, petId, mood); // Update mood logger
    }
    else if (target.classList.contains("cover-btn")) {
      const photoIndex = parseInt(target.dataset.photoIndex, 10);
      if (!isNaN(photoIndex)) {
        setCoverPhoto(index, petId, photoIndex); // Update to take petId
      }
    }
  });
}
// renderProfiles(0 was abstracted to loadSavedProfiles()
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
      isEditing = false;
      currentEditIndex = -1;
      DOM.profileSection.classList.remove('hidden');
      DOM.petList.classList.add('hidden');
      attachFormListenerWhenReady();
    });
  }
}

//==================================================
// MOVED FORM SUBMISSION INSIDE INITIALIZEDASHBOARD
//====================================================
function attachFormListenerWhenReady() {
  
// the whole form submission wrapped in an if block 
// ✅ Only attach once
if (DOM.profileForm && !DOM.profileForm.dataset.listenerAttached) {

// Enable live preview when user selects images ADDED RECENTLY
document.getElementById("petGallery").addEventListener("change", function () {
  const preview = document.getElementById("editGalleryPreview");
  const files = Array.from(this.files);
  if (!preview) return;

  preview.innerHTML = ""; // clear before showing new previews
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML += `<img src="${e.target.result}" class="preview-thumb" style="max-height:60px; margin-right:5px;" />`;
    };
    reader.readAsDataURL(file);
  });
});
  
// OLD SECTION     
DOM.profileForm.addEventListener("submit", async (e) => {
console.log("✅ Form submission listener attached."); // You already had this 👍
console.log("📨 Submit triggered!");
  e.preventDefault(); 
  
  console.log("🧪 Auth before saving:", firebase.auth().currentUser);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '⏳ Saving...';
  submitBtn.disabled = true;

  try {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");

    const newProfileId = Date.now();

    // 📁 Upload gallery
    const galleryFiles = Array.from(document.getElementById("petGallery").files);
    const uploadedImageUrls = [];

    if (galleryFiles.length > 0) { // added
    for (const file of galleryFiles) {
      try {
        showLoading(true);
        const result = await uploadToCloudinary(file, userId, newProfileId);
        if (result?.url) {
          uploadedImageUrls.push(result);
        }
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        Utils.showErrorToUser(`Failed to upload ${file.name}.`);
      } finally {
        showLoading(false);
      } //closes finally
    }// closes 2nf if
  } // closes 1st if
    
  // 😺 Mood logic (preserve and append)
    const moodInput = document.getElementById("moodHistoryInput");
    let moodHistory = [];

    if (isEditing && petProfiles[currentEditIndex]?.moodHistory) {
      moodHistory = [...petProfiles[currentEditIndex].moodHistory];
    }

    const newMood = moodInput?.value?.trim();
    if (newMood) {
      moodHistory.push({
        date: new Date().toISOString().split("T")[0],
        mood: newMood
      });
    }

// ✅ Extract tags BEFORE creating newProfile
const tagSelect = document.getElementById("petTags");
const selectedTags = Array.from(tagSelect?.selectedOptions || []).map(opt => opt.value);

// 🧠 Construct newProfile object
const newProfile = {
  id: newProfileId,
  name: document.getElementById("petName").value,
  nicknames: document.getElementById("petNicknames")?.value || "",
  breed: document.getElementById("petBreed").value,
  dob: document.getElementById("petDob").value,
  birthday: document.getElementById("petBirthday").value,
  moodHistory,
  emergencyContact: {
    name: document.getElementById("emergencyName").value.trim(),
    phone: document.getElementById("emergencyPhone").value.trim(),
    relationship: document.getElementById("emergencyRelationship").value.trim()
  },
  microchipNumber: document.getElementById("microchipNumber").value.trim(),
  notes: document.getElementById("petNotes")?.value.trim() || "",
  tags: selectedTags, // ✅ Inserted properly now
  coverPhotoIndex: parseInt(DOM.profileForm.dataset.coverIndex, 10) || 0
};


    // 🧩 Merge gallery (EDIT vs CREATE)
    if (isEditing) {
  try {
    const oldGallery = petProfiles[currentEditIndex]?.gallery || [];
    const combinedGallery = [...oldGallery, ...uploadedImageUrls];

    // 🔶 Added null checks for image URLs
    const deduplicatedGallery = Array.from(
      new Map(combinedGallery.filter(img => img?.url || typeof img === "string").map(img => {
        const url = typeof img === "string" ? img : img.url;
        return [url, img];
      })).values()
    );

    newProfile.gallery = deduplicatedGallery;
  } catch (err) {
    console.error("Gallery merge failed, using new uploads only:", err);
    newProfile.gallery = uploadedImageUrls; // Fallback
  }
}

    // 🧨 Save to Firestore
    //Add this before Firestore save to convert selected tags into an array: Recently added
    // 🔶 Convert selected tags to array (e.g., ["birthday", "cute"])
const tagElements = document.querySelectorAll('#tagsDropdown input[type="checkbox"]:checked');
newProfile.tags = Array.from(tagElements).map(el => el.value);

// Proceed with Firestore save...
    let docRef;

    if (isEditing && petProfiles[currentEditIndex]?.docId) {
      // 🔁 Update existing
      docRef = firebase.firestore().collection("profiles").doc(petProfiles[currentEditIndex].docId);
      await docRef.set({ ...newProfile, userId }, { merge: true });
      newProfile.docId = petProfiles[currentEditIndex].docId;
    } else {
      // 🆕 New profile
      docRef = await firebase.firestore().collection("profiles").add({
        userId,
        ...newProfile
      });
      newProfile.docId = docRef.id;
      await docRef.update({ docId: docRef.id }); // ⬅️ Add docId field to doc
    }

    // 🎉 Add birthday reminder if needed inapp modified to include the new fields
    if (newProfile.birthday) {
  const reminderData = {
    userId,
    petName: newProfile.name,
    date: Utils.formatFirestoreDate(newProfile.birthday),
    type: "birthday",
    // 🔶 Use getCountdown() for dynamic messaging
    message: `${newProfile.name}'s birthday: ${getCountdown(newProfile.birthday)}`, // "5 days until birthday! 🎉"
    createdAt: new Date().toISOString(),
    profileDocId: newProfile.docId,
    // 🔶 Add countdown days for sorting/filtering later
    countdownDays: parseInt(getCountdown(newProfile.birthday).split(' ')[0]), // Stores "5" (number)
    nickname: newProfile.nicknames || null
  };

      try {
        const reminderDoc = await firebase.firestore().collection("reminders").add(reminderData);
        newProfile.reminderDocId = reminderDoc.id;
        await reminderDoc.update({ reminderId: reminderDoc.id });
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

    // ✅ UI Update
    showDashboard();
      
    window.scrollTo(0, 0);
    console.log("✅ Profile saved and UI updated.");

  } catch (err) {
    console.error("Profile save failed:", err);
    Utils.showErrorToUser("❌ Failed to save profile.");
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    showLoading(false);
    
   // ✅ Safely clear petGallery input
   const galleryInput = document.getElementById("petGallery");
      if (galleryInput) galleryInput.value = ""; 
    
  // ✅ Refresh gallery preview after submission/wrapped in an if block
   if (typeof newProfile !== "undefined") { 
  const galleryPreview = document.getElementById("editGalleryPreview");
  if (galleryPreview && newProfile.gallery?.length) {
  galleryPreview.innerHTML = newProfile.gallery.map(img => {
    const imgUrl = typeof img === "string" ? img : img?.url;
    const safeUrl = imgUrl?.replace(/^http:/, 'https:');
    return `<img src="${safeUrl}" class="preview-thumb" style="max-height:60px; margin-right:5px;" />`;
    }).join('');
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
  initDashboardDOM();      // 🧠 Make sure DOM references are set
  initializeDashboard();     // ✅ Use the correct one
});

