signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    if (newUsername && newPassword) {
        // Save the credentials to localStorage
        localStorage.setItem('username', newUsername);
        localStorage.setItem('password', newPassword);

        showMessage('Sign-up successful! Please log in.');
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    } else {
        showMessage('Please fill in all fields.');
    }
});

// Update login functionality to validate against stored credentials
loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Retrieve stored credentials
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        usernameDisplay.textContent = username;
        loginPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
        showMessage('Login successful!');
    } else {
        showMessage('Invalid credentials. Please try again.');
    }
});
