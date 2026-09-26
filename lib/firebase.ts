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
// 2026-09-26: this whole block used to run unguarded at module-eval time --
// exactly the shape of bug that already bricked cold-open once before
// (getReactNativePersistence resolving to undefined and being called
// directly). That specific cause is fixed now (verified against a real
// Metro bundle, not just Node), but ANY future exception here — a bad
// env var, a Firebase SDK version mismatch, anything — would silently
// crash the whole app the same way, before any error boundary or loading
// screen ever mounts. Wrapping it means the app falls through to
// IS_FIREBASE_CONFIGURED-style "unconfigured" behavior instead of a
// blank frozen screen, and the actual error is at least logged.
export let firebaseInitError: string | null = null;
if (IS_FIREBASE_CONFIGURED) {
  try {
    app = getApps().length ? getApps()[0]! : initializeApp(FIREBASE_CONFIG);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } catch (e: any) {
    firebaseInitError = `Firebase init failed: ${e?.message || String(e)}`;
    console.error(firebaseInitError, e);
    app = null;
    auth = null;
    db = null;
  }
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
