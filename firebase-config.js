import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
  authDomain: "swiftreach2025.firebaseapp.com",
  projectId: "swiftreach2025",
  storageBucket: "swiftreach2025.firebasestorage.app",
  messagingSenderId: "540185558422",
  appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
  measurementId: "G-SNBPRVBPNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app); // Get messaging instance

// Set VAPID key
getToken(messaging, { vapidKey: "BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk" }).then((currentToken) => {
  if (currentToken) {
    console.log('Got FCM device token:', currentToken);
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.error('An error occurred while retrieving token. ', err);
  // ...
});

export { messaging }; // Export messaging
