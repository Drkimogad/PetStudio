//🌟 Google Drive Integration 🌟
// ====== Google APIs Initialization ======    
// google api loading function was removed
    // Initialize Google OAuth client
    window.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: "540185558422-64lqo0g7dlvms7cdkgq0go2tvm26er0u.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          console.log("Google token received");
        }
      },
    });
    
    if (typeof callback === "function") callback();
  }; // THIS BRACE WAS MISSING

  gsiScript.onerror = () => {
    console.error("❌ Failed to load GSI client script");
  };

  document.head.appendChild(gsiScript);
}
// ====== Token Management ======
async function refreshDriveTokenIfNeeded() {
  try {
    if (!auth?.currentUser) throw new Error("No authenticated user");

    const authResponse = await auth.currentUser.getIdTokenResult();
    const expiration = new Date(authResponse.expirationTime);

    if (expiration <= new Date()) {
      console.log("Token expired, requesting re-authentication");
      await signInWithRedirect(auth, provider);
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    Utils.showErrorToUser('Session expired - please re-login');
  }
}
// ====== Initialization ======
async function initializeAuth() {
  try {
    // 1. First load Firebase (since it's essential) removed
       
    // 2. Set up auth listeners early
    initAuthListeners(auth);
    
    // 3. Load Google APIs in parallel
    await new Promise((resolve) => {
      loadGoogleAPIs(resolve);
      setTimeout(resolve, 3000); // Fallback timeout
    });
    
    // 4. Set up UI
    showAuthForm('login');
    setupGoogleLoginButton();
    
    return { auth, provider };
  } catch (error) {
    console.error("Initialization failed:", error);
    disableUI();
  }
}

// Add Loading States:
function showLoading(state) {
  document.getElementById('loadingIndicator').style.display = 
    state ? 'block' : 'none';
}

// Start initialization when DOM is ready
if (document.readyState === 'complete') {
  initializeAuth();
} else {
  document.addEventListener('DOMContentLoaded', initializeAuth);
}

// 🌟 Drive folder management 🌟
// Get or create Drive folder
async function getOrCreateDriveFolderId() {
  const response = await gapi.client.drive.files.list({
    q: "name='PetStudio' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: "files(id)",
    spaces: 'drive'
  });
  if(response.result.files.length > 0) {
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

// Save profile to Drive
async function saveProfileToDrive(profile) {
  try {
    if(!gapi.client.drive) {
      throw new Error("Drive API not initialized");
    }
    const folderId = await getOrCreateDriveFolderId();
    const fileName = `${profile.name.replace(/\s+/g, "_")}_${profile.id || Date.now()}.json`;
    const metadata = {
      name: fileName,
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
    console.log("✅ Saved to Drive:", file.result);
    return file.result;
  } catch (error) {
    console.error("❌ Drive save failed:", error);
    throw error;
  }
}

// Unified save function
async function savePetProfile(profile) {
  if(isEditing) {
    petProfiles[currentEditIndex] = profile;
  } else {
    petProfiles.push(profile);
  }
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  
  const isGoogleUser = auth.currentUser?.providerData?.some(
    p => p.providerId === 'google.com'
  );
  
  if(isGoogleUser && gapi.client?.drive) {
    try {
      await saveProfileToDrive(profile);
    } catch (driveError) {
      console.warn("⚠️ Drive backup failed. Falling back to Firestore.");
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
  
  const fileId = profile.driveFileId;
  if (fileId) {
    try {
      await deleteProfileFromDrive(fileId, profile.gallery);
    } catch (driveError) {
      console.error("Error deleting Drive files:", driveError);
    }
  }

  petProfiles.splice(index, 1);
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Delete from Drive
async function deleteProfileFromDrive(fileId, gallery = []) {
  if (gallery.length > 0) {
    for (let img of gallery) {
      await deleteImageFromDrive(img);
    }
  }

  try {
    await gapi.client.drive.files.delete({ fileId });
  } catch (error) {
    console.error('Error deleting profile from Google Drive:', error);
  }
}
