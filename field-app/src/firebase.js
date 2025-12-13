// field-app/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// 👇 PASTE YOUR NEW KEYS FROM THE CONSOLE HERE
const firebaseConfig = {
  apiKey: "AIzaSyBBVFcJ6OTZXAUcHELdK4sgigDaY75rk2o",
  authDomain: "hackathon-project-eaab9.firebaseapp.com",
  projectId: "hackathon-project-eaab9",
  storageBucket: "hackathon-project-eaab9.firebasestorage.app",
  messagingSenderId: "809284481182",
  appId: "1:809284481182:web:fee44b491200a9ac368b8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (The Cloud Database)
export const firestoreDB = getFirestore(app);

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