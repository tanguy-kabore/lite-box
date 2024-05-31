// src/firebase/config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2Uq4YvWCqOu8oH0_2VkyeE3a5lYObk9s",
    authDomain: "lite-box-e4d1b.firebaseapp.com",
    projectId: "lite-box-e4d1b",
    storageBucket: "lite-box-e4d1b.appspot.com",
    messagingSenderId: "1017677752731",
    appId: "1:1017677752731:web:245c2f3bbe7f619f25d93e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, storage, firestore, googleProvider, facebookProvider };
