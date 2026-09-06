import "../global.css";
import React, { useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../lib/AuthContext";
import { ScanFlowProvider } from "../lib/ScanFlowContext";
import { colors } from "../lib/theme";

function RootNav() {
  const { uid, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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
  );
}
