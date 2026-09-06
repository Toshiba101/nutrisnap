// Fallback auth+database used automatically when no Firebase project has
// been configured yet (see lib/config.ts / IS_FIREBASE_CONFIGURED). It
// implements the exact same shape as the Firebase-backed store in
// lib/firebaseBackend.ts, so the rest of the app never has to know which
// one is active — and switching to real Firebase later is a config change,
// not a rewrite. Everything here lives in AsyncStorage, on-device only.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile, ScanRecord } from "./types";

type AuthUser = { uid: string; email: string };
type AuthListener = (user: AuthUser | null) => void;

const KEYS = {
  session: "nutrisnap_local_session",
  usersIndex: "nutrisnap_local_users",
  profile: (uid: string) => `nutrisnap_local_profile_${uid}`,
  scans: (uid: string) => `nutrisnap_local_scans_${uid}`,
};

let listeners: AuthListener[] = [];
let currentUser: AuthUser | null = null;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}
async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function notify() {
  listeners.forEach((l) => l(currentUser));
}

// Restore any existing local session on module load.
(async () => {
  const session = await readJSON<AuthUser | null>(KEYS.session, null);
  if (session) {
    currentUser = session;
    notify();
  }
})();

export function onAuthChange(cb: AuthListener) {
  listeners.push(cb);
  cb(currentUser);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function uidFromEmail(email: string) {
  return `local_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

export async function signUp(email: string, password: string) {
  const users = await readJSON<Record<string, string>>(KEYS.usersIndex, {});
  const key = email.trim().toLowerCase();
  if (users[key]) throw new Error("An account with this email already exists.");
  users[key] = password; // demo-mode only store — never do this with real Firebase
  await writeJSON(KEYS.usersIndex, users);
  currentUser = { uid: uidFromEmail(email), email: key };
  await writeJSON(KEYS.session, currentUser);
  notify();
}

export async function signIn(email: string, password: string) {
  const users = await readJSON<Record<string, string>>(KEYS.usersIndex, {});
  const key = email.trim().toLowerCase();
  if (users[key] !== password) throw new Error("Incorrect email or password.");
  currentUser = { uid: uidFromEmail(email), email: key };
  await writeJSON(KEYS.session, currentUser);
  notify();
}

export async function signInWithGoogleIdToken(_idToken: string): Promise<never> {
  throw new Error("Google sign-in needs a real Firebase project — set EXPO_PUBLIC_FIREBASE_* first.");
}

export async function signOutUser() {
  currentUser = null;
  await AsyncStorage.removeItem(KEYS.session);
  notify();
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  return readJSON<UserProfile | null>(KEYS.profile(uid), null);
}

export async function setProfile(uid: string, profile: UserProfile) {
  await writeJSON(KEYS.profile(uid), profile);
}

export async function listScans(uid: string): Promise<ScanRecord[]> {
  const scans = await readJSON<ScanRecord[]>(KEYS.scans(uid), []);
  return scans.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addScan(uid: string, scan: ScanRecord) {
  const scans = await readJSON<ScanRecord[]>(KEYS.scans(uid), []);
  scans.push(scan);
  await writeJSON(KEYS.scans(uid), scans);
}
