document.addEventListener('DOMContentLoaded', function() {
    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const createProfileBtn = document.getElementById('createProfileBtn');
    const profileSection = document.getElementById('profileSection');
    const petList = document.getElementById('petList');
    let pets = [];

    // Handle login form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username && password) {
            dashboard.classList.remove('hidden');
            loginPage.classList.add('hidden');
        }
    });

    // Handle sign-up form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        if (newUsername && newPassword) {
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
        }
    });

    // Handle create profile button click
    createProfileBtn.addEventListener('click', function() {
        profileSection.classList.remove('hidden');
    });

    // Handle saving pet profile
    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const petName = document.getElementById('petName').value;
        const petBreed = document.getElementById('petBreed').value;
        const petDob = document.getElementById('petDob').value;
        const petBirthday = document.getElementById('petBirthday').value;
        const petPhotos = document.getElementById('petPhoto').files;

        const pet = {
            name: petName,
            breed: petBreed,
            dob: petDob,
            birthday: petBirthday,
            photos: Array.from(petPhotos).map(file => URL.createObjectURL(file)),
        };

        pets.push(pet);
        displayPets();
        profileSection.classList.add('hidden');
    });

    // Display pet profiles
    function displayPets() {
        petList.innerHTML = '';
        pets.forEach((pet, index) => {
            const petCard = document.createElement('div');
            petCard.classList.add('petCard');
            petCard.innerHTML = `
                <h3>${pet.name}</h3>
                <p>Breed: ${pet.breed}</p>
                <p>DOB: ${pet.dob}</p>
                <p>Birthday Reminder: ${pet.birthday}</p>
                <div class="gallery">
                    ${pet.photos.map(photo => `<img src="${photo}" alt="Pet Photo" class="petPhoto">`).join('')}
                </div>
                <button class="printBtn" onclick="printPet(${index})">Print Profile</button>
                <button class="deleteBtn" onclick="deletePet(${index})">Delete</button>
            `;
            petList.appendChild(petCard);
        });
    }

    // Print the pet profile
    window.printPet = function(index) {
        const pet = pets[index];
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Pet Profile</title></head><body>');
        printWindow.document.write(`<h3>${pet.name}</h3>`);
        printWindow.document.write(`<p>Breed: ${pet.breed}</p>`);
        printWindow.document.write(`<p>DOB: ${pet.dob}</p>`);
        printWindow.document.write(`<p>Birthday Reminder: ${pet.birthday}</p>`);
        printWindow.document.write('<div class="gallery">');
        pet.photos.forEach(photo => {
            printWindow.document.write(`<img src="${photo}" alt="Pet Photo" class="petPhoto">`);
        });
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    // Delete a pet profile
    window.deletePet = function(index) {
        pets.splice(index, 1);
        displayPets();
    };
});
