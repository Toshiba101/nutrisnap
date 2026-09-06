import React from "react";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";

// Root redirect target — RootLayout's effect sends the user to sign-in,
// onboarding, or the home tab before this ever stays on screen for long.
export default function Index() {
  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
