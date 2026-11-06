import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhqGTgpXIvIoDKJFGNSGXcUvVdT2Au9xY",
  authDomain: "ayamcajo-27f70.firebaseapp.com",
  projectId: "ayamcajo-27f70",
  storageBucket: "ayamcajo-27f70.firebasestorage.app",
  messagingSenderId: "212420012385",
  appId: "1:212420012385:web:bdb9b4d0648e2bb469fd20"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);