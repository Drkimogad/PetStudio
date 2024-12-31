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
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.id !== profile.id); // Remove profile by id
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

    // Handle Signup Form
    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        // Save user to localStorage (for simplicity)
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);

        // Show login page after signup
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // Handle Login Form
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        if (username === localStorage.getItem('username') && password === localStorage.getItem('password')) {
            // Successfully logged in
            loginPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
            renderProfiles(); // Render profiles on dashboard
        } else {
            alert('Invalid credentials!');
        }
    });

    // Handle Create Profile Button
    createProfileBtn.addEventListener("click", () => {
        profileSection.classList.remove('hidden');
    });

    // Handle Profile Form Submission
    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = event.target.petName.value;
        const breed = event.target.petBreed.value;
        const dob = event.target.petDob.value;
        const birthday = event.target.petBirthday.value;
        const gallery = Array.from(event.target.petGallery.files).map(file => URL.createObjectURL(file));

        const newProfile = {
            id: Date.now(), // Use timestamp as unique ID
            name,
            breed,
            dob,
            birthday,
            gallery
        };

        petProfiles.push(newProfile);
        localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage

        renderProfiles(); // Re-render profiles
        profileForm.reset();
        profileSection.classList.add('hidden');
    });
});
