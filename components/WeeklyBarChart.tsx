import React from "react";
import { View, Text } from "react-native";
import { colors } from "../lib/theme";

interface DayTotal {
  label: string;
  calories: number;
}

// Lightweight bar chart built from plain Views — no charting library needed
// for a simple 7-bar trend, and it keeps full control over the dark theme.
export default function WeeklyBarChart({ days, target }: { days: DayTotal[]; target: number }) {
  const max = Math.max(target, ...days.map((d) => d.calories), 1);
  return (
    <View className="bg-surface rounded-2xl p-5">
      <View className="flex-row items-end justify-between" style={{ height: 120 }}>
        {days.map((d, i) => {
          const heightPct = Math.min(d.calories / max, 1);
          const over = d.calories > target;
          return (
            <View key={i} className="items-center flex-1">
              <View
                style={{
                  width: 18,
                  height: Math.max(heightPct * 100, 3),
                  borderRadius: 9,
                  backgroundColor: over ? colors.danger : d.calories > 0 ? colors.accent : colors.line,
                }}
              />
              <Text className="text-muted text-[10px] mt-2">{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
