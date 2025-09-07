// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase project configuration here
// You can get this from the Firebase console for your project.
const firebaseConfig = {
  apiKey: "AIzaSyDzWA_n_8uFk-1ZaL2fpHllgqZ_RnT--y4",
  authDomain: "testfirebase-d55a1.firebaseapp.com",
  databaseURL: "https://testfirebase-d55a1.firebaseio.com",
  projectId: "testfirebase-d55a1",
  storageBucket: "testfirebase-d55a1.firebasestorage.app",
  messagingSenderId: "73502279460",
  appId: "1:73502279460:web:bd4a1b9f415d677491d5b1",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
