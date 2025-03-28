document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    const logoutBtn = document.getElementById("logoutBtn");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const createProfileBtn = document.getElementById("createProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const profileForm = document.getElementById("profileForm");
    const petList = document.getElementById("petList");
    const loginLink = document.getElementById("loginLink");
    const signupLink = document.getElementById("signupLink");

    // State Management
    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];
    let isEditing = false;
    let currentEditIndex = null;

    // Initialize with test data if empty (optional)
    if (petProfiles.length === 0) {
        petProfiles = [{
            name: "Sample Pet",
            breed: "Golden Retriever",
            dob: "2020-05-15",
            birthday: "2024-05-15",
            gallery: [],
            moodLog: [],
            coverPhotoIndex: 0
        }];
        localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    }

    // Event Listeners
    createProfileBtn.addEventListener("click", () => {
        isEditing = false;
        profileForm.reset();
        profileSection.classList.remove("hidden");
    });

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
        profileForm.reset();
        renderProfiles();
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("petStudio_loggedIn");
        dashboard.classList.add("hidden");
        loginPage.classList.remove("hidden");
        loginForm.reset();
    });

    // Navigation
    loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    signupLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginPage.classList.add("hidden");
        signupPage.classList.remove("hidden");
    });

    // Auth Functions
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value.trim();

        localStorage.setItem("petStudio_username", username);
        localStorage.setItem("petStudio_password", password);
        
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        document.getElementById("username").value = username;
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const storedUser = localStorage.getItem("petStudio_username");
        const storedPass = localStorage.getItem("petStudio_password");

        if (username === storedUser && password === storedPass) {
            localStorage.setItem("petStudio_loggedIn", "true");
            loginPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            renderProfiles();
        } else {
            alert("Invalid credentials");
        }
    });

    // Profile Rendering
    function renderProfiles() {
        petList.innerHTML = '';
        
        petProfiles.forEach((profile, index) => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");
            
            petCard.innerHTML = `
                <div class="profile-header">
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
                <div class="action-buttons">
                    <button class="editBtn">✏️ Edit</button>
                    <button class="deleteBtn">🗑️ Delete</button>
                    <button class="printBtn">🖨️ Print</button>
                </div>
            `;

            petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
            petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
            petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));
            
            petList.appendChild(petCard);
        });
    }

    // Helper Functions
    function openEditForm(index) {
        isEditing = true;
        currentEditIndex = index;
        const profile = petProfiles[index];
        
        document.getElementById("petName").value = profile.name;
        document.getElementById("petBreed").value = profile.breed;
        document.getElementById("petDob").value = profile.dob;
        document.getElementById("petBirthday").value = profile.birthday;
        
        profileSection.classList.remove("hidden");
    }

    function deleteProfile(index) {
        if (confirm("Are you sure you want to delete this profile?")) {
            petProfiles.splice(index, 1);
            localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
            renderProfiles();
        }
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

    function getCountdown(birthday) {
        const today = new Date();
        const nextBirthday = new Date(birthday);
        nextBirthday.setFullYear(today.getFullYear());
        if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
        return `${diffDays} days until birthday! 🎉`;
    }

    // Initialize App
    function initializeApp() {
        const isLoggedIn = localStorage.getItem("petStudio_loggedIn") === "true";

        if (isLoggedIn) {
            loginPage.classList.add("hidden");
            signupPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            renderProfiles();
        } else {
            loginPage.classList.remove("hidden");
            signupPage.classList.add("hidden");
            dashboard.classList.add("hidden");
        }
    }

    initializeApp();
});
