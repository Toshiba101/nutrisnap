import "../global.css";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StatusBar } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
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
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!uid && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (uid && !profile && !inOnboarding) {
      router.replace("/onboarding/name");
    } else if (uid && profile && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)/home");
    }
  }, [uid, profile, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color={colors.accent} size="large" />
        {/* Visible status so a stuck screen is diagnosable instead of a
            silent spinner -- if this counts past ~10s the failsafe timer
            in AuthContext should have already fired, so seeing this text
            keep climbing well past that is itself useful evidence. */}
        <Text style={{ color: colors.muted, marginTop: 16, fontSize: 12 }}>
          Loading account… ({elapsed}s)
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
    </Stack>
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
