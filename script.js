document.addEventListener('DOMContentLoaded', function () {
    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const signOutBtn = document.getElementById('signOutBtn');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');

    // Handle login form submission
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulated login validation (Replace with real validation logic if needed)
        if (username && password) {
            console.log('Login successful!'); // Debugging log
            dashboard.classList.remove('hidden');
            loginPage.classList.add('hidden');
        } else {
            alert('Please enter both username and password.');
        }
    });

    // Handle sign-up form submission
    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        if (newUsername && newPassword) {
            console.log('Sign up successful!'); // Debugging log

            // Store sign-up data in localStorage
            localStorage.setItem('username', newUsername);
            localStorage.setItem('password', newPassword);

            // Reset form fields
            signupForm.reset();

            // Show login page
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
        } else {
            alert('Please fill in all required fields.');
        }
    });

    // Handle sign-out
    signOutBtn.addEventListener('click', function () {
        dashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // Navigate to sign-up page
    signupLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginPage.classList.add('hidden');
        signupPage.classList.remove('hidden');
    });

    // Navigate back to login page
    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });
});
