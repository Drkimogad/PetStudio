// ======================
// QR Modal Initialization (OUTSIDE DOMContentLoaded)
// ======================
function initQRModal() {
  // Event delegation for modal buttons
  document.addEventListener('click', function(e) {
    // Print button
    if (e.target.classList.contains('qr-print')) {
      window.print();
    }
    
    // Download button
    else if (e.target.classList.contains('qr-download')) {
      const canvas = document.querySelector('#qrcode-container canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `${currentQRProfile.name}_qr.png`.replace(/[^a-z0-9]/gi, '_');
        link.href = canvas.toDataURL();
        link.click();
      }
    }
    
    // Share button
    else if (e.target.classList.contains('qr-share')) {
      shareQR();
    }
    
    // Close button
    else if (e.target.classList.contains('qr-close')) {
      document.getElementById('qr-modal').style.display = 'none';
    }
  });
}
// Global variables
let currentQRProfile = null;

// QR Modal Handler
function handleQRActions() {
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('qr-action')) return;
    
    const action = e.target.dataset.action;
    const canvas = document.querySelector('#qrcode-container canvas');
    
    switch(action) {
      case 'print':
        window.print();
        break;
        
      case 'download':
        if (canvas) {
          const link = document.createElement('a');
          link.download = `${currentQRProfile.name}_qr.png`.replace(/[^a-z0-9]/gi, '_');
          link.href = canvas.toDataURL();
          link.click();
        }
        break;
        
      case 'share':
        shareQR();
        break;
        
      case 'close':
        document.getElementById('qr-modal').style.display = 'none';
        break;
    }
  });
}

// Share Function
async function shareQR() {
  try {
    if (!currentQRProfile) return;
    
    const shareData = {
      title: `${currentQRProfile.name}'s Pet Profile`,
      text: `Check out ${currentQRProfile.name}'s details!`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      showQRStatus('Link copied to clipboard!', true);
    }
  } catch (err) {
    showQRStatus('Sharing failed. Please copy manually.', false);
  }
}

// Helper Function
function showQRStatus(message, isSuccess) {
  const statusEl = document.getElementById('qr-status');
  statusEl.textContent = message;
  statusEl.style.color = isSuccess ? 'green' : 'red';
  setTimeout(() => statusEl.textContent = '', 3000);
}
// ======================
// Enhanced Share Function (Global)
// ======================
async function sharePetCard(pet) {
  // 1. Generate Shareable Link
  const shareUrl = `${window.location.origin}/pet/${pet.id}`;

  // 2. Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Meet ${pet.name}! 🐾`,
        text: `Check out ${pet.name}'s profile on PetStudio!`,
        url: shareUrl,
      });
      return;
    } catch (err) {
      console.log("Share cancelled:", err);
    }
  }

  // 3. Desktop/Image Fallback
  try {
    const cardElement = document.getElementById(`pet-card-${pet.id}`);
    if (!cardElement) throw new Error('Pet card not found');
    
    const canvas = await html2canvas(cardElement);
    const imageUrl = canvas.toDataURL('image/png');

    // Create and trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = `${pet.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    alert(`${pet.name}'s card saved! 🔗 Link copied to clipboard.`);
    
  } catch (error) {
    console.error('Sharing failed:', error);
    window.open(shareUrl, '_blank');
  }
}

// SHARE PET CARD /PROFILERENDERING RELATED//
async function sharePetCard(pet) {
    const shareUrl = `${window.location.origin}/pet/${pet.id}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Meet ${pet.name}! 🐾`,
                text: `Check out ${pet.name}'s profile on PetStudio!`,
                url: shareUrl,
            });
            return;
        } catch (err) {
            console.log("Share cancelled:", err);
        }
    }

    try {
        const cardElement = document.getElementById(`pet-card-${pet.id}`);
        if (!cardElement) throw new Error('Pet card not found');
        
        const canvas = await html2canvas(cardElement);
        const imageUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = `${pet.name}-petstudio.png`.replace(/[^a-z0-9]/gi, '_');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        await navigator.clipboard.writeText(shareUrl);
        alert(`${pet.name}'s card saved! 🔗 Link copied to clipboard.`);
        
    } catch (error) {
        console.error('Sharing failed:', error);
        window.open(shareUrl, '_blank');
    }
}
// ======================
// Top-Level Declarations
// ======================
let auth; // Will hold initialized auth instance
let provider; // Google auth provider

// ======================
// Main Initialization (INSIDE DOMContentLoaded)
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initQRModal();
  const firebaseConfig = {
    apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
    authDomain: "swiftreach2025.firebaseapp.com",
    projectId: "swiftreach2025",
    storageBucket: "swiftreach2025.appspot.com",
    messagingSenderId: "540185558422",
    appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  provider = new firebase.auth.GoogleAuthProvider();
  // Add Drive API scopes
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
