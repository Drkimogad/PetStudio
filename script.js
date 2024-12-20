document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const messageBox = document.getElementById('messageBox');

    // Function to show messages to the user
    function showMessage(message) {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000);
    }

    // Handle login form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        // Perform authentication logic here (e.g., check credentials)
        if (username && password) {
            // Assuming the login is successful
            usernameDisplay.textContent = username;
            loginPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
            showMessage('Login successful!');
        } else {
            showMessage('Please enter valid credentials.');
        }
    });

    // Handle sign-up form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        // Perform sign-up logic here (e.g., create new user)
        if (newUsername && newPassword) {
            showMessage('Sign-up successful! Please log in.');
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
        } else {
            showMessage('Please fill in all fields.');
        }
    });

    // Handle navigation to sign-up page
    document.getElementById('signupLink').addEventListener('click', function(event) {
        event.preventDefault();
        loginPage.classList.add('hidden');
        signupPage.classList.remove('hidden');
    });

    // Handle navigation to login page
    document.getElementById('loginLink').addEventListener('click', function(event) {
        event.preventDefault();
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // Handle logout action
    document.getElementById('logoutBtn').addEventListener('click', function() {
        dashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
        showMessage('Logged out successfully.');
    });

    // Handle view pets action
    document.getElementById('viewPetsBtn').addEventListener('click', function() {
        // Logic to display pets
        showMessage('Displaying pets...');
    });

    // Handle add pet action
    document.getElementById('addPetBtn').addEventListener('click', function() {
        // Logic to add a new pet
        showMessage('Add pet form will be displayed...');
    });
});
