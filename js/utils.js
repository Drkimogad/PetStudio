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
  const maxSizeMB = 10;
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

//=======================
// show error to user
//====================
showErrorToUser(message, isSuccess = false) {
    try {
      const errorDiv = document.getElementById('error-message');
      if (!errorDiv) {
        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'error-message';
        newErrorDiv.className = isSuccess ? 'success-message' : 'auth-error';
        newErrorDiv.textContent = message;
        document.querySelector('#authContainer').prepend(newErrorDiv);
      } else {
        errorDiv.textContent = message;
        errorDiv.className = isSuccess ? 'success-message' : 'auth-error';
      }
    } catch (fallbackError) {
      alert(message);
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

// ================= ENQUEUE/DEQUEUE STACK-BASED MODAL MANAGER (with debug) =================
const ModalStackManager = {
  _stack: [], // Stack of open modal IDs
  _cleanupMap: new Map(), // Optional per-modal cleanup functions

  // Open a modal and optionally register a cleanup function
  open(modalId, { cleanup } = {}) {
    console.log("🟢 Opening modal:", modalId); // DEBUG
    console.log("📋 Stack before open:", [...this._stack]); // DEBUG

    const modal = document.getElementById(modalId);
    if (!modal) {
      console.warn("⚠️ Modal not found:", modalId);
      return;
    }

    // Hide current top modal (if any) without removing it
    const topModalId = this._stack[this._stack.length - 1];
    if (topModalId) {
      console.log("↩️ Hiding current top modal:", topModalId); // DEBUG
      const topModal = document.getElementById(topModalId);
      if (topModal) {
        topModal.style.display = 'none';
        topModal.classList.add('hidden');
      }
    }

    // Show the new modal
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    setTimeout(() => modal.classList.remove('hidden'), 10);

    // Push to stack
    this._stack.push(modalId);

    // Register cleanup function if provided
    if (cleanup) this._cleanupMap.set(modalId, cleanup);

    console.log("✅ Stack after open:", [...this._stack]); // DEBUG
  },

  // Close the top modal
  close() {
    console.log("🔴 Closing top modal"); // DEBUG
    console.log("📋 Stack before close:", [...this._stack]); // DEBUG

    const modalId = this._stack.pop();
    if (!modalId) {
      console.warn("⚠️ No modals to close");
      return;
    }

    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      modal.style.pointerEvents = 'none';
      modal.classList.add('hidden');
    }

    // Run registered cleanup
    const cleanup = this._cleanupMap.get(modalId);
    if (cleanup) {
      console.log("🧹 Running cleanup for:", modalId); // DEBUG
      cleanup();
      this._cleanupMap.delete(modalId);
    }

    // Restore previous modal (if any)
    const prevModalId = this._stack[this._stack.length - 1];
    if (prevModalId) {
      console.log("↪️ Restoring previous modal:", prevModalId); // DEBUG
      const prevModal = document.getElementById(prevModalId);
      if (prevModal) {
        prevModal.style.display = 'flex';
        prevModal.style.pointerEvents = 'auto';
        setTimeout(() => prevModal.classList.remove('hidden'), 10);
      }
    }

    console.log("✅ Stack after close:", [...this._stack]); // DEBUG
  },

  // Close all modals and clear stack
  closeAll() {
    console.log("🛑 Closing ALL modals"); // DEBUG
    while (this._stack.length) this.close();
    console.log("✅ Stack cleared"); // DEBUG
  },

  // Optional: peek at top modal ID
  top() {
    const topId = this._stack[this._stack.length - 1] || null;
    console.log("👀 Top modal is:", topId); // DEBUG
    return topId;
  }
};



// =======================
// 🎂 Birthday Modal Queue
// =======================
const BirthdayModalQueue = (() => {
  const queue = [];
  let processing = false;

  // Enqueue a birthday card request
  function enqueue(fn) {
    queue.push(fn);
    processQueue();
  }

  // Process the queue if not already processing
  async function processQueue() {
    if (processing) return;  // Already processing
    if (queue.length === 0) return; // Nothing to do

    processing = true;
    const nextFn = queue.shift();
    try {
      await nextFn();  // Call the async generate function
    } catch (err) {
      console.error("🎂 Birthday Modal Queue error:", err);
    }
    processing = false;
    // Process next item if any
    if (queue.length > 0) processQueue();
  }

  return { enqueue };
})();


// ✅ PETSTUDIO - BIRTHDAY CARD MODAL SINGLETON & CLEANUP FUNCTION
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
