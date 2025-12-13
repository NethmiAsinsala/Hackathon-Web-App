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

// Export helper functions so we can use them in other files
export { collection, addDoc };