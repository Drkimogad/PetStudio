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
  getCountdown: function(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  },
//======================================================
  getMoodEmoji: function(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  },

  formatFirestoreDate: function(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },
  //==========================================
// AGE CALCULATION FUNCTION YEARS, MONTHS, DAYS.
calculateAge: function(dobString) {
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

  //=============================================
showErrorToUser: function(message, isSuccess = false) {
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
//===============================================
  disableUI: function() {
    document.body.innerHTML = `
      <h1 style="color: red; padding: 2rem; text-align: center">
        Critical Error: Failed to load application interface
      </h1>
    `;
  }
};
//==============================================
// ADDED OUTSIDE UTILS ()
function showAuthForm() {
  const container = document.getElementById('authContainer') || document.getElementById('auth-container');
  if (container) container.classList.remove('hidden');
}
//==================================
function showUserInfo(user) {
  const emailEl = document.getElementById('userEmail');
  if (emailEl && user?.email) {
    emailEl.textContent = user.email;
  }
}
//=====================================================
// FOR REAL-TIME AGE PREVIEW PLACED AFTER DOB IN HTML
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
