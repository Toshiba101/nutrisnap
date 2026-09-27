import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../lib/AuthContext";
import { colors } from "../lib/theme";

// 2026-09-27: this used to be a bare spinner that did nothing but wait
// for the root layout's useEffect to call router.replace() and move the
// user off it. On a real device that never happened on a cold start with
// a cached session -- the on-screen readout showed auth fully resolved
// (uid + profile present) and the navigator mounted, yet the route
// stayed at (root) indefinitely. The imperative redirect simply did not
// take effect, and because nothing threw, there was no error to catch.
//
// So the routing decision no longer depends on an effect firing at the
// right moment, or on imperative navigation working from the component
// that renders the navigator. <Redirect> is resolved by the router
// during render: if this screen is on screen at all, the decision has
// already been made and applied.
export default function Index() {
  const { uid, profile, loading } = useAuth();

  if (!loading) {
    if (!uid) return <Redirect href="/(auth)/sign-in" />;
    if (!profile) return <Redirect href="/onboarding/name" />;
    return <Redirect href="/(tabs)/home" />;
  }

  // Auth still resolving. The root layout draws its own "Loading
  // account…" overlay above this, so this is just the backdrop.
  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
