import React from "react";
import { Pressable, Text, View } from "react-native";

interface OptionCardProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

// Cal AI-style onboarding option: unselected = flat surface card,
// selected = solid accent fill (not just a border/checkmark) — see Phase 0
// research on what reads as "premium" onboarding.
export default function OptionCard({ label, subtitle, selected, onPress, icon }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full flex-row items-center rounded-2xl px-5 py-4 mb-3 ${
        selected ? "bg-accent" : "bg-surface"
      }`}
    >
      {icon && <View className="mr-3">{icon}</View>}
      <View className="flex-1">
        <Text className={`text-base font-semibold ${selected ? "text-bg" : "text-text"}`}>
          {label}
        </Text>
        {subtitle ? (
          <Text className={`text-sm mt-0.5 ${selected ? "text-bg/70" : "text-muted"}`}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
