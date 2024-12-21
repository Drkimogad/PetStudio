document.addEventListener('DOMContentLoaded', () => {
    const signupPage = document.getElementById('signupPage');
    const loginPage = document.getElementById('loginPage');
    const dashboard = document.getElementById('dashboard');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const createProfileBtn = document.getElementById('createProfileBtn');
    const profileSection = document.getElementById('profileSection');
    const profileForm = document.getElementById('profileForm');
    const petList = document.getElementById('petList');

    // Local Storage Keys
    const usersKey = 'users';
    const profilesKey = 'profiles';

    // Helper to save to local storage
    const saveToStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    // Load users from storage
    const loadUsers = () => JSON.parse(localStorage.getItem(usersKey)) || [];

    // Load profiles
    const loadProfiles = () => JSON.parse(localStorage.getItem(profilesKey)) || [];

    // Handle Sign Up
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        const users = loadUsers();
        users.push({ username: newUsername, password: newPassword });
        saveToStorage(usersKey, users);

        alert('Sign up successful!');
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // Handle Login
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const users = loadUsers();
        const userExists = users.some(user => user.username === username && user.password === password);

        if (userExists) {
            alert(`Welcome, ${username}!`);
            loginPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
        } else {
            alert('Invalid username or password.');
        }
    });

    // Show Profile Form
    createProfileBtn.addEventListener('click', () => {
        profileSection.classList.remove('hidden');
    });

    // Handle Profile Form Submission
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const petName = document.getElementById('petName').value;
        const petBreed = document.getElementById('petBreed').value;
        const petDob = document.getElementById('petDob').value;
        const petPhoto = document.getElementById('petPhoto').files[0];
        const petBirthday = document.getElementById('petBirthday').value;

        const profiles = loadProfiles();
        profiles.push({ petName, petBreed, petDob, petPhoto, petBirthday });
        saveToStorage(profilesKey, profiles);

        alert('Profile saved!');
        profileSection.classList.add('hidden');
        renderProfiles();
    });

    // Render Profiles
    const renderProfiles = () => {
        const profiles = loadProfiles();
        petList.innerHTML = '';
        profiles.forEach(profile => {
            const profileDiv = document.createElement('div');
            profileDiv.classList.add('profile');
            profileDiv.innerHTML = `
                <h3>${profile.petName}</h3>
                <p>Breed: ${profile.petBreed}</p>
                <p>DOB: ${profile.petDob}</p>
                <p>Birthday: ${profile.petBirthday || 'Not set'}</p>
            `;
            petList.appendChild(profileDiv);
        });
    };

    renderProfiles();
});
