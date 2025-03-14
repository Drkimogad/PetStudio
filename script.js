document.addEventListener("DOMContentLoaded", () => {
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    const logoutBtn = document.getElementById("logoutBtn");

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const createProfileBtn = document.getElementById("createProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const profileForm = document.getElementById("profileForm");
    const petList = document.getElementById("petList");

    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || []; // Load saved profiles
    logoutBtn.style.display = "none";
    
    // Highlighted part - Add this code for the login link redirection
    document.getElementById("loginLink").addEventListener("click", (e) => {
        e.preventDefault(); // Prevents the default link behavior
        document.getElementById("signupPage").classList.add("hidden"); // Hides the sign-up page
        document.getElementById("loginPage").classList.remove("hidden"); // Shows the login page
    });

    // Function to render profiles
    function renderProfiles() {
        petList.innerHTML = ''; // Clear the list
        petProfiles.forEach(profile => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");
            petCard.innerHTML = `
                <h3>${profile.name}</h3>
                <p>Breed: ${profile.breed}</p>
                <p>DOB: ${profile.dob}</p>
                <p>Birthday: ${profile.birthday}</p>
                <div>
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.name !== profile.name); // Remove profile from array
                localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage
                renderProfiles(); // Re-render the profiles
            });

            petCard.querySelector(".printBtn").addEventListener("click", () => {
                // Clone the specific pet profile content for printing
                const printContent = petCard.cloneNode(true);
                printContent.querySelector(".deleteBtn").style.display = "none"; // Hide delete button in print
                printContent.querySelector(".printBtn").style.display = "none"; // Hide print button in print

                const printWindow = window.open('', '', 'height=500,width=800');
                printWindow.document.write('<html><head><title>Print Profile</title></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });

            petList.appendChild(petCard);
        });
    }

    // Handle sign-up
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        localStorage.setItem("username", document.getElementById("newUsername").value);
        localStorage.setItem("password", document.getElementById("newPassword").value);
        alert("Sign-up successful! Please log in.");
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // Handle login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === localStorage.getItem("username") && password === localStorage.getItem("password")) {
            alert("Login successful!");
            loginPage.classList.add("hidden");
            dashboard.classList.remove("hidden");
            logoutBtn.style.display = "block"; // Show the logout button
            renderProfiles(); // Load profiles when logged in
        } else {
            alert("Invalid username or password.");
        }
    });

    // Handle profile creation
    createProfileBtn.addEventListener("click", () => {
        profileSection.classList.remove("hidden");
    });

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const petName = document.getElementById("petName").value;
        const petBreed = document.getElementById("petBreed").value;
        const petDob = document.getElementById("petDob").value;
        const petGallery = Array.from(document.getElementById("petGallery").files).map(file => URL.createObjectURL(file)); // Save image URLs
        const petBirthday = document.getElementById("petBirthday").value;

        const newProfile = {
            name: petName,
            breed: petBreed,
            dob: petDob,
            birthday: petBirthday,
            gallery: petGallery
        };

        petProfiles.push(newProfile); // Add new profile to array
        localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage
        renderProfiles(); // Re-render the profiles
        profileSection.classList.add("hidden");
        profileForm.reset();
    });

    // Initial rendering of profiles (if any)
    if (petProfiles.length > 0) {
        renderProfiles();
    }
});

// Select the logout button element
const logoutBtn = document.getElementById("logoutBtn");

// Add an event listener to handle the logout action
logoutBtn.addEventListener("click", function () {
    // Clear any user data from localStorage/sessionStorage
    localStorage.removeItem("loggedInUser"); // Example key, adjust as needed

    // Hide the dashboard
    document.getElementById("dashboard").classList.add("hidden");

    // Show the login page
    document.getElementById("loginPage").classList.remove("hidden");
    logoutBtn.style.display = "none"; // Hide the logout button

    // Optionally log or display a message
    console.log("User logged out successfully");
});

// Push notifications settings//
// The VAPID public key from Firebase Console
const vapidKey = 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk'; 

// Function to subscribe to push notifications
function subscribeUserToPushNotifications(registration) {
    registration.pushManager.getSubscription()
        .then(subscription => {
            if (subscription) {
                console.log('Already subscribed:', subscription);
                sendSubscriptionToServer(subscription);
            } else {
                registration.pushManager.subscribe({
                    userVisibleOnly: true, 
                    applicationServerKey: urlBase64ToUint8Array(vapidKey), // Fixed reference
                })
                .then(newSubscription => {
                    console.log('Subscribed to push notifications:', newSubscription);
                    sendSubscriptionToServer(newSubscription);
                })
                .catch(error => {
                    console.error('Push subscription failed:', error);
                });
            }
        })
        .catch(error => console.error('Subscription check failed:', error));
}

// Function to send subscription to server
function sendSubscriptionToServer(subscription) {
    fetch('https://drkimogad.github.io/PetStudio/firebase-messaging-sw.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
    })
    .then(response => response.json())
    .then(data => console.log('Subscription sent:', data))
    .catch(error => console.error('Error sending subscription:', error));
}

// Convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/\_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

// Register service worker and handle both push & caching
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://drkimogad.github.io/PetStudio/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered:', registration.scope);
            subscribeUserToPushNotifications(registration); // Subscribe user to push notifications

            // Check for service worker updates
            registration.addEventListener('updatefound', () => {
                const installingWorker = registration.installing;
                installingWorker.addEventListener('statechange', () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        installingWorker.postMessage({ action: 'skipWaiting' });
                    }
                });
            });
        })
        .catch(error => console.error('Service Worker registration failed:', error));

    // Listen for controller changes (meaning a new SW is active)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated, reloading page...');
        location.reload(); // Ensures the latest version loads
    });
}

// Handle notification permission
if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
    document.getElementById('enableNotificationsButton').addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            console.log(permission === 'granted' ? 'Notifications enabled.' : 'Notifications denied.');
        });
    });
}
