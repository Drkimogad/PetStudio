//🌟 Google Drive Integration (Optimized) 🌟
let driveInitialized = false;

// ====== Core Drive Operations ======
async function ensureDriveReady() {
  if (!driveInitialized) {
    if (!window.gapi) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    await gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: "AIzaSyD_xWtrnzOql-sVMQk-0ruxF5kHgZhyO-g",
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: "https://www.googleapis.com/auth/drive.file"
      });
      driveInitialized = true;
    });
  }
}

async function createDriveFolder(folderName) {
  await ensureDriveReady();
  
  const response = await gapi.client.drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  });
  return response.result.id;
}

async function findDriveFolder(folderName) {
  await ensureDriveReady();
  
  const response = await gapi.client.drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive'
  });
  return response.result.files[0]?.id || null;
}

async function getOrCreateAppFolder() {
  const folderId = await findDriveFolder('PetStudio');
  return folderId || await createDriveFolder('PetStudio');
}

async function saveProfileToDrive(profile) {
  try {
    const folderId = await getOrCreateAppFolder();
    const fileName = `pet_${profile.id}_${Date.now()}.json`;
    
    const response = await gapi.client.drive.files.create({
      resource: {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId]
      },
      media: {
        mimeType: 'application/json',
        body: JSON.stringify(profile)
      },
      fields: 'id,webViewLink'
    });
    
    return {
      fileId: response.result.id,
      link: response.result.webViewLink
    };
  } catch (error) {
    console.error('Drive save failed:', error);
    throw new Error('Failed to save to Google Drive');
  }
}

async function deleteFromDrive(fileId) {
  try {
    await ensureDriveReady();
    await gapi.client.drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Drive delete failed:', error);
    return false;
  }
}

async function listDriveFiles() {
  await ensureDriveReady();
  const folderId = await getOrCreateAppFolder();
  
  const response = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
    fields: 'files(id,name,createdTime,modifiedTime)',
    orderBy: 'modifiedTime desc'
  });
  
  return response.result.files || [];
}

// ====== Public Interface ======
window.GoogleDrive = {
  saveProfile: saveProfileToDrive,
  deleteFile: deleteFromDrive,
  listFiles: listDriveFiles,
  getOrCreateFolder: getOrCreateAppFolder
};

// Automatic initialization when gapi is ready
if (window.gapi) {
  ensureDriveReady().catch(console.error);
}
