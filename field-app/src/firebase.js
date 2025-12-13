// field-app/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// 👇 PASTE YOUR NEW KEYS FROM THE CONSOLE HERE
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (The Cloud Database)
export const firestoreDB = getFirestore(app);

// Initialize Firebase Auth with local persistence
// This keeps the user signed in even after browser/app closes
export const auth = getAuth(app);

// Set persistence to LOCAL - survives browser restart
// Combined with our IndexedDB cache, this provides robust offline auth
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('🔐 Firebase Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Failed to set auth persistence:', error);
  });

// Helper function to compress image to fit in Firestore (max ~800KB for safety)
export const compressImage = (base64String, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => resolve(null);
    img.src = base64String;
  });
};

// Export helper functions so we can use them in other files
export { collection, addDoc };