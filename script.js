document.addEventListener('DOMContentLoaded', function() {

    // Page elements
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const createProfileBtn = document.getElementById('createProfileBtn');
    const profileForm = document.getElementById('profileForm');
    const petList = document.getElementById('petList');
    const addProfilesBtn = document.getElementById('addProfilesBtn');
    const profileSection = document.getElementById('profileSection');

    // Local Storage key for pet profiles
    const profilesKey = 'petProfiles';

    // Sign-Up Form
    document.getElementById('signupForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Save user data and redirect
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;

        if (username && password) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            signupPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
            loadProfiles();
        }
    });

    // Create profile button
    createProfileBtn.addEventListener('click', function() {
        profileSection.classList.remove('hidden');
    });

    // Save profile to local storage
    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const petName = document.getElementById('petName').value;
        const petBreed = document.getElementById('petBreed').value;
        const petDob = document.getElementById('petDob').value;
        const petPhoto = document.getElementById('petPhoto').files[0];
        const petBirthday = document.getElementById('petBirthday').value;

        // Prepare pet profile object
        const petProfile = {
            petName,
            petBreed,
            petDob,
            petBirthday,
            photo: petPhoto ? URL.createObjectURL(petPhoto) : '',
        };

        // Get existing profiles from local storage
        let profiles = JSON.parse(localStorage.getItem(profilesKey)) || [];
        profiles.push(petProfile);
        localStorage.setItem(profilesKey, JSON.stringify(profiles));

        // Hide profile form and refresh profiles list
        profileSection.classList.add('hidden');
        loadProfiles();
    });

    // Load profiles from local storage
    function loadProfiles() {
        const profiles = JSON.parse(localStorage.getItem(profilesKey)) || [];
        petList.innerHTML = ''; // Clear current list
        profiles.forEach((profile, index) => {
            const petCard = document.createElement('div');
            petCard.classList.add('pet-card');
            petCard.innerHTML = `
                <img src="${profile.photo}" alt="Pet photo">
                <div class="pet-info">
                    <h3>${profile.petName}</h3>
                    <p>${profile.petBreed}</p>
                    <p>${profile.petDob}</p>
                    <p class="reminder">Birthday: ${profile.petBirthday}</p>
                </div>
                <div class="buttons">
                    <button class="button edit" onclick="editProfile(${index})">Edit</button>
                    <button class="button delete" onclick="deleteProfile(${index})">Delete</button>
                </div>
            `;
            petList.appendChild(petCard);
        });
    }

    // Edit profile function
    window.editProfile = function(index) {
        const profiles = JSON.parse(localStorage.getItem(profilesKey)) || [];
        const profile = profiles[index];
        // Populate the form with existing profile data
        document.getElementById('petName').value = profile.petName;
        document.getElementById('petBreed').value = profile.petBreed;
        document.getElementById('petDob').value = profile.petDob;
        document.getElementById('petBirthday').value = profile.petBirthday;
    };

    // Delete profile function
    window.deleteProfile = function(index) {
        const profiles = JSON.parse(localStorage.getItem(profilesKey)) || [];
        profiles.splice(index, 1);
        localStorage.setItem(profilesKey, JSON.stringify(profiles));
        loadProfiles();
    };

    // Load profiles on page load if already exists
    loadProfiles();
});
