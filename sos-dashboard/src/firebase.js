import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1QRQMRzDCi-mT99P6U3QCFYLhGT6354A",
  authDomain: "sos-alert-system-97c84.firebaseapp.com",
  projectId: "sos-alert-system-97c84",
  storageBucket: "sos-alert-system-97c84.firebasestorage.app",
  messagingSenderId: "931719497630",
  appId: "1:931719497630:web:95b9fcc81c1373947ff88f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);