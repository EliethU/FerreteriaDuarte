// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnVpSmOJlZM5w0qEjUs7vOhfpoRu2hu5o",
  authDomain: "ferreteriaduarte-afcca.firebaseapp.com",
  projectId: "ferreteriaduarte-afcca",
  storageBucket: "ferreteriaduarte-afcca.firebasestorage.app",
  messagingSenderId: "857829337329",
  appId: "1:857829337329:web:d0eb4f40a710d1f8412150",
  measurementId: "G-G21VYYZZM7"
};

// Initialize Firebase
const appfirebase = initializeApp(firebaseConfig);

let db;
try {
  db = initializeFirestore(appfirebase, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100 * 1024 * 1024, // 100 MB (opcional, para limitar tamaño)
    }),
  });
  console.log("Firestore inicializado con persistencia offline.");
} catch (error) {
  console.error("Error al inicializar Firestore con persistencia:", error);
  // Fallback: inicializar sin persistencia si falla
  db = initializeFirestore(appfirebase, {});
}

const auth = getAuth(appfirebase);


export { appfirebase, db, auth };