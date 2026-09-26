// Single entry point the rest of the app imports from. Picks the Firebase
// backend when it's configured, otherwise the local on-device fallback —
// see lib/localBackend.ts for why that fallback exists. Nothing outside
// this file (and the two backend implementations) should care which one
// is active.
import { IS_FIREBASE_CONFIGURED } from "./config";
import { firebaseInitError } from "./firebase";
import * as local from "./localBackend";
import * as remote from "./firebaseBackend";

// 2026-09-26: IS_FIREBASE_CONFIGURED only checks that the env vars are
// PRESENT, not that initializeApp/initializeAuth actually succeeded --
// if firebase.ts's own init threw (now caught there instead of crashing
// the app), auth/db are null and the remote backend would throw the
// moment anything touched them. Fall back to the local demo backend in
// that case too, same as "never configured".
const firebaseActuallyReady = IS_FIREBASE_CONFIGURED && !firebaseInitError;
const impl = firebaseActuallyReady ? remote : local;

export const onAuthChange = impl.onAuthChange;
export const signUp = impl.signUp;
export const signIn = impl.signIn;
export const signInWithGoogleIdToken = impl.signInWithGoogleIdToken;
export const getCurrentUser = impl.getCurrentUser;
export const signOutUser = impl.signOutUser;
export const getProfile = impl.getProfile;
export const setProfile = impl.setProfile;
export const listScans = impl.listScans;
export const addScan = impl.addScan;

export const usingLocalDemoMode = !firebaseActuallyReady;
