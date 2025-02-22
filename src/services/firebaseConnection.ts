import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcLxix75NQlLiKeGH8lbdF1qFFrnhqWuo",
  authDomain: "tarefasplus-2ed66.firebaseapp.com",
  projectId: "tarefasplus-2ed66",
  storageBucket: "tarefasplus-2ed66.firebasestorage.app",
  messagingSenderId: "1024022542846",
  appId: "1:1024022542846:web:155586c0d67ca84e7f68af"
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseapp);

export { db };
