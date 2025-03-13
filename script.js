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

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseConfig } from './firebase-config'; // Firebase config imported

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get the FCM token
const requestNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk', // Replace this with actual VAPID Key from Firebase Console
    });

    if (token) {
      console.log('FCM Token:', token);
      // Send this token to your server to send notifications
    } else {
      console.log('No registration token available.');
    }
  } catch (error) {
    console.error('Permission denied or error:', error);
  }
};

// Call the function to request notification permission
requestNotificationPermission();

// Register service worker for Firebase messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}

// (Optional) Request notification permission through a UI element
if ('serviceWorker' in navigator && 'PushManager' in window) {
  document.getElementById('enableNotificationsButton').addEventListener('click', () => {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Notification permission granted, token will be automatically retrieved in requestNotificationPermission
      } else {
        console.log('Notification permission denied.');
      }
    });
  });
}

//JavaScript Snippet to Check for Updates
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('https://drkimogad.github.io/PetStudio/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
                // Check for service worker updates
                registration.update();

                // Listen for when a new service worker is available and update it
                registration.addEventListener('updatefound', () => {
                    const installingWorker = registration.installing;
                    installingWorker.addEventListener('statechange', () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available, notify user and skip waiting
                            if (confirm('A new version of the app is available. Would you like to update?')) {
                                installingWorker.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error registering service worker:', error);
            });
    });
}
