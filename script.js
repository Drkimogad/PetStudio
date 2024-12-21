document.addEventListener('DOMContentLoaded', function () {
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const createProfileBtn = document.getElementById('createProfileBtn');
    const profileSection = document.getElementById('profileSection');
    const profileForm = document.getElementById('profileForm');
    const petList = document.getElementById('petList');
    const addProfilesBtn = document.getElementById('addProfilesBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');

    let userData = JSON.parse(localStorage.getItem('userData')) || null;
    let pets = JSON.parse(localStorage.getItem('pets')) || [];

    // Sign-Up Form Handling
    document.getElementById('signupForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;

        // Save user data in local storage
        userData = { username, password };
        localStorage.setItem('userData', JSON.stringify(userData));

        // Redirect to Dashboard
        signupPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
        usernameDisplay.textContent = username;

        displayPets();
    });

    // Create Pet Profile Form Handling
    createProfileBtn.addEventListener('click', function () {
        profileSection.classList.remove('hidden');
    });

    profileForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const petName = document.getElementById('petName').value;
        const petBreed = document.getElementById('petBreed').value;
        const petDob = document.getElementById('petDob').value;
        const petBirthday = document.getElementById('petBirthday').value;
        const petPhoto = document.getElementById('petPhoto').files;
        
        let petPhotos = [];
        for (let i = 0; i < petPhoto.length; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                petPhotos.push(e.target.result);
                if (petPhotos.length === petPhoto.length) {
                    savePetProfile(petName, petBreed, petDob, petBirthday, petPhotos);
                }
            }
            reader.readAsDataURL(petPhoto[i]);
        }
    });

    function savePetProfile(petName, petBreed, petDob, petBirthday, petPhotos) {
        const newPet = { petName, petBreed, petDob, petBirthday, petPhotos };
        pets.push(newPet);
        localStorage.setItem('pets', JSON.stringify(pets));

        profileSection.classList.add('hidden');
        displayPets();
    }

    function displayPets() {
        petList.innerHTML = '';
        pets.forEach((pet, index) => {
            const petCard = document.createElement('div');
            petCard.classList.add('petCard');
            petCard.innerHTML = `
                <h3>${pet.petName}</h3>
                <p>Breed: ${pet.petBreed}</p>
                <p>Date of Birth: ${pet.petDob}</p>
                <p>Birthday: ${pet.petBirthday}</p>
                <div id="petGalleryContainer">
                    ${pet.petPhotos.map(photo => `<img src="${photo}" alt="Pet Photo">`).join('')}
                </div>
                <button class="deleteBtn" onclick="deletePet(${index})">Delete</button>
            `;
            petList.appendChild(petCard);
        });
    }

    // Add Profiles Button
    addProfilesBtn.addEventListener('click', function () {
        profileSection.classList.remove('hidden');
    });

    window.deletePet = function(index) {
        pets.splice(index, 1);
        localStorage.setItem('pets', JSON.stringify(pets));
        displayPets();
    };
});
