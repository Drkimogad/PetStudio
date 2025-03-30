document.addEventListener("DOMContentLoaded", () => {
    // ======================
    // COMPLETE Firebase Configuration
    // ======================
    const firebaseConfig = {
        apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
        authDomain: "swiftreach2025.firebaseapp.com",
        projectId: "swiftreach2025",
        storageBucket: "swiftreach2025.firebasestorage.app",
        messagingSenderId: "540185558422",
        appId: "1:540185558422:web:d560ac90eb1dff3e5071b7"
    };
    firebase.initializeApp(firebaseConfig);

    // ======================
    // COMPLETE DOM Elements
    // ======================
    const authContainer = document.getElementById("authContainer");
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    const logoutBtn = document.getElementById("logoutBtn");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const switchToLogin = document.getElementById("switchToLogin");
    const switchToSignup = document.getElementById("switchToSignup");
    const addPetProfileBtn = document.getElementById("addPetProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const petList = document.getElementById("petList");
    const fullPageBanner = document.getElementById("fullPageBanner");
    const profileForm = document.getElementById("profileForm");

    // ======================
    // COMPLETE State Management
    // ======================
    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    let isEditing = false;
    let currentEditIndex = null;

// ======================
// COMPLETE Auth Form Switching
// ======================
// Get form switch buttons
const loginPage = window.loginPage || document.getElementById("loginPage");
const signupPage = window.signupPage || document.getElementById("signupPage");

// Get form switch buttons
const switchToLoginBtn = document.getElementById("switchToLogin");
const switchToSignupBtn = document.getElementById("switchToSignup");

// Ensure elements exist before adding event listeners
if (switchToLoginBtn && switchToSignupBtn && loginPage && signupPage) {
    switchToLoginBtn.addEventListener("click", () => {
        signupPage.style.display = "none";  
        loginPage.style.display = "block";  
    });

    switchToSignupBtn.addEventListener("click", () => {
        loginPage.style.display = "none";  
        signupPage.style.display = "block";  
    });
} else {
    console.error("Auth switch elements not found!");
}

}

// ======================
// COMPLETE Firebase Auth Implementation (Fixed)
// ======================
// Get form switch buttons
// Ensure elements exist before adding event listeners
if (switchToLogin && switchToSignup) {
    switchToLogin.addEventListener("click", () => {
        console.log("Switching to login form...");
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    switchToSignup.addEventListener("click", () => {
        console.log("Switching to signup form...");
        loginPage.classList.add("hidden");
        signupPage.classList.remove("hidden");
    });
} else {
    console.error("Switch buttons not found in the DOM");
}

// UPDATED SIGNUP HANDLER (FIXED)
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const email = `${username}@petstudio.com`;

    try {
        // Show loading state
        const submitBtn = signupForm.querySelector("button[type='submit']");
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        // 1. Create Firebase user
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        
        // 2. Switch to login form
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        
        // 3. Pre-fill username in login form
        document.getElementById("loginEmail").value = username;
        
        // 4. Reset form
        signupForm.reset();
        
    } catch (error) {
        console.error("Signup error:", error);
        alert(`Signup failed: ${error.message}`);
    } finally {
        // Reset button state
        const submitBtn = signupForm.querySelector("button[type='submit']");
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
    }
});

// Login handler
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("username").value.trim() + "@petstudio.com";
    const password = document.getElementById("password").value.trim();

    // Show loading state
    const submitBtn = loginForm.querySelector("button[type='submit']");
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Success handled by auth state observer
        })
        .catch(error => {
            let errorMessage = "Login failed: ";
            switch(error.code) {
                case "auth/user-not-found":
                    errorMessage += "No account found with this email";
                    break;
                case "auth/wrong-password":
                    errorMessage += "Incorrect password";
                    break;
                case "auth/invalid-email":
                    errorMessage += "Invalid email format";
                    break;
                default:
                    errorMessage += error.message;
            }
            alert(errorMessage);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        });
});

// Logout handler
logoutBtn.addEventListener("click", () => {
    firebase.auth().signOut();
});

// Auth state observer
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        authContainer.classList.add("hidden");
        dashboard.classList.remove("hidden");
        logoutBtn.style.display = "block";
        if (petProfiles.length > 0) renderProfiles();
        
        // Pre-fill email in login form for next time
        const emailOnly = user.email.split("@")[0];
        document.getElementById("username").value = emailOnly;
    } else {
        // User is signed out
        authContainer.classList.remove("hidden");
        dashboard.classList.add("hidden");
        logoutBtn.style.display = "none";
        
        // Show login form by default
        loginPage.classList.remove("hidden");
        signupPage.classList.add("hidden");
    }
});

    // ======================
    // COMPLETE Pet Profile Rendering (NO CHANGES)
    // ======================
    function renderProfiles() {
        petList.innerHTML = '';
        petProfiles.forEach((profile, index) => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");

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
                            <img src="${img}" alt="Pet Photo">
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
                </div>
            `;

            petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
            petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
            petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));
            petCard.querySelector(".shareBtn").addEventListener("click", () => shareProfile(profile));

            petCard.querySelectorAll(".mood-btn").forEach(btn => {
                btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
            });

            petCard.querySelectorAll(".cover-btn").forEach(btn => {
                btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
            });

            petList.appendChild(petCard);
        });
    }

    // ======================
    // COMPLETE Helper Functions (NO CHANGES)
    // ======================
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
                    body { font-family: Arial; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
                    .print-gallery img { width: 100%; height: 150px; object-fit: cover; }
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
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function shareProfile(profile) {
        if (navigator.share) {
            navigator.share({
                title: `${profile.name}'s Pet Profile`,
                text: `Check out ${profile.name}'s profile on Pet Studio! Breed: ${profile.breed}, Birthday: ${profile.birthday}`,
                url: window.location.href
            }).catch(error => console.log('Error sharing:', error));
        } else {
            const shareText = `${profile.name}'s Pet Profile\nBreed: ${profile.breed}\nBirthday: ${profile.birthday}\n\nShared from Pet Studio`;
            alert(shareText + '\n\nCopy this text to share elsewhere.');
        }
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
    // COMPLETE Form Handling (NO CHANGES)
    // ======================
    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newProfile = {
            name: document.getElementById("petName").value,
            breed: document.getElementById("petBreed").value,
            dob: document.getElementById("petDob").value,
            birthday: document.getElementById("petBirthday").value,
            gallery: Array.from(document.getElementById("petGallery").files).map(file => URL.createObjectURL(file)),
            moodLog: [],
            coverPhotoIndex: 0
        };

        if (isEditing) {
            petProfiles[currentEditIndex] = newProfile;
        } else {
            petProfiles.push(newProfile);
        }

        localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
        profileSection.classList.add("hidden");
        fullPageBanner.classList.add("hidden");
        profileForm.reset();
        renderProfiles();
    });

    // ======================
    // COMPLETE Service Worker (NO CHANGES)
    // ======================
    const vapidKey = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk'; 

    function subscribeUserToPushNotifications(registration) {
        registration.pushManager.getSubscription()
            .then(subscription => {
                if (subscription) {
                    console.log('Already subscribed:', subscription);
                    sendSubscriptionToServer(subscription);
                } else {
                    registration.pushManager.subscribe({
                        userVisibleOnly: true, 
                        applicationServerKey: urlBase64ToUint8Array(vapidKey),
                    })
                    .then(newSubscription => {
                        console.log('Subscribed to push notifications:', newSubscription);
                        sendSubscriptionToServer(newSubscription);
                    })
                    .catch(error => {
                        console.error('Push subscription failed:', error);
                    });
                }
            })
            .catch(error => console.error('Subscription check failed:', error));
    }

    function sendSubscriptionToServer(subscription) {
        fetch('https://pet-studio.vercel.app/api/save-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription }),
        })
        .then(response => response.json())
        .then(data => console.log('Subscription sent:', data))
        .catch(error => console.error('Error sending subscription:', error));
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/\_/g, '/');
        const rawData = atob(base64);
        return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Caching Service Worker registered:', registration.scope);
                subscribeUserToPushNotifications(registration);

                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            installingWorker.postMessage({ action: 'skipWaiting' });
                        }
                    });
                });
            })
            .catch(error => console.error('Service Worker registration failed:', error));

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated, reloading page...');
            location.reload();
        });
    }

    // Initialize
    if (petProfiles.length > 0) renderProfiles();
});
