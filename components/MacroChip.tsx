import React from "react";
import { View, Text } from "react-native";

interface MacroChipProps {
  label: string;
  value: string;
  color: string;
  emoji: string;
}

export default function MacroChip({ label, value, color, emoji }: MacroChipProps) {
  return (
    <View className="flex-row items-center">
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-1.5"
        style={{ backgroundColor: `${color}33` }}
      >
        <Text style={{ fontSize: 11 }}>{emoji}</Text>
      </View>
      <Text className="text-text text-sm font-medium">{value}</Text>
      {label ? <Text className="text-muted text-xs ml-1">{label}</Text> : null}
    </View>
  );
}
