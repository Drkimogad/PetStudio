import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging';

// Your Firebase config (replace with your actual Firebase config)
const firebaseConfig = {
 apiKey: "AIzaSyB42agDYdC2-LF81f0YurmwiDmXptTpMVw",
 authDomain: "swiftreach2025.firebaseapp.com",
 projectId: "swiftreach2025",
 storageBucket: "swiftreach2025.firebasestorage.app",
 messagingSenderId: "540185558422",
 appId: "1:540185558422:web:d560ac90eb1dff3e5071b7",
 measurementId: "G-SNBPRVBPNM"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background notifications
onBackgroundMessage(messaging, (payload) => {
  console.log('Received background message ', payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
  });
});
