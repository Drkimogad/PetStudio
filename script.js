document.addEventListener("DOMContentLoaded", () => {
    // ======================
    // DOM Elements (UNCHANGED)
    // ======================
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    const logoutBtn = document.getElementById("logoutBtn");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const addPetProfileBtn = document.getElementById("addPetProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const petList = document.getElementById("petList");
    const fullPageBanner = document.getElementById("fullPageBanner");

    // ======================
    // State Management (UPDATED)
    // ======================
    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    let isEditing = false;
    let currentEditIndex = null;

    // ======================
    // Button Event Listeners
    // ======================
    addPetProfileBtn.addEventListener("click", () => {
        isEditing = false;
        profileForm.reset();
        profileSection.classList.remove("hidden");
        fullPageBanner.classList.add("hidden");
    });

    // ======================
    // Enhanced Profile Rendering
    // ======================
    function renderProfiles() {
        petList.innerHTML = '';
        petProfiles.forEach((profile, index) => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");

            // Set the cover photo as the background of the profile header
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
                </div>
            `;

            petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
            petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
            petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));

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
    // Helper Functions
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
    // Form Handling
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
    // Consolidated Auth Flow Fix
    // ======================
    // 1. Signup Form Handler - Fixed Version
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value.trim();

        if (!username || !password) {
            alert("Please fill all fields");
            return;
        }

        // Save credentials and immediately show login
        localStorage.setItem("petStudio_username", username);
        localStorage.setItem("petStudio_password", password);

        // Visual feedback before redirect
        alert("Account created successfully! Redirecting to login...");

        // Force redraw before hiding
        setTimeout(() => {
            signupPage.classList.add("hidden");
            loginPage.classList.remove("hidden");
            document.getElementById("username").value = username;
            document.getElementById("password").focus();
        }, 100);
    });

    // 2. Login Form Handler - Debuggable Version
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const storedUser = localStorage.getItem("petStudio_username");
        const storedPass = localStorage.getItem("petStudio_password");

        console.log("Login attempt:", { username, storedUser }); // Debug line

        if (username === storedUser && password === storedPass) {
            localStorage.setItem("petStudio_loggedIn", "true");

            // Verify elements before manipulation
            console.log("Elements:", { 
                loginPage, 
                dashboard,
                logoutBtn 
            }); // Debug line

            loginPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            logoutBtn.style.display = "block";
            renderProfiles();
        } else {
            alert(`Login failed. ${!storedUser ? "No account found" : "Invalid password"}`);
        }
    });

    // 3. Unified Initialization
    function initializeApp() {
        // Check auth state first
        const isLoggedIn = localStorage.getItem("petStudio_loggedIn") === "true";

        console.log("Initial auth state:", isLoggedIn); // Debug line

        if (isLoggedIn) {
            loginPage.classList.add("hidden");
            signupPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            logoutBtn.style.display = "block";
            renderProfiles();
        } else {
            // Default to login page
            loginPage.classList.remove("hidden");
            signupPage.classList.add("hidden");
            dashboard.classList.add("hidden");
            logoutBtn.style.display = "none";
        }

        // Load profiles if any
        if (petProfiles.length > 0) renderProfiles();
    }

    // Single DOMContentLoaded listener
    document.addEventListener("DOMContentLoaded", initializeApp);

    // ======================
    // UNCHANGED: Service Worker/Push Notifications
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

    // ======================
    // Initialization
    // ======================
    if (petProfiles.length > 0) renderProfiles();

    // ======================
    // Logout Button Functionality
    // ======================
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("petStudio_loggedIn");
        loginPage.classList.remove("hidden");
        signupPage.classList.add("hidden");
        dashboard.classList.add("hidden");
    });
});
