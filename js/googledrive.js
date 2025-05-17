//🌟 Google Drive Integration (Complete) 🌟
// ====== Global Variables ======
let driveAPILoaded = false;
let driveAuthToken = null;

// ====== Initialize Drive API ======
function initGoogleDriveAPI(token, callback) {
  driveAuthToken = token;
  
  // Load GAPI client if not already loaded
  if (window.gapi) {
    initializeDriveClient(callback);
  } else {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => initializeDriveClient(callback);
    script.onerror = () => console.error('Failed to load Google API');
    document.head.appendChild(script);
  }
}

function initializeDriveClient(callback) {
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }).then(() => {
      driveAPILoaded = true;
      gapi.client.setToken({ access_token: driveAuthToken });
      if (callback) callback();
    });
  });
}

// ====== Core Drive Operations ======
function createDriveFolder(folderName, callback) {
  if (!driveAPILoaded) return console.error('Drive API not loaded');
  
  gapi.client.drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  }).then(response => callback(response.result.id))
    .catch(error => console.error('Folder creation failed:', error));
}

function findDriveFolder(folderName, callback) {
  gapi.client.drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive'
  }).then(response => {
    callback(response.result.files.length > 0 ? response.result.files[0].id : null);
  });
}

function getOrCreateAppFolder(callback) {
  findDriveFolder('PetStudio', (folderId) => {
    if (folderId) {
      callback(folderId);
    } else {
      createDriveFolder('PetStudio', callback);
    }
  });
}

// ====== Profile Operations ======
function saveProfileToDrive(profile, callback) {
  getOrCreateAppFolder((folderId) => {
    const fileName = `pet_${profile.id}_${Date.now()}.json`;
    
    gapi.client.drive.files.create({
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
    }).then(response => {
      if (callback) callback({
        fileId: response.result.id,
        link: response.result.webViewLink
      });
    });
  });
}

function deleteDriveFile(fileId, callback) {
  gapi.client.drive.files.delete({ fileId })
    .then(() => callback(true))
    .catch(error => {
      console.error('Delete failed:', error);
      callback(false);
    });
}

// ====== Public Interface ======
window.GoogleDrive = {
  init: initGoogleDriveAPI,
  saveProfile: saveProfileToDrive,
  deleteFile: deleteDriveFile,
  getOrCreateFolder: getOrCreateAppFolder
};
