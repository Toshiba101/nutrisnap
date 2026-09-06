import React, { useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScanFlow } from "../../lib/ScanFlowContext";
import { useAuth } from "../../lib/AuthContext";
import { colors } from "../../lib/theme";
import PillButton from "../../components/PillButton";
import MacroChip from "../../components/MacroChip";

function NutrientRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-line">
      <Text className="text-muted">{label}</Text>
      <Text className="text-text font-medium">
        {Math.round(value * 10) / 10}
        {unit}
      </Text>
    </View>
  );
}

export default function ScanResults() {
  const router = useRouter();
  const { photoUri, result, recommendation, cookingMethod, addedFat, reset } = useScanFlow();
  const { saveScan } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!result) {
    router.replace("/(tabs)/home");
    return null;
  }

  const { totals, items } = result;

  async function handleDone() {
    setSaving(true);
    try {
      await saveScan({
        id: `${Date.now()}`,
        createdAt: Date.now(),
        photoUri: photoUri ?? "",
        cookingMethod: cookingMethod ?? "other",
        addedFat: addedFat ?? "none",
        items,
        totals,
        recommendation: recommendation ?? "",
      });
      reset();
      router.replace("/(tabs)/home");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row items-center mb-5">
          {photoUri && <Image source={{ uri: photoUri }} className="w-16 h-16 rounded-2xl mr-4" />}
          <View className="flex-1">
            <Text className="text-text text-xl font-bold">{Math.round(totals.calories)} kcal</Text>
            <Text className="text-muted text-sm">
              {items.map((i) => i.name).join(", ")}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between bg-surface rounded-2xl p-4 mb-5">
          <MacroChip label="Protein" value={`${Math.round(totals.protein_g)}g`} color={colors.protein} emoji="🥩" />
          <MacroChip label="Carbs" value={`${Math.round(totals.carbs_g)}g`} color={colors.carbs} emoji="🌾" />
          <MacroChip label="Fat" value={`${Math.round(totals.fat_g)}g`} color={colors.fat} emoji="💧" />
        </View>

        {recommendation ? (
          <View className="bg-accentDim/25 rounded-2xl p-4 mb-5">
            <Text className="font-semibold mb-1" style={{ color: colors.accent }}>💡 Insight</Text>
            <Text className="text-text text-sm leading-5">{recommendation}</Text>
          </View>
        ) : null}

        <Text className="text-text font-bold text-lg mb-2">Detected items</Text>
        <View className="bg-surface rounded-2xl p-4 mb-5">
          {items.map((item) => (
            <View key={item.name} className="flex-row justify-between py-1.5">
              <Text className="text-text">
                {item.isAnchor ? "⭐ " : ""}
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)} ({item.grams}g)
              </Text>
              <Text className="text-muted">{Math.round(item.nutrition.calories)} kcal</Text>
            </View>
          ))}
        </View>

        <Text className="text-text font-bold text-lg mb-2">Full breakdown</Text>
        <View className="bg-surface rounded-2xl px-4 mb-6">
          <NutrientRow label="Fiber" value={totals.fiber_g} unit="g" />
          <NutrientRow label="Sodium" value={totals.sodium_mg} unit="mg" />
          <NutrientRow label="Potassium" value={totals.potassium_mg} unit="mg" />
          <NutrientRow label="Calcium" value={totals.calcium_mg} unit="mg" />
          <NutrientRow label="Iron" value={totals.iron_mg} unit="mg" />
          <NutrientRow label="Vitamin C" value={totals.vitamin_c_mg} unit="mg" />
        </View>

        <PillButton label="Save Meal" onPress={handleDone} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}
