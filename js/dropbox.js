//🌟 Dropbox Integration 🌟

// Initialize Dropbox SDK
const dbx = new Dropbox.Dropbox({ accessToken: 'YOUR_ACCESS_TOKEN' });

// Get or create a folder in Dropbox
async function getOrCreateDropboxFolderId() {
  try {
    // Check if 'PetStudio' folder exists
    const folderMetadata = await dbx.filesListFolder({ path: '' });
    const folder = folderMetadata.entries.find(entry => entry.name === 'PetStudio');

    if (folder) {
      return folder.id;
    }

    // Create 'PetStudio' folder if it doesn't exist
    const createdFolder = await dbx.filesCreateFolderV2({ path: '/PetStudio' });
    return createdFolder.metadata.id;
  } catch (error) {
    console.error("❌ Dropbox folder creation failed:", error);
    throw error;
  }
}

// Save profile to Dropbox
async function saveProfileToDropbox(profile) {
  try {
    const folderId = await getOrCreateDropboxFolderId();
    const fileName = `${profile.name.replace(/\s+/g, "_")}_${profile.id || Date.now()}.json`;

    const fileContent = JSON.stringify({
      ...profile,
      lastUpdated: new Date().toISOString()
    });

    const fileBlob = new Blob([fileContent], { type: 'application/json' });
    const fileUploadPath = `/PetStudio/${fileName}`;

    const response = await dbx.filesUpload({
      path: fileUploadPath,
      contents: fileBlob
    });

    console.log("✅ Saved to Dropbox:", response);
    return response;
  } catch (error) {
    console.error("❌ Dropbox save failed:", error);
    throw error;
  }
}

// Unified save function
async function savePetProfile(profile) {
  if (isEditing) {
    petProfiles[currentEditIndex] = profile;
  } else {
    petProfiles.push(profile);
  }
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

  const isDropboxUser = auth.currentUser?.providerData?.some(
    p => p.providerId === 'dropbox.com'
  );

  if (isDropboxUser && dbx) {
    try {
      await saveProfileToDropbox(profile);
    } catch (dropboxError) {
      console.warn("⚠️ Dropbox backup failed. Falling back to Firestore.");
      try {
        await saveToFirestore(profile);
      } catch (firestoreError) {
        console.error("❌ Firestore fallback also failed:", firestoreError);
      }
    }
  }
}

// Delete profile
async function deleteProfile(index) {
  const profile = petProfiles[index];
  if (!confirm("Are you sure you want to delete this profile?")) return;

  const fileId = profile.dropboxFileId;
  if (fileId) {
    try {
      await deleteProfileFromDropbox(fileId, profile.gallery);
    } catch (dropboxError) {
      console.error("Error deleting Dropbox files:", dropboxError);
    }
  }

  petProfiles.splice(index, 1);
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Delete from Dropbox
async function deleteProfileFromDropbox(fileId, gallery = []) {
  if (gallery.length > 0) {
    for (let img of gallery) {
      await deleteImageFromDropbox(img);
    }
  }

  try {
    await dbx.filesDeleteV2({ path: `/PetStudio/${fileId}` });
  } catch (error) {
    console.error('Error deleting profile from Dropbox:', error);
  }
}
