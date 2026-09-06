// Single entry point the rest of the app imports from. Picks the Firebase
// backend when it's configured, otherwise the local on-device fallback —
// see lib/localBackend.ts for why that fallback exists. Nothing outside
// this file (and the two backend implementations) should care which one
// is active.
import { IS_FIREBASE_CONFIGURED } from "./config";
import * as local from "./localBackend";
import * as remote from "./firebaseBackend";

const impl = IS_FIREBASE_CONFIGURED ? remote : local;

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

export const usingLocalDemoMode = !IS_FIREBASE_CONFIGURED;
