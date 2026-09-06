import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
// @ts-ignore — getReactNativePersistence ships in the RN build of firebase/auth
// (Metro resolves it correctly) but is missing from the public web type defs.
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_CONFIG, IS_FIREBASE_CONFIGURED } from "./config";

let app: FirebaseApp | null = null;
let auth: ReturnType<typeof initializeAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (IS_FIREBASE_CONFIGURED) {
  app = getApps().length ? getApps()[0]! : initializeApp(FIREBASE_CONFIG);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
}

export { auth, db };
export type { User };
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  firebaseSignOut,
};
