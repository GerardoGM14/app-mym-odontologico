// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // 👈 importar storage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhJ0L0AfRHLFToFN3qJpkHUGeH3dh4leA",
  authDomain: "odonto-system-438b7.firebaseapp.com",
  projectId: "odonto-system-438b7",
  storageBucket: "odonto-system-438b7.firebasestorage.app",
  messagingSenderId: "934987312061",
  appId: "1:934987312061:web:7134ef08f97470466e40d4",
  measurementId: "G-HSLTGXEDM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// 👇 Esto es lo importante
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 👈 inicializar storage

export { auth, db, storage};