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

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        // Perform authentication logic here
        if (username) {
            usernameDisplay.textContent = username;
            loginPage.classList.add('hidden');
            dashboard.classList.remove('hidden');
        }
    });

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Perform sign-up logic here
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        // Assume sign-up is successful for demonstration purposes
        if (newUsername && newPassword) {
            showMessage('Sign-up successful! Please log in.');
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
        }
    });

    document.getElementById('signupLink').addEventListener('click', function() {
        loginPage.classList.add('hidden');
        signupPage.classList.remove('hidden');
    });

    document.getElementById('loginLink').addEventListener('click', function() {
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        dashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });
});
