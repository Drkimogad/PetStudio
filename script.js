let currentUser = null;
let petProfiles = [];

// Check if user is logged in
function checkLoginStatus() {
    const username = localStorage.getItem('username');
    if (username) {
        currentUser = username;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('signupPage').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('createProfileBtn').classList.remove('hidden');
        document.getElementById('usernameDisplay').innerText = username;
        loadPetProfiles();
    } else {
        document.getElementById('loginPage').classList.remove('hidden');
    }
}

// Sign up functionality
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    checkLoginStatus();
});

// Login functionality
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (localStorage.getItem('username') === username && localStorage.getItem('password') === password) {
        checkLoginStatus();
    } else {
        alert('Incorrect username or password');
    }
});

// Show profile form
document.getElementById('createProfileBtn').addEventListener('click', () => {
    document.getElementById('profileSection').classList.remove('hidden');
});

// Save profile to localStorage
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const petName = document.getElementById('petName').value;
    const petBreed = document.getElementById('petBreed').value;
    const petDob = document.getElementById('petDob').value;
    const petBirthday = document.getElementById('petBirthday').value;
    const petGallery = document.getElementById('petGallery').files;

    const petProfile = {
        name: petName,
        breed: petBreed,
        dob: petDob,
        birthday: petBirthday,
        gallery: Array.from(petGallery).map(file => URL.createObjectURL(file))
    };

    petProfiles.push(petProfile);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));

    document.getElementById('profileSection').classList.add('hidden');
    loadPetProfiles();
});

// Load pet profiles
function loadPetProfiles() {
    const petListDiv = document.getElementById('petList');
    petListDiv.innerHTML = '';

    petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];

    petProfiles.forEach((profile, index) => {
        const petDiv = document.createElement('div');
        petDiv.classList.add('petProfile');

        const petName = document.createElement('h3');
        petName.textContent = profile.name;

        const petBreed = document.createElement('p');
        petBreed.textContent = `Breed: ${profile.breed}`;

        const petDob = document.createElement('p');
        petDob.textContent = `DOB: ${profile.dob}`;

        const petGallery = document.createElement('div');
        profile.gallery.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            petGallery.appendChild(img);
        });

        const printButton = document.createElement('button');
        printButton.textContent = 'Print Profile';
        printButton.classList.add('button');
        printButton.addEventListener('click', () => printProfile(index));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Profile';
        deleteButton.classList.add('deleteBtn');
        deleteButton.addEventListener('click', () => deleteProfile(index));

        petDiv.appendChild(petName);
        petDiv.appendChild(petBreed);
        petDiv.appendChild(petDob);
        petDiv.appendChild(petGallery);
        petDiv.appendChild(printButton);
        petDiv.appendChild(deleteButton);

        petListDiv.appendChild(petDiv);
    });
}

// Print a specific pet profile
function printProfile(index) {
    const profile = petProfiles[index];
    let printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><body>');
    printWindow.document.write('<h1>' + profile.name + ' - Pet Profile</h1>');
    printWindow.document.write('<p>Breed: ' + profile.breed + '</p>');
    printWindow.document.write('<p>DOB: ' + profile.dob + '</p>');
    printWindow.document.write('<p>Birthday Reminder: ' + profile.birthday + '</p>');
    profile.gallery.forEach(src => {
        printWindow.document.write('<img src="' + src + '" style="max-width: 100%; max-height: 200px; margin: 10px;">');
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Delete a pet profile
function deleteProfile(index) {
    petProfiles.splice(index, 1);
    localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
    loadPetProfiles();
}

// Initialize the app
checkLoginStatus();
