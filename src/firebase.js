import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcPkL-VTbH59-vMbtIeLHrwbQF789aYes",
  authDomain: "torahpoly.firebaseapp.com",
  projectId: "torahpoly",
  storageBucket: "torahpoly.appspot.com",
  messagingSenderId: "499386067936",
  appId: "1:499386067936:web:0caeff72ca18f7c7729985",
  measurementId: "G-VNG15R6XVB"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
