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

    let petProfiles = JSON.parse(localStorage.getItem("petProfiles")) || []; // Load saved profiles

    // Redirect to login page from signup
    document.getElementById("loginLink").addEventListener("click", (e) => {
        e.preventDefault();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

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
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.name !== profile.name);
                localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
                renderProfiles();
            });

            petCard.querySelector(".printBtn").addEventListener("click", () => {
                const printContent = petCard.cloneNode(true);
                printContent.querySelector(".deleteBtn").style.display = "none";
                printContent.querySelector(".printBtn").style.display = "none";

                printContent.querySelectorAll("img").forEach(img => {
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.objectFit = "contain";
                });

                const printWindow = window.open("", "", "height=500,width=800");
                printWindow.document.write('<html><head><title>Print Profile</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .petCard img { max-width: 100%; height: auto; object-fit: contain; }
                    .deleteBtn, .printBtn { display: none; }
                `);
                printWindow.document.write('</style></head><body>');
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
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // Handle login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === localStorage.getItem("username") && password === localStorage.getItem("password")) {
            alert("Login successful!");
            loginPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            renderProfiles();
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
        const petGallery = Array.from(document.getElementById("petGallery").files).map(file => URL.createObjectURL(file));
        const petBirthday = document.getElementById("petBirthday").value;

        const newProfile = {
            name: petName,
            breed: petBreed,
            dob: petDob,
            birthday: petBirthday,
            gallery: petGallery
        };

        petProfiles.push(newProfile);
        localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
        renderProfiles();
        profileSection.classList.add("hidden");
        profileForm.reset();
    });

    // Initial rendering of profiles
    if (petProfiles.length > 0) {
        renderProfiles();
    }
});
