// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfpHw8M8g-G7lV1XN2vGQx85HDpK3Op_4",
  authDomain: "projeto-avaliacao1.firebaseapp.com",
  projectId: "projeto-avaliacao1",
  storageBucket: "projeto-avaliacao1.firebasestorage.app",
  messagingSenderId: "468997084003",
  appId: "1:468997084003:web:a9848be173d83f1c497956"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };