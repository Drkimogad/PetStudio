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

    let petProfiles = [];

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
        const petGallery = Array.from(document.getElementById("petGallery").files);
        const petBirthday = document.getElementById("petBirthday").value;

        const petCard = document.createElement("div");
        petCard.classList.add("petCard");
        petCard.innerHTML = `
            <h3>${petName}</h3>
            <p>Breed: ${petBreed}</p>
            <p>DOB: ${petDob}</p>
            <p>Birthday: ${petBirthday}</p>
            <div>
                ${petGallery
                    .map((file) => `<img src="${URL.createObjectURL(file)}" alt="Pet Photo" class="pet-photo">`)
                    .join("")}
            </div>
            <button class="deleteBtn">Delete</button>
            <button class="printBtn" onclick="printProfile('${petName}', '${petBreed}', '${petDob}', '${petBirthday}', ${JSON.stringify(petGallery)})">Print</button>
        `;

        petCard.querySelector(".deleteBtn").addEventListener("click", () => {
            petList.removeChild(petCard);
        });

        petList.appendChild(petCard);
        profileSection.classList.add("hidden");
        profileForm.reset();
    });

    // Function to print the relevant pet profile
    window.printProfile = function(petName, petBreed, petDob, petBirthday, petGallery) {
        const content = `
            <h3>${petName}</h3>
            <p>Breed: ${petBreed}</p>
            <p>DOB: ${petDob}</p>
            <p>Birthday: ${petBirthday}</p>
            <div>
                ${petGallery
                    .map((imageUrl) => `<img src="${imageUrl}" alt="Pet Photo" class="pet-photo">`)
                    .join("")}
            </div>
        `;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Profile</title></head><body>');
        printWindow.document.write(content);
        printWindow.document.write('<br><button onclick="window.print()">Print</button>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    };

    // Function to toggle between pages (sign-up, login, dashboard)
    function togglePages() {
        if (localStorage.getItem("username")) {
            signupPage.classList.add("hidden");
            loginPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
        } else {
            signupPage.classList.remove("hidden");
        }
    }

    togglePages();
});
