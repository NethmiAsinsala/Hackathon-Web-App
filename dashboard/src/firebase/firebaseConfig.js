// Firebase Configuration for Project Aegis
// ==========================================
// INSTRUCTIONS: Replace the placeholder values below with your Firebase project credentials.
// Get these from: Firebase Console → Project Settings → Your Apps → Web App → Config

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBBVFcJ6OTZXAUcHELdK4sgigDaY75rk2o",
    authDomain: "hackathon-project-eaab9.firebaseapp.com",
    projectId: "hackathon-project-eaab9",
    storageBucket: "hackathon-project-eaab9.firebasestorage.app",
    messagingSenderId: "809284481182",
    appId: "1:809284481182:web:fee44b491200a9ac368b8f"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

export default app
