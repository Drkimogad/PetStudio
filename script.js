document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const petFormPage = document.getElementById('petFormPage');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const petForm = document.getElementById('petForm');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const petList = document.getElementById('petList');
    const viewPetsBtn = document.getElementById('viewPetsBtn');
    const addPetBtn = document.getElementById('addPetBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    const users = JSON.parse(localStorage.getItem('users')) || {};
    let currentUser = localStorage.getItem('currentUser');

    function showPage(page) {
        loginPage.classList.add('hidden');
        signupPage.classList.add('hidden');
        dashboard.classList.add('hidden');
        petFormPage.classList.add('hidden');
        page.classList.remove('hidden');
    }

    function displayPets() {
        petList.innerHTML = '';
        const pets = JSON.parse(localStorage.getItem(currentUser + '_pets')) || [];
        pets.forEach((pet, index) => {
            const petCard = document.createElement('div');
            petCard.className = 'petCard';
            petCard.innerHTML = `
                <h3>${pet.name}</h3>
                <p>Gender: ${pet.gender}</p>
                <p>Age: ${pet.age}</p>
                <p>Breed: ${pet.breed}</p>
                <p>Vaccinations: ${pet.vaccinations}</p>
                <p>Diet: ${pet.diet}</p>
                <p>Exercise Level: ${pet.exercise}</p>
                <p>Medical History: ${pet.medicalHistory}</p>
                <button onclick="editPet(${index})">Edit</button>
            `;
            petList.appendChild(petCard);
        });
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (users[username] && users[username] === password) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            usernameDisplay.textContent = currentUser;
            showPage(dashboard);
            displayPets();
        } else {
            alert('Invalid username or password');
        }
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        if (users[newUsername]) {
            alert('Username already exists');
        } else {
            users[newUsername] = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Sign up successful! Please log in.');
            showPage(loginPage);
        }
    });

    petForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const petName = document.getElementById('petName').value;
        const petGender = document.getElementById('petGender').value;
        const petAge = document.getElementById('petAge').value;
        const petBreed = document.getElementById('petBreed').value;
        const petVaccinations = document.getElementById('petVaccinations').value;
        const petDiet = document.getElementById('petDiet').value;
        const petExercise = document.getElementById('petExercise').value;
        const petMedicalHistory = document.getElementById('petMedicalHistory').value;
        const petGallery = document.getElementById('petGallery').files;

        const pets = JSON.parse(localStorage.getItem(currentUser + '_pets')) || [];
        pets.push({
            name: petName,
            gender: petGender,
            age: petAge,
            breed: petBreed,
            vaccinations: petVaccinations,
            diet: petDiet,
            exercise: petExercise,
            medicalHistory: petMedicalHistory,
            gallery: Array.from(petGallery).map(file => URL.createObjectURL(file))
        });
        localStorage.setItem(currentUser + '_pets', JSON.stringify(pets));
        showPage(dashboard);
        displayPets();
    });

    document.getElementById('signupLink').addEventListener('click', () => {
        showPage(signupPage);
    });

    document.getElementById('loginLink').addEventListener('click', () => {
        showPage(loginPage);
    });

    viewPetsBtn.addEventListener('click', () => {
        showPage(dashboard);
        displayPets();
    });

    addPetBtn.addEventListener('click', () => {
        showPage(petFormPage);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showPage(loginPage);
    });

    // Check if the user is logged in on page load and show the appropriate page
    if (currentUser) {
        usernameDisplay.textContent = currentUser;
  
