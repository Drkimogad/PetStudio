// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);