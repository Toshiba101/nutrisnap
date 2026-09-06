# NutriSnap

AI-powered plate scanner: photo → identified foods → real USDA nutrition
data → personalized recommendation. React Native + Expo, built as a
portfolio piece demonstrating real auth, a real database, real payments,
and a live AI integration.

## How a scan works

1. **Camera capture** — single photo of the plate (`app/scan/camera.tsx`).
2. **Identification** — the photo is sent to the backend, which calls Groq's
   `meta-llama/llama-4-scout-17b-16e-instruct` vision model to list every
   food item and its estimated proportion of the plate, flagging the
   largest/primary item as the "anchor" (`server/nutrition_server.py
   /identify`).
3. **Anchor confirmation** — the user is asked ONE focused question set
   about the anchor item only: its weight (pre-filled from the model's
   proportion estimate, editable), cooking method, and any added fats/
   sauces (`app/scan/confirm.tsx`). Every other item's weight is scaled
   proportionally from the confirmed anchor weight.
4. **Real nutrition numbers** — the backend looks up each item in the real
   USDA FoodData Central database (never trusts the LLM to invent calorie/
   macro numbers) and applies a small cooking-method fat-absorption model
   on top of the anchor item only (`server/nutrition_server.py /nutrition`
   — see the comments there for the research basis).
5. **Results + recommendation** — calories/protein/carbs/fat/fiber/key
   micronutrients, plus a short rule-based, goal-aware observation (never
   medical-advice-styled) — `lib/recommendation.ts`.

## Running it

### Backend (required for scanning)

```
GROQ_API_KEY=<your key> USDA_API_KEY=<optional, else DEMO_KEY> \
  python3 server/nutrition_server.py
```

DEMO_KEY works with no signup but is a single quota shared by every
unregistered caller of USDA's API worldwide and saturates easily — get a
free personal key in under a minute at https://api.data.gov/signup/ (just
an email address, no approval wait) and pass it as `USDA_API_KEY` for
reliable use.

Set `EXPO_PUBLIC_API_BASE_URL` (see below) to wherever this backend is
reachable from the phone running the app.

### App

```
npm install
npx expo start --tunnel
```

Scan the QR / open the printed `exp://` link in Expo Go.

### Environment variables (all optional — see "Demo mode" below)

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Where the backend above is reachable from the phone (defaults to `http://localhost:8791`, which only works if the phone and backend are on the same machine/network) |
| `EXPO_PUBLIC_FIREBASE_API_KEY` / `_AUTH_DOMAIN` / `_PROJECT_ID` / `_STORAGE_BUCKET` / `_MESSAGING_SENDER_ID` / `_APP_ID` | Real Firebase project config (Firebase Console → Project Settings → your web app) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` / `_IOS_KEY` | RevenueCat project API keys |

## Demo mode (no Firebase / RevenueCat configured)

The app is fully functional with zero external accounts:

- **Auth + database** fall back to an on-device store (`lib/localBackend.ts`)
  implementing the exact same interface as the real Firebase-backed one
  (`lib/firebaseBackend.ts`) — switching later is a config change, not a
  rewrite. Settings shows a "Local demo mode" notice whenever this is active.
- **Payments** fall back to a local unlock flag (`lib/purchases.ts`) so the
  free-tier-cap → paywall → unlocked flow is demoable end-to-end; it becomes
  a real RevenueCat subscription the moment its keys are added.

## Tech stack

Expo Router, NativeWind (Tailwind), React Native Reanimated + SVG (the
dashboard rings and scan-line loading animation), Firebase JS SDK,
`react-native-purchases` (RevenueCat), FastAPI backend (Groq vision + USDA
FoodData Central).

## Known scope cuts (deliberate)

- No Apple App Store / TestFlight submission (no Apple Developer account) —
  distribute via EAS-built APK or Expo Go.
- Single top-down photo per scan, not multi-angle (a 2-photo top+side view
  is a natural v2 improvement for volume estimation accuracy).
