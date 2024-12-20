<script>
document.addEventListener('DOMContentLoaded', function() {

    const loginPage = document.getElementById('loginPage');
    const signupPage = document.getElementById('signupPage');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const signOutBtn = document.getElementById('signOutBtn');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink'); // Add this line for login link handling

    // Handle login form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Assume login is successful
        if (username && password) {
            console.log('Login successful!');  // Debugging log
            dashboard.classList.remove('hidden');
            loginPage.classList.add('hidden');
        }
    });

    // Handle sign-up form submission
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        // Debugging log to see if data is being captured
        console.log('Sign Up form submitted');
        console.log('Username:', newUsername);
        console.log('Password:', newPassword);

        // Add validation logic here (e.g., check if username and password are not empty)
        if (newUsername && newPassword) {
            console.log('Sign up successful!');  // Debugging log
            // Hide sign-up page and show login page
            signupPage.classList.add('hidden');
            loginPage.classList.remove('hidden');
        } else {
            console.log('Sign up failed, missing data.');
        }
    });

    // Handle sign-out
    signOutBtn.addEventListener('click', function() {
        dashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // Handle link to go to sign-up page
    signupLink.addEventListener('click', function(event) {
        event.preventDefault();
        loginPage.classList.add('hidden');
        signupPage.classList.remove('hidden');
    });

    // Handle link to go to login page from sign-up
    loginLink.addEventListener('click', function(event) {
        event.preventDefault();
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });
});
</script>
