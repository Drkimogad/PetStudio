document.addEventListener("DOMContentLoaded", () => {
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    const profileFormSection = document.getElementById("profileFormSection");
    const createProfileBtn = document.getElementById("createProfileBtn");
    const addProfilesBtn = document.getElementById("addProfilesBtn");
    const petList = document.getElementById("petList");

    // User authentication
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        loginPage.classList.add("hidden");
        dashboard.classList.remove("hidden");
    });

    // Create Profile
    createProfileBtn.addEventListener("click", () => {
        profileFormSection.classList.remove("hidden");
    });

    document.getElementById("profileForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const petName = document.getElementById("petName").value;
        const petBreed = document.getElementById("petBreed").value;
        const petDob = document.getElementById("petDob").value;
        const petBirthday = document.getElementById("petBirthday").value;
        const petPhoto = document.getElementById("petPhoto").files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            const petProfile = document.createElement("div");
            petProfile.classList.add("pet-card");
            petProfile.innerHTML = `
                <img src="${event.target.result}" alt="${petName}" />
                <p><strong>Name:</strong> ${petName}</p>
                <p><strong>Breed:</strong> ${petBreed}</p>
                <p><strong>Date of Birth:</strong> ${petDob}</p>
                <p><strong>Birthday Reminder:</strong> ${petBirthday}</p>
                <button class="deleteBtn">Delete</button>
            `;

            petList.appendChild(petProfile);

            // Delete Profile
            petProfile.querySelector(".deleteBtn").addEventListener("click", () => {
                petList.removeChild(petProfile);
            });
        };

        if (petPhoto) {
            reader.readAsDataURL(petPhoto);
        }

        profileFormSection.classList.add("hidden");
        addProfilesBtn.classList.remove("hidden");
    });

    // Add More Profiles
    addProfilesBtn.addEventListener("click", () => {
        profileFormSection.classList.remove("hidden");
    });
});
