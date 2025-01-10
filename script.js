document.addEventListener("DOMContentLoaded", () => {
    const signupPage = document.getElementById("signupPage");
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const createProfileBtn = document.getElementById("createProfileBtn");
    const profileSection = document.getElementById("profileSection");
    const profileForm = document.getElementById("profileForm");
    const petList = document.getElementById("petList");

    let petProfiles = JSON.parse(localStorage.getItem("petProfiles")) || []; // Load saved profiles

    
    // Initially hide the logout button
    logoutBtn.style.display = 'none';
    
    // Redirect to login page from signup
    document.getElementById("loginLink").addEventListener("click", (e) => {
        e.preventDefault();
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });

    // Function to render profiles
    function renderProfiles() {
        petList.innerHTML = ''; // Clear the list
        petProfiles.forEach(profile => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");
            petCard.innerHTML = `
                <div class="petDetails">
                    <h3>${profile.name}</h3>
                    <p>Breed: ${profile.breed}</p>
                    <p>DOB: ${profile.dob}</p>
                    <p>Birthday: ${profile.birthday}</p>
                </div>
                <div class="petGallery">
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.name !== profile.name);
                localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
                renderProfiles();
            });

            petCard.querySelector(".printBtn").addEventListener("click", () => {
                const printContent = petCard.cloneNode(true);
                printContent.querySelector(".deleteBtn").style.display = "none";
                printContent.querySelector(".printBtn").style.display = "none";

                printContent.querySelectorAll("img").forEach(img => {
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.objectFit = "contain";
                });

                const printWindow = window.open("", "", "height=500,width=800");
                printWindow.document.write('<html><head><title>Print Profile</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .petCard img { max-width: 100%; height: auto; object-fit: contain; }
                    .deleteBtn, .printBtn { display: none; }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });

            petList.appendChild(petCard);
        });

    // Show the logout button if there are saved profiles
    if (petProfiles.length > 0) {
        logoutBtn.classList.remove('hidden'); // Remove the hidden class to show the logout button
    } else {
        logoutBtn.classList.add('hidden'); // Hide the logout button if there are no profiles
    }
}

// Initial rendering of profiles
if (petProfiles.length > 0) {
    renderProfiles(); // Call renderProfiles to display existing profiles
} else {
    logoutBtn.classList.add('hidden'); // Hide the logout button initially if no profiles are present
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
            renderProfiles();
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
        const petGallery = Array.from(document.getElementById("petGallery").files).map(file => URL.createObjectURL(file));
        const petBirthday = document.getElementById("petBirthday").value;

        const newProfile = {
            name: petName,
            breed: petBreed,
            dob: petDob,
            birthday: petBirthday,
            gallery: petGallery
        };

        petProfiles.push(newProfile);
        localStorage.setItem("petProfiles", JSON.stringify(petProfiles));
        renderProfiles();
        profileSection.classList.add("hidden");
        profileForm.reset();
    });

    // Initial rendering of profiles
    if (petProfiles.length > 0) {
        renderProfiles();
    }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
    // Clear user credentials from localStorage
    localStorage.removeItem("username");
    localStorage.removeItem("password");

    // Hide dashboard and show the login page
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    alert("You have been logged out.");
});

// Check if service workers and Push Notification API are supported by the browser
if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Register the service worker
    navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);

            // Ask the user for permission to send push notifications
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');

                    // Subscribe the user to push notifications
                    subscribeUserToPushNotifications(registration);
                } else {
                    console.log('Notification permission denied.');
                }
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
  navigator.serviceWorker.register('/sw.js')
    .then(async registration => {
      console.log('Service Worker registered.');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log('Subscribed:', subscription);

      // Send subscription to the server
      await fetch('https://pet-studio-6mnsbdcce-drkimogad-s-projects.vercel.app/api/save-subscription', {
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
