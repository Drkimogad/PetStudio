
// ======================
  // Enhanced Pet Profile Functions with Drive Backup
  // ======================
  // Existing addPetProfileBtn event listener remains unchanged
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

  // MODIFIED: Save to Google Drive with enhanced error handling
  async function saveProfileToDrive(profile) {
    try {
      // Check if we have Drive access
      if (!gapi.client.drive) {
        throw new Error("Drive API not initialized");
      }

      // Check for existing PetStudio folder
      let folderId = await getDriveFolderId();

      // Create the JSON file
      const file = await gapi.client.drive.files.create({
        name: `${profile.name}_${Date.now()}.json`, // Unique filename
        parents: folderId ? [folderId] : null,
        mimeType: 'application/json',
        body: JSON.stringify({
          ...profile,
          lastUpdated: new Date().toISOString()
        }),
        fields: 'id,name,webViewLink'
      });

      console.log("Saved to Drive:", file.result);
      return file.result;
    } catch (error) {
      console.error("Drive save failed:", error);
      throw error; // Rethrow to handle in calling function
    }
  }
  // NEW: Helper to get/create Drive folder
  async function getDriveFolderId() {
    try {
      const response = await gapi.client.drive.files.list({
        q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id)",
        spaces: 'drive'
      });

      if (response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create folder if not exists
      const folder = await gapi.client.drive.files.create({
        name: 'PetStudio',
        mimeType: 'application/vnd.google-apps.folder',
        fields: 'id'
      });

      return folder.result.id;
    } catch (error) {
      console.error("Drive folder operation failed:", error);
      return null;
    }
  }
  // MODIFIED: Main save function with Drive + Firestore fallback
  async function savePetProfile(profile) {
    // Your existing local storage logic
    if (isEditing) {
      petProfiles[currentEditIndex] = profile;
    } else {
      petProfiles.push(profile);
    }
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

    // NEW: Backup to Drive if Google-authenticated
    const isGoogleUser = auth.currentUser?.providerData?.some(
      p => p.providerId === 'google.com'
    );

    if (isGoogleUser && gapi.client.drive) {
      try {
        await saveProfileToDrive(profile);
      } catch (driveError) {
        console.warn("Drive backup failed, using Firestore fallback");
        // Add Firestore fallback here if needed
        // await saveToFirestore(profile);
      }
    }

    // Existing UI updates
    renderProfiles();
    profileSection.classList.add("hidden");
    fullPageBanner.classList.remove("hidden");
    isEditing = false;
    currentEditIndex = null;
  }
  // MODIFIED: Delete function with Drive cleanup
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
    // Existing deletion logic
    petProfiles.splice(index, 1);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }
  // function render profiles original//  
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
    coverPhotoIndex: 0,
    moodHistory: [] // 🆕 Add this line
  };
  petProfiles.push(newProfile);
  saveProfiles();
  renderProfiles();
}
  
export {
  savePetProfile,
  deleteProfile,
  renderProfiles,
  createNewProfile,
  getDriveFolderId,
  setupGalleryHandlers
};
