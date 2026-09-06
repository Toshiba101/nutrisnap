// Central place for every environment-dependent value. Nothing secret lives
// here or in EXPO_PUBLIC_* vars — those get compiled into the JS bundle and
// are effectively public. The Groq/USDA keys stay server-side inside
// server/nutrition_server.py; the app only ever talks to that server.
import Constants from "expo-constants";

function extra(key: string): string | undefined {
  return (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[key];
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || extra("apiBaseUrl") || "http://localhost:8791";

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const IS_FIREBASE_CONFIGURED = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId
);

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const IS_GOOGLE_SIGN_IN_CONFIGURED = Boolean(GOOGLE_WEB_CLIENT_ID);

export const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
export const IS_REVENUECAT_CONFIGURED = Boolean(
  REVENUECAT_API_KEY_ANDROID || REVENUECAT_API_KEY_IOS
);

export const FREE_TIER_DAILY_SCANS = 3;
export const ENTITLEMENT_ID = "unlimited";
