// AGE PREVIEW USES THE LOGIC AT THE BOTTOM TO USE DOB AND CALCULATE THE AGE AND DISPLAY IT 
// AS A REALTIME IN PROFILEFORM AND GETS RENDERED AS WELL IN PETCARDS.
// GETCOUNTDOWN FUNCTION IS ONLY USED TO SHOW COUNTDOWN AND ITS ONLY USAGE IN REMINDERS IMPLEMENTATION FOR FIRESTORE
// FOR FUTURE IMPLEMENTATION OF PUSHNOTIFICATIONS!

//🌟 Main Application-Initialization-UTILs 🌟
// ================= UTILITY FUNCTIONS =================
//🔄 Updated uploadToCloudinary()
async function uploadToCloudinary(file, userId, petProfileId) {
  // 1. VALIDATE FILE TYPE
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG/PNG/WEBP images allowed!');
  }

  // 2. VALIDATE FILE SIZE (10MB)
  const maxSizeMB = 5;
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large! Max ${maxSizeMB}MB allowed`);
  }

  // 3. BUILD FOLDER PATH
  const folderPath = `PetStudio/users/${encodeURIComponent(userId)}/${encodeURIComponent(petProfileId)}/gallery/`;
  
  // 4. PREPARE UPLOAD
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'petstudio_auto_folder'); // As string!
  formData.append('folder', folderPath);
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');
  formData.append('secure', 'true');

  console.log("Using preset:", 'petstudio_auto_folder');
  console.log("📁 Upload folder:", folderPath);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dh7d6otgu/upload`, // Cloud name as string!
      { 
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return {
      url: data.secure_url, // Already HTTPS, no need to replace
      public_id: data.public_id,  // ✅ Keep this for deletion later renamed from path.
      path: data.public_id,
      width: data.width,
      height: data.height
    };

  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error;
  }
}

// OLD SECTION
const Utils = {
  // ===============================
getCountdown(birthday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  
  const nextBirthday = new Date(birthday);
  nextBirthday.setFullYear(today.getFullYear());
  nextBirthday.setHours(0, 0, 0, 0);
  
  // Handle past birthdays this year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  
  // New: Special cases
  switch (diffDays) {
    case 0:
      return "TODAY! 🎉🎂"; // Birthday is today
    case 1:
      return "Tomorrow! 🎉"; // More exciting for 1 day left
    default:
      return `${diffDays} days until birthday! 🎉`;
  }
},
//=============================
  // getmood emojies
//==============================
  getMoodEmoji(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  },

  formatFirestoreDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

//=============================
 // Render mood history
//==========================
  renderMoodHistory(profile) {  // <-- Method shorthand syntax
  // Safely handle missing/undefined moodHistory
  if (!profile.moodHistory || !Array.isArray(profile.moodHistory)) {
    return "No mood logs yet";
  }

  // Process last 7 valid entries
  return profile.moodHistory
    .slice(-7)
    .filter(entry => entry?.date && entry?.mood) // Filter invalid entries
     .map(entry => `${entry.date}: ${Utils.getMoodEmoji(entry.mood)}`) // ✅ instead of "this"
    .join('<br>');
},
  
  //==========================================
// AGE CALCULATION FUNCTION YEARS, MONTHS, DAYS.
  //=============================================
calculateAge(dobString) {
  try {
    const birthDate = new Date(dobString);
    const today = new Date();
    
    // Years
    let years = today.getFullYear() - birthDate.getFullYear();
    
    // Months
    let monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      monthDiff += 12; // Adjust negative month difference
    }
    
    // Days (new)
    let dayDiff = today.getDate() - birthDate.getDate();
    if (dayDiff < 0) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      dayDiff += lastMonth.getDate(); // Days from previous month
      monthDiff--;
    }

    return `${years} years, ${monthDiff} months, ${dayDiff} days`;
  } catch {
    return 'N/A';
  }
},

//==============================
// formatDate function
//==============================
formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(); // Simple version
},
//===============================================
  disableUI() {
    document.body.innerHTML = `
      <h1 style="color: red; padding: 2rem; text-align: center">
        Critical Error: Failed to load application interface
      </h1>
    `;
  }
}; // IT CLOSES UTILS FUNCTION BRACE
// END OF UTILS STACK OF FUNCTIONS


// ADDED OUTSIDE UTILS ()
//=============================
// SHOWAUTH FORM
//==========================
function showAuthForm() {
  const container = document.getElementById('authContainer') || document.getElementById('auth-container');
  if (container) container.classList.remove('hidden');
}

//==================================
// SHOW USER INFO
//===================
function showUserInfo(user) {
  const emailEl = document.getElementById('userEmail');
  if (emailEl && user?.email) {
    emailEl.textContent = user.email;
  }
}


// ========================
// SUCCESS NOTIFICATION FUNCTION
// ========================
function showSuccessNotification(message, duration = 3000) {
  // Remove any existing success notification
  const existingNotification = document.getElementById('success-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'success-notification';
  notification.className = 'global-notification success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
  
  return notification;
}

// ========================
// ENHANCE YOUR EXISTING ERROR FUNCTION (OPTIONAL)
// ========================
// If you want to make them consistent, update showErrorToUser too:
function showErrorToUser(message, duration = 5000) {
  // Remove any existing error notification
  const existingNotification = document.getElementById('error-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'error-notification';
  notification.className = 'global-notification error-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-exclamation-triangle"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
  
  return notification;
}

//=====================================================
// FOR REAL-TIME AGE PREVIEW PLACED AFTER DOB IN HTML 
// MOVED OUTSIDE UTILS BRACKETS AS IT IS A DOM LOGIC
  document.getElementById('petDob').addEventListener('change', function() {
  const dob = this.value;
  const agePreview = document.getElementById('agePreview');
  
  if (dob) {
    agePreview.innerHTML = `<strong>Realtime Age:</strong> ${Utils.calculateAge(dob)}`;
  } else {
    agePreview.innerHTML = '<strong>Realtime Age:</strong> Will be calculated';
  }
});

//==============================================
// Service worker registration
//======================================
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

//==============================================
// Images caching utility functions (DEBUGGED)
//==============================================

// A. cacheImage(url)
const sessionImageCache = new Map();

async function cacheImage(url) {
  if (!url) {
    console.debug("🟡 cacheImage: No URL provided");
    return url;
  }

  if (sessionImageCache.has(url)) {
    console.debug("✅ cacheImage: Returning cached objectURL for", url);
    return sessionImageCache.get(url);
  }

  try {
    console.debug("📥 cacheImage: Fetching image from network:", url);
    const response = await fetch(url);
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    sessionImageCache.set(url, objectURL);
    console.debug("✅ cacheImage: Cached new objectURL for", url, "→", objectURL);
    return objectURL;
  } catch (err) {
    console.warn("❌ cacheImage: Failed, using original URL:", url, err);
    return url;
  }
}

// B. getCachedImage(url)
function getCachedImage(src) {
  console.debug("🔍 getCachedImage: Looking up cached image for", src);

  for (const profile of window.petProfiles || []) {
    const img = profile.gallery?.find(i => i.url === src || i === src);
    if (img && img.cachedUrl) {
      console.debug("✅ getCachedImage: Found cached URL for", src, "→", img.cachedUrl);
      return img.cachedUrl;
    }
  }

  console.debug("⚠️ getCachedImage: No cached URL found for", src, "→ returning original");
  return src;
}

// C. prefetchProfileImages(profile)
function prefetchProfileImages(profile) {
  if (!profile?.gallery?.length) {
    console.debug("ℹ️ prefetchProfileImages: No gallery for profile:", profile?.id || "unknown");
    return;
  }

  console.debug("🚀 prefetchProfileImages: Prefetching", profile.gallery.length, "images for profile:", profile.id || "unknown");

  profile.gallery.forEach((img, idx) => {
    const originalUrl = typeof img === 'string' ? img : img.url;
    console.debug(`   🖼️ [${idx}] Starting load →`, originalUrl);

    const image = new Image();
    image.src = originalUrl;

    image.onload = () => {
      console.debug(`   ✅ [${idx}] Loaded image:`, originalUrl);

      if (typeof img === 'string') {
        const index = profile.gallery.indexOf(img);
        profile.gallery[index] = { url: img, cachedUrl: image.src };
        console.debug(`   🔄 [${idx}] Replaced string with object {url, cachedUrl}`, profile.gallery[index]);
      } else {
        img.cachedUrl = image.src;
        console.debug(`   🔄 [${idx}] Added cachedUrl field to object:`, img);
      }
    };

    image.onerror = (err) => {
      console.warn(`   ❌ [${idx}] Failed to load image:`, originalUrl, err);
    };
  });
}




//======================================================
// Collage functions cleaning linear flow modal
//===========================================================
// ✅ 1. GLOBAL REFERENCES & STATE (For the Linear Modal)
// These track the state of the ONE active modal at a time.
window._activeLinearModal = null; // Holds the ID of the currently open linear modal
window._activeLinearModalCleanup = null; // Holds the cleanup function for the current modal

// ✅ 2. UNIVERSAL LINEAR MODAL CLOSE FUNCTION
/**
 * Destroys the current linear modal and runs its cleanup.
 * This is the SINGLE SOURCE OF TRUTH for closing a linear modal.
 */
function closeLinearModal() {
  console.log("[LinearModal] Close function called. Closing:", window._activeLinearModal);

  if (!window._activeLinearModal) {
    console.log("[LinearModal] No active modal to close.");
    return;
  }

  const modal = document.getElementById(window._activeLinearModal);
  
  // 1. RUN THE MODAL'S SPECIFIC CLEANUP FUNCTION
  if (typeof window._activeLinearModalCleanup === 'function') {
    console.log("[LinearModal] Running registered cleanup function.");
    window._activeLinearModalCleanup();
  }

  // 2. REMOVE THE MODAL FROM THE DOM
  if (modal && modal.parentNode) {
    console.log("[LinearModal] Removing modal element from DOM.");
    modal.parentNode.removeChild(modal);
  }

  // 3. CLEAN UP GLOBAL STATE
  window._activeLinearModal = null;
  window._activeLinearModalCleanup = null;

  console.log("[LinearModal] Environment clean. Modal destroyed.\n");
}

// ✅ 3. UNIVERSAL LINEAR MODAL OPEN FUNCTION
/**
 * Opens a modal in LINEAR mode. Destroys any previous linear modal first.
 * @param {string} modalId - The ID of the modal to create/show.
 * @param {string} modalHTML - The HTML content of the modal.
 * @param {Function} [setupFunction] - A function to run after the modal is injected (e.g., to add listeners).
 * @param {Function} [cleanupFunction] - A function to run when the modal is closed (for custom cleanup).
 */
function openLinearModal(modalId, modalHTML, setupFunction, cleanupFunction) {
  console.log(`[LinearModal] Request to open: ${modalId}`);
  
  // 🧹 STEP 1: DESTROY THE PREVIOUS MODAL (If one exists)
  closeLinearModal();

  // 🧱 STEP 2: CREATE & INJECT THE NEW MODAL
  console.log(`[LinearModal] Injecting HTML for: ${modalId}`);
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById(modalId);
  
  // 📝 STEP 3: RUN THE MODAL'S SETUP FUNCTION
  if (typeof setupFunction === 'function') {
    console.log(`[LinearModal] Running setup function for: ${modalId}`);
    setupFunction(modal); // Pass the modal element to the setup function
  }

// 👁️ STEP 4: SHOW THE MODAL (with CSS visibility/opacity support)
console.log(`[LinearModal] Making modal visible: ${modalId}`);
modal.classList.remove('hidden');

// ✅ ADD THESE LINES: Force the modal to be visible and opaque
// This works with your existing CSS transition system
setTimeout(() => {
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  console.log(`[LinearModal] CSS visibility/opacity applied to: ${modalId}`);
}, 10);
  

  // 💾 STEP 5: UPDATE GLOBAL STATE
  window._activeLinearModal = modalId;
  window._activeLinearModalCleanup = cleanupFunction || null; // Store the cleanup function

  console.log(`[LinearModal] ${modalId} is now active.\n`);
}

//=============================================================================
// ✅ PETSTUDIO - BIRTHDAY CARD MODAL SINGLETON & CLEANUP FUNCTION
//=====================================================================================
/**
 * Completely tears down the existing birthday card modal and its resources.
 * This function must be called before creating a new modal to prevent stale listeners and memory leaks.
 */
function teardownBirthdayModal() {
  console.log("[BirthdayModal-Cleanup] Phase 1: Starting comprehensive teardown...");

  // 1. Get a reference to the existing modal
  const existingModal = document.getElementById('birthday-card-modal');
  console.log(`[BirthdayModal-Cleanup] Found existing modal element: ${!!existingModal}`);

  // 2. Remove global event listeners first (CRITICAL FOR STALE LISTENERS)
  console.log("[BirthdayModal-Cleanup] Phase 2: Removing global event listeners...");
  // Remove the keydown listener for the Escape key
  if (window._birthdayModalKeyHandler) {
    console.log("[BirthdayModal-Cleanup] Removing 'keydown' event listener.");
    document.removeEventListener('keydown', window._birthdayModalKeyHandler);
    window._birthdayModalKeyHandler = null; // Clear the reference
  }

  // 3. Remove the modal from the DOM
  if (existingModal && existingModal.parentNode) {
    console.log("[BirthdayModal-Cleanup] Phase 3: Removing modal from DOM.");
    existingModal.parentNode.removeChild(existingModal);
  } else {
    console.log("[BirthdayModal-Cleanup] No modal in DOM to remove.");
  }

  // 4. Clean up resources (Blob URLs, Canvases)
  console.log("[BirthdayModal-Cleanup] Phase 4: Cleaning up Blobs, URLs, and Canvases.");
  // Clean up Object URLs from potential previous shares/downloads
  document.querySelectorAll('a[href^="blob:"]').forEach(link => {
    console.log(`[BirthdayModal-Cleanup] Revoking Object URL: ${link.href}`);
    URL.revokeObjectURL(link.href);
  });
  // Clean up temporary canvases
  if (window.currentBirthdayCanvas) {
    console.log("[BirthdayModal-Cleanup] Cleaning up currentBirthdayCanvas reference.");
    // Note: The canvas itself is already part of the modal and was removed with the DOM
    window.currentBirthdayCanvas = null;
  }

  console.log("[BirthdayModal-Cleanup] Phase 5: Teardown complete. Environment is clean.\n");
}


//=============added recently ========
// ✅ NEW: IMAGE COMPRESSION UTILITY
function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Compressing: ${file.name} (${(file.size/1024/1024).toFixed(1)}MB)`);
    
    const reader = new FileReader();
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    reader.onload = (e) => {
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'));
              return;
            }
            
            console.log(`✅ Compressed: ${(blob.size/1024/1024).toFixed(1)}MB (was ${(file.size/1024/1024).toFixed(1)}MB)`);
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

