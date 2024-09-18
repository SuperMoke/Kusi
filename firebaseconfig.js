import { getApp,getApps,initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyAPvpcKlN8-vwB2pYE02aTJKlF-fllzcoE",
  authDomain: "kusi-9d847.firebaseapp.com",
  projectId: "kusi-9d847",
  storageBucket: "kusi-9d847.appspot.com",
  messagingSenderId: "116299086298",
  appId: "1:116299086298:web:485114352cc623ac4ba8e3",
  measurementId: "G-TZC08PT7N2"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const storage = getStorage(app);


export{app,db,auth,storage};