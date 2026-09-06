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

// Google rejects the OAuth flow outright ("doesn't comply with Google's
// OAuth 2.0 policy... Error 400: invalid_request") when a Web-type client
// ID is used from what it detects as a native app context — confirmed
// live. An Android-type client (package name + signing certificate
// fingerprint registered in Firebase) is what Google actually expects for
// this exact browser-based sign-in flow from a real Android app.
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const IS_GOOGLE_SIGN_IN_CONFIGURED = Boolean(GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID);

export const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
export const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

// RevenueCat's native SDK deliberately crashes any standalone/release build
// configured with a Test Store key ("Wrong API Key... The app will close
// now to protect the security of test purchases" — confirmed live on a
// real installed APK). It never showed up in Expo Go because the native
// module doesn't run there at all (react-native-purchases auto-mocks in
// Expo Go instead). So a test_ key must never reach Purchases.configure()
// in a real build — until a real production key exists (needs a Google
// Play Console app), the paywall stays in local-unlock demo mode.
const rawAndroidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const rawIosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const isTestKey = (k?: string) => Boolean(k && k.startsWith("test_"));

export const IS_REVENUECAT_CONFIGURED = Boolean(
  (rawAndroidKey && !isTestKey(rawAndroidKey)) || (rawIosKey && !isTestKey(rawIosKey))
);

export const FREE_TIER_DAILY_SCANS = 3;
export const ENTITLEMENT_ID = "unlimited";
