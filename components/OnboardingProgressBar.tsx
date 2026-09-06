import React from "react";
import { View } from "react-native";

export default function OnboardingProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View className="flex-row gap-1.5 px-6 pt-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`flex-1 h-1.5 rounded-full ${i < step ? "bg-accent" : "bg-line"}`}
        />
      ))}
    </View>
  );
}
