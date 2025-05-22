// ====== Firebase Storage ======
const storage = firebase.storage();
const storageRef = storage.ref();

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} petId - Associated pet profile ID
 * @returns {Promise<string>} Download URL
 */
async function uploadPetFile(file, petId) {
  try {
    // Create storage path: /pet-images/{petId}/{timestamp}-{filename}
    const filePath = `pet-images/${petId}/${Date.now()}-${file.name}`;
    const fileRef = storageRef.child(filePath);
    
    // Upload file
    await fileRef.put(file);
    
    // Get public URL
    return await fileRef.getDownloadURL();
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("File upload failed. Please try again.");
  }
}

/**
 * Deletes a file from Firebase Storage
 * @param {string} fileUrl - The file's download URL
 */
async function deletePetFile(fileUrl) {
  try {
    // Extract file path from URL
    const filePath = decodeURIComponent(
      new URL(fileUrl).pathname.split('/o/')[1].split('?')[0]
    );
    
    await storageRef.child(filePath).delete();
  } catch (error) {
    console.error("Delete failed:", error);
    throw new Error("Could not delete file.");
  }
}

// ====== Integration Helpers ======
/**
 * Handles pet gallery uploads
 * @param {FileList} files - From input[type="file"]
 * @param {string} petId 
 * @returns {Promise<string[]>} Array of download URLs
 */
async function handlePetGalleryUpload(files, petId) {
  const uploadPromises = Array.from(files).map(file => 
    uploadPetFile(file, petId)
  );
  return Promise.all(uploadPromises);
}

// Export for other files (if using modules)
// window.StorageAPI = { uploadPetFile, deletePetFile, handlePetGalleryUpload };
