import "../global.css";
import React, { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, StatusBar } from "react-native";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { ScanFlowProvider } from "../lib/ScanFlowContext";
import { colors } from "../lib/theme";

// 2026-09-26: added after a real build STILL hung on cold open even after
// the getReactNativePersistence fix was verified correct against a real
// Metro bundle -- meaning something else is now the cause, and guessing
// again without evidence isn't useful. This catches any render-time (or
// effect-time, which React routes through the same path) exception
// anywhere below it and shows the actual message/stack on screen instead
// of leaving a blank or frozen UI, so the NEXT report is diagnosable.
class DiagnosticErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("DiagnosticErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: "#3a0d0d" }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            NutriSnap crashed on startup
          </Text>
          <Text style={{ color: "#ffd6d6", fontSize: 14, marginBottom: 16 }} selectable>
            {this.state.error.message}
          </Text>
          <Text style={{ color: "#ffb3b3", fontSize: 11, fontFamily: "monospace" }} selectable>
            {this.state.error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function RootNav() {
  const { uid, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // 2026-09-27: undefined until the root navigator has actually mounted.
  // See the redirect effect below for why this matters.
  const navState = useRootNavigationState();
  const navReady = !!navState?.key;

  useEffect(() => {
    if (loading) return;
    // 2026-09-27 — THE cold-start hang, finally root-caused. A
    // router.replace() issued before the root navigator has mounted is
    // silently dropped: no error, no throw, nothing for the error
    // boundary to catch. Because this effect's only other deps are
    // uid/profile/loading/segments — none of which change again once
    // auth has settled — it never retried, so the app sat on
    // app/index.tsx's bare placeholder spinner forever.
    //
    // That is exactly the spinner in the bug reports (green on near
    // black, NO "Loading account…" text — that text only exists on the
    // loading branch below, which had already been passed).
    //
    // It also explains why "clear cache and data" was the only thing
    // that ever fixed it: with a cached Firebase credential in
    // AsyncStorage the auth listener resolves almost immediately on cold
    // open, so this effect fired BEFORE the navigator was ready and the
    // redirect was thrown away. With app data cleared there is no cached
    // credential, auth resolves later, the navigator is mounted by then,
    // and the redirect lands — the app "works", but only by luck of
    // timing. Gating on navReady (and depending on it, so this re-runs
    // the moment it flips) removes the race in both directions.
    // Deliberately NOT `if (!navReady) return`. Blocking on it is how the
    // previous attempt turned an intermittent hang into a permanent one:
    // when the navigator wasn't mounted, navReady never flipped, so the
    // redirect never ran at all. Now that the Stack is always mounted the
    // original race is gone, so just attempt the navigation -- navReady
    // stays in the dep list purely so this retries if it does change.
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";
    // 2026-09-27 — THE actual cold-start hang, found from an on-device
    // state readout showing `load:N nav:Y uid:Y prof:Y at:(root)`.
    //
    // app/index.tsx is only a placeholder spinner that expects this
    // effect to redirect away from it immediately. The signed-out and
    // no-profile branches below say "redirect unless you're already
    // where you belong", so they both fire correctly from root. The
    // signed-in branch instead used an allowlist of origins -- auth or
    // onboarding -- and root was simply not in it. So a user who is
    // signed in AND has a profile, landing on root (i.e. every single
    // cold start with a cached session), matched no branch at all and
    // sat on the placeholder spinner forever.
    //
    // That is also exactly why clearing app data "fixed" it: it wipes
    // the cached credential, so uid is null, so the signed-out branch
    // fires and the app moves. Sign in again and the next cold start
    // hangs again.
    // Cast because expo-router's generated Segments type only enumerates
    // the known route groups and never models the empty (root) case --
    // but root is genuinely reachable at runtime, which is the entire
    // bug being fixed here: the on-device readout printed `at:(root)`,
    // which it only prints when segments is [].
    const atRoot = (segments as string[]).length === 0;

    if (!uid && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (uid && !profile && !inOnboarding) {
      router.replace("/onboarding/name");
    } else if (uid && profile && (inAuthGroup || inOnboarding || atRoot)) {
      // `atRoot` is the fix. Kept as an explicit origin list rather than
      // a blanket "not in tabs" so that scan/ and paywall/ -- which are
      // legitimate top-level destinations -- are never yanked to home.
      router.replace("/(tabs)/home");
    }
  }, [uid, profile, loading, segments, navReady]);

  // 2026-09-27: the navigator is now ALWAYS rendered. It used to be
  // swapped out for a plain <View> spinner whenever `loading` was true,
  // which is an expo-router anti-pattern: the root layout must always
  // render a navigator. While it wasn't rendered the root navigator was
  // never mounted, so useRootNavigationState() stayed undefined and the
  // redirect below could never run -- and there was no reliable signal
  // to re-run it once the navigator did appear. Mounting the Stack
  // unconditionally and drawing the loading state as an overlay on top
  // means the navigator is ready from the first frame, so the redirect
  // fires as soon as auth settles regardless of which resolves first.
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
      </Stack>

      {loading ? (
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: colors.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : null}

    </View>
  );
}

export default function RootLayout() {
  return (
    <DiagnosticErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
          <AuthProvider>
            <ScanFlowProvider>
              <RootNav />
            </ScanFlowProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </DiagnosticErrorBoundary>
  );
}
