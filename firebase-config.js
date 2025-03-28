// Import Firebase services
import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore"; // For Firestore
import { getAuth } from "firebase/auth"; // For Authentication
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

// **1. Initialize Firebase App**
const app = initializeApp(firebaseConfig);

// **2. Firestore Database Setup**  
// This section initializes Firestore and stores the reference in `db`
const db = getFirestore(app);  
console.log("Firestore initialized and ready to use.");  

// **3. Firebase Authentication Setup**  
// This section initializes the Auth service and stores the reference in `auth`
const auth = getAuth(app);  
console.log("Authentication service initialized.");  

// **4. Firebase Cloud Messaging Setup**  
const messaging = getMessaging(app);  // Get messaging instance

// **5. Set VAPID key and handle token generation**
getToken(messaging, { vapidKey: "BAL7SL85Z3cAH-T6oDGvfxV0oJhElCpnc7F_TaF2RQogy0gnUChGa_YtmwKdifC4c4pZ0NhUd4T6BFHGRxT79Gk" })
  .then((currentToken) => {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Send the token to your server and update the UI if necessary
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  })
  .catch((err) => {
    console.error('An error occurred while retrieving token: ', err);
  });

// Export modules if needed in other files
export { db, auth, messaging };
