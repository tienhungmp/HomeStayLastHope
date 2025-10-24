// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// const FIREBASE_API_KEY = 'AIzaSyDWz6FYGMTCiEZGI_x-3AlROIMo1a_0HDU'
// const FIREBASE_AUTH_DOMAIN = 'homestays-fcb33.firebaseapp.com'
// const FIREBASE_APP_ID = 'homestays-fcb33'
// const FIREBASE_MESSAGING_SENDER_ID = 'homestays-fcb33.firebasestorage.app'
// const FIREBASE_PROJECT_ID = '242023743018'
// const FIREBASE_STORAGE_BUCKET = '1:242023743018:web:6ac92d0bb9e5df51be4d53'

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: "AIzaSyC2CrhhDkmucwgpw4LnWXHf9jgKyRcpCkc",
    authDomain: "co-velo.firebaseapp.com",
    projectId: "co-velo",
    storageBucket: "co-velo.appspot.com",
    messagingSenderId: "37346108711",
    appId: "1:37346108711:web:f491a03d5dfd1073ae7502",
    measurementId: "G-2JDTZ2S9CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
initializeFirestore(app, {
    ignoreUndefinedProperties: true, // Avoid errors with undefined values
})

// Initialize Firebase services
const auth = getAuth(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider, storage };
