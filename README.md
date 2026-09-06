# NutriSnap

AI-powered plate scanner: photo → identified foods → real USDA nutrition
data → personalized recommendation. React Native + Expo, built as a
portfolio piece demonstrating real auth, a real database, real payments,
and a live AI integration.

## How a scan works

1. **Camera capture** — single photo of the plate, or pick one from the
   library (`app/scan/camera.tsx`).
2. **Identification** — the photo is sent to the backend, which calls
   Groq's `qwen/qwen3.6-27b` vision model to list every food item and its
   estimated proportion of the plate, flagging the largest/primary item as
   the "anchor" (`server/nutrition_server.py /identify`).
3. **Anchor confirmation** — the user is asked ONE focused question set
   about the anchor item only: its weight (pre-filled from the model's
   proportion estimate, editable), cooking method, and any added fats/
   sauces (`app/scan/confirm.tsx`). Every other item's weight is scaled
   proportionally from the confirmed anchor weight. Any misidentified item
   can be renamed or removed here before it's sent for nutrition lookup
   ("Fix Results", Cal AI-style).
4. **Real nutrition numbers** — the backend looks up each item in the real
   USDA FoodData Central database (never trusts the LLM to invent calorie/
   macro numbers) and applies a small cooking-method fat-absorption model
   on top of the anchor item only (`server/nutrition_server.py /nutrition`
   — see the comments there for the research basis).
5. **Results + recommendation** — calories/protein/carbs/fat/fiber/key
   micronutrients, plus a short rule-based, goal-aware observation (never
   medical-advice-styled) — `lib/recommendation.ts`.

## What's real (not mocked)

- **Auth**: Firebase Authentication — email/password, and Google Sign-In
  (a real Android OAuth client with its own signing-certificate
  fingerprint registered in Firebase; the browser-based OAuth code+PKCE
  flow this required is documented in `lib/useGoogleSignIn.ts`).
- **Database**: Firestore, with security rules scoping every user to only
  their own profile/scan documents.
- **AI**: Groq vision (food identification) + USDA FoodData Central (real
  nutrient data) live in every scan, no canned responses.
- **Backend**: FastAPI, permanently deployed on Render
  (`server/nutrition_server.py`), not tied to any dev machine.
- **Payments**: RevenueCat, wired for real subscriptions. Currently
  configured with a Test Store key (sandbox — no Google Play Console
  listing exists for this portfolio build), which the app deliberately
  treats as "unconfigured" for the native SDK and falls back to a local
  unlock flag instead — RevenueCat's own SDK hard-crashes a standalone
  build that tries to use a Test Store key for real, so this fallback is
  a safety measure, not a shortcut. Swapping in a production key needs
  zero code changes.

## Tech stack

Expo Router, NativeWind (Tailwind), React Native Reanimated + SVG (the
dashboard rings and scan-line loading animation), Firebase JS SDK,
`react-native-purchases` (RevenueCat), `expo-auth-session` (Google
Sign-In), FastAPI backend (Groq vision + USDA FoodData Central), EAS
Build for Android APKs.

## Running it

### Backend

Already deployed at the URL in `EXPO_PUBLIC_API_BASE_URL` below. To run
your own copy: `server/nutrition_server.py`, needs `GROQ_API_KEY` and
optionally `USDA_API_KEY` (falls back to a shared, rate-limited demo
key — get a free personal one in under a minute at
https://api.data.gov/signup/).

### App

```
npm install
npx expo start --dev-client --tunnel
```

This project uses an EAS **development build** (not Expo Go — Google
Sign-In and RevenueCat need native modules Expo Go can't provide), so a
dev-client APK needs to be installed once (`eas build --profile
development --platform android`) before this connects to it live. After
that, JS-only changes reload on-device automatically; only native/config
changes (`app.json`, adding a native module) need a rebuild.

For a fully standalone build that doesn't depend on a live Metro session:
`eas build --profile preview --platform android`.

### Environment variables

All `EXPO_PUBLIC_*` vars in `.env.example` — Firebase project config,
Google OAuth Android client ID, RevenueCat keys, and the backend URL.
Firebase/Google Sign-In require real console setup (Authentication →
Email/Password + Google providers enabled, Android app registered with
the build's SHA-1 fingerprint, Firestore security rules — see git history
for the exact rules used).

## Known scope cuts (deliberate)

- No Apple App Store / TestFlight submission (no Apple Developer
  account) — distributed as an EAS-built Android APK.
- No real Google Play Console listing, so RevenueCat runs against its
  Test Store rather than real Play Billing (see "What's real" above for
  why that's a safe fallback, not a broken feature).
- Single top-down photo per scan, not multi-angle (a 2-photo top+side
  view is a natural v2 improvement for volume estimation accuracy).
