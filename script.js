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
            <div class="gallery">
                ${petGallery
                    .map((file) => `<img src="${URL.createObjectURL(file)}" alt="Pet Photo" class="printable-img">`)
                    .join("")}
            </div>
            <button class="deleteBtn">Delete</button>
            <button class="printBtn" onclick="printProfile(${petProfiles.length})">Print</button>
        `;

        petCard.querySelector(".deleteBtn").addEventListener("click", () => {
            petList.removeChild(petCard);
        });

        petList.appendChild(petCard);
        profileSection.classList.add("hidden");
        profileForm.reset();
    });

    // Print profile function
    window.printProfile = (index) => {
        const petCard = petList.children[index];
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Profile</title>');
        printWindow.document.write('<style>.printable-img { max-width: 100%; height: auto; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(petCard.innerHTML); // Only the relevant profile content
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };
});
