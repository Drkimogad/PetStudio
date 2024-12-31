document.addEventListener("DOMContentLoaded", () => {
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const createProfileBtn = document.getElementById("createProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const profileForm = document.getElementById("profileForm");
    const petList = document.getElementById("petList");

    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || []; // Load saved profiles

    // Function to render profiles
    function renderProfiles() {
        petList.innerHTML = ''; // Clear the list
        petProfiles.forEach(profile => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");
            petCard.innerHTML = `
                <h3>${profile.name}</h3>
                <p>Breed: ${profile.breed}</p>
                <p>DOB: ${profile.dob}</p>
                <p>Birthday: ${profile.birthday}</p>
                <div>
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo" class="pet-image">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.name !== profile.name); // Remove profile from array
                localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage
                renderProfiles(); // Re-render the profiles
            });

            petCard.querySelector(".printBtn").addEventListener("click", () => {
                // Clone the specific pet profile content for printing
                const printContent = petCard.cloneNode(true);
                printContent.querySelector(".deleteBtn").style.display = "none"; // Hide delete button in print
                printContent.querySelector(".printBtn").style.display = "none"; // Hide print button in print

                const printWindow = window.open('', '', 'height=500,width=800');
                printWindow.document.write('<html><head><title>Print Profile</title></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });

            petList.appendChild(petCard);
        });
    }

    // Handle sign-up
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        localStorage.setItem("username", document.getElementById("newUsername").value);
        localStorage.setItem("password", document.getElementById("newPassword").value);
        alert("Sign-up successful! Please log in.");
        signupPage.classList.remove("active");
        loginPage.classList.add("active");
    });

    // Handle login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === localStorage.getItem("username") && password === localStorage.getItem("password")) {
            alert("Login successful!");
            loginPage.classList.remove("active");
            dashboard.classList.add("active");
            renderProfiles(); // Load profiles when logged in
        } else {
            alert("Invalid username or password.");
        }
    });

    // Handle profile creation
    createProfileBtn.addEventListener("click", () => {
        profileSection.classList.remove("hidden");
    });

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const petName = document.getElementById("petName").value;
        const petBreed = document.getElementById("petBreed").value;
        const petDob = document.getElementById("petDob").value;
        const petGallery = Array.from(document.getElementById("petGallery").files).map(file => URL.createObjectURL(file)); // Save image URLs
        const petBirthday = document.getElementById("petBirthday").value;

        const newProfile = {
            name: petName,
            breed: petBreed,
            dob: petDob,
            birthday: petBirthday,
            gallery: petGallery
        };

        petProfiles.push(newProfile);
        localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage

        profileSection.classList.add("hidden");
        renderProfiles(); // Re-render profiles
    });
});
