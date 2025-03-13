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

// Purpose: This file contains the main logic for requesting notification permissions and retrieving the FCM token for your app //

// app.js or index.js (your main JavaScript file)
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
      vapidKey: 'YOUR_VAPID_KEY', // Replace this with actual VAPID Key from Firebase Console
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

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });
}
// end of added code //


// Check if service workers and Push Notification API are supported by the browser
if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Register the service worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);

            // Ask the user for permission to send push notifications on button click
            document.getElementById('enableNotificationsButton').addEventListener('click', () => {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        console.log('Notification permission granted.');
                        // Subscribe the user to push notifications
                        subscribeUserToPushNotifications(registration);
                    } else {
                        console.log('Notification permission denied.');
                    }
                });
            });

        }).catch(function(error) {
            console.log('Service Worker registration failed:', error);
        });
}

// Function to subscribe the user to push notifications
function subscribeUserToPushNotifications(registration) {
    // Check if the user is already subscribed
    registration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                console.log('Already subscribed to push notifications:', subscription);
                // You can send the subscription details to your server here if needed
            } else {
                // If not subscribed, create a new subscription
                registration.pushManager.subscribe({
                    userVisibleOnly: true, // Ensures notifications are visible to the user
                    applicationServerKey: urlB64ToUint8Array('BFT2ZAIuHo5wtIgax8uovZ-mHaZqR8dJz5kaQRsS0JpzeKCqX6Y_27E_R2YFoD_1Z4J93j2BU5rc4hVHT76qbrU') // Replace with your VAPID public key
                })
                .then(function(newSubscription) {
                    console.log('Subscribed to push notifications:', newSubscription);
                    // You can send the subscription details to your server here if needed
                })
                .catch(function(error) {
                    console.error('Failed to subscribe to push notifications:', error);
                });
            }
        })
        .catch(function(error) {
            console.error('Error during subscription check:', error);
        });
}

// Helper function to convert the VAPID public key from Base64 to Uint8Array
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/\_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Modify your script.js file to send the subscription data to your server

const publicVapidKey = 'BFT2ZAIuHo5wtIgax8uovZ-mHaZqR8dJz5kaQRsS0JpzeKCqX6Y_27E_R2YFoD_1Z4J93j2BU5rc4hVHT76qbrU';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(async registration => {
      console.log('Service Worker registered.');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log('Subscribed:', subscription);

      // Send subscription to the server
      await fetch('https://pet-studio.vercel.app/api/save-subscription', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
      });
    })
    .catch(console.error);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
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
