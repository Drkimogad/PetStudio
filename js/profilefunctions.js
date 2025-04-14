//--------------------------//  
// function countdown//
//-------------------------//
  function getCountdown(birthday) {
    const today = new Date();
    const nextBirthday = new Date(birthday);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return `${diffDays} days until birthday! 🎉`;
  }

  function renderMoodHistory(profile) {
    if (!profile.moodLog || profile.moodLog.length === 0) return "No mood logs yet";
    return profile.moodLog
      .slice(-7)
      .map(entry => `${entry.date}: ${getMoodEmoji(entry.mood)}`)
      .join('<br>');
  }

  function getMoodEmoji(mood) {
    return mood === 'happy' ? '😊' : mood === 'sad' ? '😞' : '😐';
  }

  function openEditForm(index) {
    isEditing = true;
    currentEditIndex = index;
    const profile = petProfiles[index];

    document.getElementById("petName").value = profile.name;
    document.getElementById("petBreed").value = profile.breed;
    document.getElementById("petDob").value = profile.dob;
    document.getElementById("petBirthday").value = profile.birthday;

    profileSection.classList.remove("hidden");
    fullPageBanner.classList.add("hidden");
  }

  function deleteProfile(index) {
    petProfiles.splice(index, 1);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    renderProfiles();
  }

  function printProfile(profile) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${profile.name}'s Profile</title>
            <style>
                body { 
                    font-family: Arial; 
                    padding: 20px;
                    -webkit-print-color-adjust: exact !important;
                }
                .print-header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                }
                .print-gallery { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 10px; 
                    margin: 20px 0; 
                }
                .print-gallery img { 
                    width: 100%; 
                    height: 150px; 
                    object-fit: cover; 
                    opacity: 0; /* Initial hidden state */
                }
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
                ${profile.gallery.map(img => `<img src="${img}" alt="Pet photo">`).join('')}
            </div>
            <script>
                window.onload = function() {
                    const images = Array.from(document.querySelectorAll('img'));
                    let loadedCount = 0;

                    const checkAllLoaded = () => {
                        if(++loadedCount === images.length) {
                            images.forEach(img => img.style.opacity = '1');
                            window.print();
                        }
                    };

                    images.forEach(img => {
                        if(img.complete) {
                            checkAllLoaded();
                        } else {
                            img.onload = checkAllLoaded;
                            img.onerror = checkAllLoaded; // Handle broken images
                        }
                    });

                    // Fallback if all images are already cached
                    if(images.length === 0 || images.every(img => img.complete)) {
                        window.print();
                    }
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
  }
  //Enhanced share profile function//  
  async function sharePetCard(pet) {
    // 1. Generate Shareable Link
    const shareUrl = `${window.location.origin}/pet/${pet.id}`; // Example: petstudio.com/pet/123

    // 2. Check if Mobile (Web Share API)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meet ${pet.name}! 🐾`,
          text: `Check out ${pet.name}'s profile on PetStudio!`,
          url: shareUrl,
        });
        return; // Exit if successful
      } catch (err) {
        console.log("User cancelled share", err);
      }
    }

    // 3. Desktop/Image Fallback
    try {
      // Capture the pet card as an image
      const cardElement = document.getElementById(`pet-card-${pet.id}`);
      const canvas = await html2canvas(cardElement);
      const imageUrl = canvas.toDataURL('image/png');

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = imageUrl;
      downloadLink.download = `${pet.name}-petstudio.png`;
      downloadLink.click();

      // Bonus: Copy link to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert(`${pet.name}'s card saved! 🔗 Link copied to clipboard.`);

    } catch (error) {
      // Ultimate fallback: Just open URL
      window.open(shareUrl, '_blank');
    }
  }

  // ======== QR CODE GENERATION button functionality ========
  function calculateAge(dobString) {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        years--;
      }

      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${years} years, ${months} months`;
    } catch {
      return 'N/A';
    }
  }
  
  // ======== QR CODE GENERATION ========
// Global variable
let currentQRProfile = null;

// Print function (NEW - targets only the modal content)
function printQR() {
  const printContent = document.querySelector('#qr-modal .printable-area').innerHTML;
  const originalContent = document.body.innerHTML;
  
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
  
  // Re-show modal after printing
  document.getElementById('qr-modal').style.display = 'block';
}

// Download function 
function downloadQR() {
  const canvas = document.querySelector('#qrcode-container canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = (currentQRProfile?.name || 'pet_profile') + '_qr.png';
    link.href = canvas.toDataURL();
    link.click();
  }
}

// Share function 
async function shareQR() {
  try {
    await navigator.share?.({
      title: `${currentQRProfile?.name || 'Pet'} Profile`,
      text: `Check out ${currentQRProfile?.name || 'this pet'}'s details!`,
      url: window.location.href
    });
  } catch {
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}
// Your existing generateQRCode//
function generateQRCode(profileIndex) {
  const savedProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
  currentQRProfile = savedProfiles[profileIndex];
  
  const modal = document.getElementById('qr-modal');
  const container = document.getElementById('qrcode-container');
  
  // Clear and regenerate
  container.innerHTML = '';
  modal.style.display = 'block';
  
  new QRCode(container, {
    text: JSON.stringify(currentQRProfile),
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

  function logMood(profileIndex, mood) {
  const today = new Date().toISOString().split('T')[0];
  if (!petProfiles[profileIndex].moodLog) petProfiles[profileIndex].moodLog = [];

  petProfiles[profileIndex].moodLog.push({
    date: today,
    mood: mood
  });

  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}

function setCoverPhoto(profileIndex, imageIndex) {
  petProfiles[profileIndex].coverPhotoIndex = imageIndex;
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
  renderProfiles();
}
// ======================
// Form Handling with Reminder Creation
// ======================
function formatFirestoreDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

profileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Hardcoded user ID (temporary until auth implementation)
  const userId = "test-user";

  // 2. Get form values
  const petName = document.getElementById("petName").value;
  const petBreed = document.getElementById("petBreed").value;
  const petDob = document.getElementById("petDob").value;
  const birthday = document.getElementById("petBirthday").value;
  const galleryFiles = Array.from(document.getElementById("petGallery").files);

  // 3. Firestore birthday reminder (if birthday is provided)
  if (birthday) {
    const reminderData = {
      userId: userId,
      petName: petName,
      date: formatFirestoreDate(birthday), // "YYYY-MM-DD"
      message: `It's ${petName}'s birthday today! 🎉`,
      createdAt: new Date().toISOString()
    };

    try {
      await firebase.firestore().collection("reminders").add(reminderData);
      console.log("Reminder created successfully");
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  }

  // 4. Build profile object
  const newProfile = {
    name: petName,
    breed: petBreed,
    dob: petDob,
    birthday: birthday,
    gallery: galleryFiles.map(file => URL.createObjectURL(file)),
    moodLog: [],
    coverPhotoIndex: 0
  };

  if (isEditing) {
    petProfiles[currentEditIndex] = newProfile;
  } else {
    petProfiles.push(newProfile);
  }

  // Save the updated profiles to localStorage
  localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

  // Hide the form and banner
  profileSection.classList.add("hidden");
  // Reset form fields
  profileForm.reset();
  // Re-render profiles
  renderProfiles();
  // Redirect to dashboard
  dashboard.classList.remove("hidden"); // Show dashboard
  authContainer.classList.add("hidden"); // Hide auth container
  window.scrollTo(0, 0); // Optional: Scroll to the top of the page
});

// Initialize
if (petProfiles.length > 0) renderProfiles();
});
export {
  getCountdown,
  renderMoodHistory,
  getMoodEmoji,
  openEditForm,
  printProfile,
  calculateAge,
  printQR,
  downloadQR,
  generateQRCode,
  logMood,
  setCoverPhoto,
  formatFirestoreDate
};
