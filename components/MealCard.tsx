import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { colors } from "../lib/theme";
import MacroChip from "./MacroChip";
import type { ScanRecord } from "../lib/types";

function timeAgo(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function MealCard({ scan, onPress }: { scan: ScanRecord; onPress?: () => void }) {
  const title = scan.items.find((i) => i.isAnchor)?.name ?? scan.items[0]?.name ?? "Meal";
  return (
    <Pressable
      onPress={onPress}
      className="flex-row bg-surface rounded-2xl p-3 mb-3 items-center"
    >
      <Image source={{ uri: scan.photoUri }} className="w-16 h-16 rounded-xl mr-3" />
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="text-text font-semibold text-base flex-1 mr-2" numberOfLines={1}>
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </Text>
          <Text className="text-muted text-xs">{timeAgo(scan.createdAt)}</Text>
        </View>
        <Text className="text-muted text-xs mb-1.5">🔥 {Math.round(scan.totals.calories)} kcal</Text>
        <View className="flex-row gap-3">
          <MacroChip label="" value={`${Math.round(scan.totals.protein_g)}g`} color={colors.protein} emoji="🥩" />
          <MacroChip label="" value={`${Math.round(scan.totals.carbs_g)}g`} color={colors.carbs} emoji="🌾" />
          <MacroChip label="" value={`${Math.round(scan.totals.fat_g)}g`} color={colors.fat} emoji="💧" />
        </View>
      </View>
    </Pressable>
  );
}
