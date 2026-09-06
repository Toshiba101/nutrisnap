// Real Firebase-backed auth + Firestore database — used automatically once
// EXPO_PUBLIC_FIREBASE_* env vars are set (see lib/config.ts). Mirrors
// lib/localBackend.ts's exact function shape.
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  firebaseSignOut,
} from "./firebase";
import type { UserProfile, ScanRecord } from "./types";

type AuthUser = { uid: string; email: string };
type AuthListener = (user: AuthUser | null) => void;

export function onAuthChange(cb: AuthListener) {
  return onAuthStateChanged(auth!, (u) => {
    cb(u ? { uid: u.uid, email: u.email || "" } : null);
  });
}

function toAuthUser(u: { uid: string; email: string | null }): AuthUser {
  return { uid: u.uid, email: u.email || "" };
}

// Every sign-in/sign-up path returns the resulting user directly, rather
// than the caller relying solely on the onAuthStateChanged listener to
// eventually fire. This was added after a real device (a standalone
// release build, not Expo Go) showed the listener not reliably
// propagating a fresh sign-in — the login screen just sat there with no
// error and no navigation. Returning the user lets AuthContext push state
// immediately as a second, independent path, with the listener kept as a
// backup for e.g. token refresh / other tabs signing out.
export async function signUp(email: string, password: string): Promise<AuthUser> {
  const cred = await createUserWithEmailAndPassword(auth!, email, password);
  return toAuthUser(cred.user);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const cred = await signInWithEmailAndPassword(auth!, email, password);
  return toAuthUser(cred.user);
}

export async function signOutUser() {
  await firebaseSignOut(auth!);
}

export async function signInWithGoogleIdToken(idToken: string): Promise<AuthUser> {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth!, credential);
  return toAuthUser(cred.user);
}

export function getCurrentUser(): AuthUser | null {
  return auth?.currentUser ? toAuthUser(auth.currentUser) : null;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db!, "profiles", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(db!, "profiles", uid), profile);
}

export async function listScans(uid: string): Promise<ScanRecord[]> {
  const q = query(collection(db!, "profiles", uid, "scans"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ScanRecord);
}

export async function addScan(uid: string, scan: ScanRecord) {
  await addDoc(collection(db!, "profiles", uid, "scans"), scan);
}
