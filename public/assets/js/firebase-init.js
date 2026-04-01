import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxF8P1wbXWbB8Ls6E_xFtQCVROPm9nc4s",
  authDomain: "motocash-app.firebaseapp.com",
  projectId: "motocash-app",
  storageBucket: "motocash-app.firebasestorage.app",
  messagingSenderId: "52026859994",
  appId: "1:52026859994:web:d15ce0292a7a2bd17660e3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  increment,
};
