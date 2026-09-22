import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// 2026-09-22, root cause of the app hanging/looping on cold open on every
// real installed build so far, confirmed by reading node_modules directly:
// the "firebase" wrapper package's own exports map for "./auth" has NO
// "react-native" condition (only node/browser/default), so Metro always
// resolved this to the plain browser ESM build -- which does not export
// getReactNativePersistence at all (grepped: 0 occurrences). That import
// silently came back `undefined`, and calling `undefined(AsyncStorage)`
// threw synchronously while this module (lib/firebase.ts) was still being
// evaluated -- before AuthProvider, RootNav, or any spinner ever mounted.
// No amount of fixing AuthContext's loading state could ever have helped,
// since the crash happened before any of that code ran. The underlying
// "@firebase/auth" package (not the "firebase" wrapper) DOES declare a
// proper "react-native" export condition pointing at a real RN build that
// has every one of these functions (confirmed by grepping its dist file),
// so importing directly from "@firebase/auth" instead of "firebase/auth"
// is the fix.
// @ts-ignore — @firebase/auth's RN build has correct runtime exports but
// its own public type defs don't perfectly match this import shape.
import {
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  getReactNativePersistence,
  type User,
} from "@firebase/auth";
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
