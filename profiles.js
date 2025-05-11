//🌟 Pet Profile Management 🌟
let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
let isEditing = false;
let currentEditIndex = null;

// Render all pet profiles
function renderProfiles() {
  DOM.petList.innerHTML = '';
  if(petProfiles.length === 0) {
    DOM.petList.innerHTML = '<p>No profiles available. Please add a pet profile!</p>';
  }
  else {
    petProfiles.forEach((profile, index) => {
      const petCard = document.createElement("div");
      petCard.classList.add("petCard");
      petCard.id = `pet-card-${profile.id}`;
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
          <button class="shareBtn">📤 Share</button>
          <button class="qrBtn">🔲 QR Code</button>
        </div>
      `;
      
      // Event listeners
      petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
      petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
      petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));
      petCard.querySelector(".shareBtn").addEventListener("click", () => sharePetCard(profile));
      petCard.querySelector(".qrBtn").addEventListener("click", () => generateQRCode(index));
      
      petCard.querySelectorAll(".mood-btn").forEach(btn => {
        btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
      });
      
      petCard.querySelectorAll(".cover-btn").forEach(btn => {
        btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
      });
      
      DOM.petList.appendChild(petCard);
    });
  }
}

// Create new profile
function createNewProfile() {
  const timestamp = Date.now();
  const newProfile = {
    id: timestamp,
    fileName: `pet_${timestamp}`,
    name: document.getElementById('petName').value,
    breed: document.getElementById('petBreed').value,
    dob: document.getElementById("petDob").value,
    birthday: document.getElementById("petBirthday").value,
    gallery: [],
    moodHistory: [],
    coverPhotoIndex: 0
  };
  petProfiles.push(newProfile);
  savePetProfile(newProfile);
  renderProfiles();
}

// Calculate days until birthday
function getCountdown(birthday) {
  const today = new Date();
  const nextBirthday = new Date(birthday);
  nextBirthday.setFullYear(today.getFullYear());
  if(nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  return `${diffDays} days until birthday! 🎉`;
}

// Render mood history
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

// Open edit form
function openEditForm(index) {
  isEditing = true;
  currentEditIndex = index;
  const profile = petProfiles[index];
  
  document.getElementById("petName").value = profile.name;
  document.getElementById("petBreed").value = profile.breed;
  document.getElementById("petDob").value = profile.dob;
  document.getElementById("petBirthday").value = profile.birthday;
  
  const moodInput = document.getElementById("moodHistoryInput");
  if (moodInput) {
    moodInput.value = profile.moodHistory
      .map(entry => `${entry.date}:${entry.mood}`)
      .join("\n");
  }

  DOM.profileSection.classList.remove("hidden"); 
  DOM.fullPageBanner.classList.add("hidden");
}

// Print profile
function printProfile(profile) {
  const printWindow = window.open('', '_blank');
  const printDocument = printWindow.document;

  printDocument.write(`
    <html>
      <head>
        <title>${profile.name}'s Profile</title>
        <style>
          body { font-family: Arial; padding: 20px; -webkit-print-color-adjust: exact !important; }
          .print-header { text-align: center; margin-bottom: 20px; }
          .print-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 20px 0; }
          .print-gallery img { width: 100%; height: auto; object-fit: cover; }
        </style>
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
          ${profile.gallery.map(imgSrc => 
            `<img src="${imgSrc}" alt="Pet photo" onload="this.style.opacity = '1'">`
          ).join('')}
        </div>
      </body>
    </html>
  `);
  
  printDocument.close();
  
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

// Log mood
function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  if(!petProfiles[profileIndex].moodHistory) petProfiles[profileIndex].moodHistory = [];
  petProfiles[profileIndex].moodHistory.push({
    date: today,
    mood: mood
  });
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Set cover photo
function setCoverPhoto(profileIndex, imageIndex) {
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

// Profile form submission
DOM.profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = "test-user";
  const petName = document.getElementById("petName").value;
  const petBreed = document.getElementById("petBreed").value;
  const petDob = document.getElementById("petDob").value;
  const birthday = document.getElementById("petBirthday").value;
  const galleryFiles = Array.from(document.getElementById("petGallery").files);
  
  if(birthday) {
    const reminderData = {
      userId: userId,
      petName: petName,
      date: formatFirestoreDate(birthday),
      message: `It's ${petName}'s birthday today. We wish our pawsome friend a fabulous day! 🐾🎉`,
      createdAt: new Date().toISOString()
    };
    try {
      await firebase.firestore().collection("reminders").add(reminderData);
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  }

  const moodHistoryInput = document.getElementById("moodHistoryInput");
  const moodHistory = moodHistoryInput && moodHistoryInput.value.trim()
    ? moodHistoryInput.value.trim().split("\n").map(line => {
        const [date, mood] = line.split(":");
        return { date: date.trim(), mood: mood.trim() };
      })
    : [];

  const galleryUrls = await Promise.all(
    galleryFiles.map(async file => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise(resolve => {
        img.onerror = resolve;
        img.onload = resolve;
        img.src = url;
      });
      return url;
    })
  );

  const newProfile = {
    id: Date.now(),
    name: petName,
    breed: petBreed,
    dob: petDob,
    birthday: birthday,
    gallery: galleryUrls,
    moodHistory: moodHistory,
    coverPhotoIndex: 0
  };

  if(isEditing) {
    petProfiles[currentEditIndex] = newProfile;
  } else {
    petProfiles.push(newProfile);
  }

  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  DOM.profileSection.classList.add("hidden");
  DOM.petList.classList.remove("hidden");
  renderProfiles();
  window.scrollTo(0, 0);
});

function formatFirestoreDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}
