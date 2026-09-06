import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScanFlow } from "../../lib/ScanFlowContext";
import { calculateNutrition } from "../../lib/nutritionApi";
import { generateRecommendation } from "../../lib/recommendation";
import { useAuth } from "../../lib/AuthContext";
import PillButton from "../../components/PillButton";
import OptionCard from "../../components/OptionCard";
import type { CookingMethod, AddedFat } from "../../lib/theme";

// A typical dinner-plate portion, used only to turn the vision model's
// RELATIVE proportions into a sensible starting gram estimate for the
// anchor item — the user then adjusts it, per the spec (pre-filled
// estimate they can override), rather than us ever asserting an exact
// weight from a photo alone.
const ASSUMED_PLATE_GRAMS = 450;

const COOKING_METHODS: { value: CookingMethod; label: string }[] = [
  { value: "grilled", label: "Grilled" },
  { value: "baked", label: "Baked" },
  { value: "steamed", label: "Steamed" },
  { value: "boiled", label: "Boiled" },
  { value: "fried", label: "Fried" },
  { value: "deep_fried", label: "Deep-fried" },
  { value: "raw", label: "Raw" },
  { value: "other", label: "Other" },
];

const ADDED_FATS: { value: AddedFat; label: string }[] = [
  { value: "none", label: "None" },
  { value: "olive_oil", label: "Olive oil" },
  { value: "plant_based_oil", label: "Plant-based oil" },
  { value: "ghee", label: "Ghee" },
  { value: "butter", label: "Butter" },
  { value: "sauce_dressing", label: "Sauce / dressing" },
  { value: "other", label: "Other" },
];

export default function ScanConfirm() {
  const router = useRouter();
  const { identifiedItems, setIdentifiedItems, setAnchorAnswers, setResult } = useScanFlow();
  const { profile } = useAuth();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const anchor = identifiedItems.find((i) => i.isAnchor) ?? identifiedItems[0];
  const defaultGrams = Math.max(Math.round((anchor?.proportion ?? 0.5) * ASSUMED_PLATE_GRAMS), 30);

  const [grams, setGrams] = useState(String(defaultGrams));
  const [method, setMethod] = useState<CookingMethod>("grilled");
  const [fat, setFat] = useState<AddedFat>("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync the pre-filled weight estimate if removing an item promotes a
  // different one to anchor (its proportion — and therefore the sensible
  // starting gram estimate — is different from the original anchor's).
  useEffect(() => {
    setGrams(String(defaultGrams));
  }, [anchor?.name, anchor?.isAnchor]);

  const gramsNum = parseFloat(grams) || 0;

  // "Fix Results" — Cal AI-style correction step (Phase 0 research): the
  // vision model's guess isn't always right, so the user can rename or
  // drop a misidentified item here, before it's ever sent to USDA for
  // real nutrition numbers.
  function startEdit(index: number) {
    setEditingIndex(index);
    setEditingText(identifiedItems[index].name);
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const trimmed = editingText.trim();
    if (trimmed) {
      const next = identifiedItems.map((item, i) =>
        i === editingIndex ? { ...item, name: trimmed } : item
      );
      setIdentifiedItems(next);
    }
    setEditingIndex(null);
  }

  function removeItem(index: number) {
    if (identifiedItems.length <= 1) return;
    const removed = identifiedItems[index];
    let next = identifiedItems.filter((_, i) => i !== index);
    if (removed.isAnchor) {
      // Promote whichever remaining item looked biggest in the photo.
      const biggest = next.reduce((a, b) => (b.proportion > a.proportion ? b : a));
      next = next.map((item) => ({ ...item, isAnchor: item === biggest }));
    }
    setIdentifiedItems(next);
    if (editingIndex === index) setEditingIndex(null);
  }

  const scaledItems = useMemo(() => {
    if (!anchor || gramsNum <= 0) return [];
    return identifiedItems.map((item) => ({
      name: item.name,
      isAnchor: item.name === anchor.name && item.isAnchor,
      grams:
        item.name === anchor.name
          ? gramsNum
          : Math.round((item.proportion / anchor.proportion) * gramsNum),
    }));
  }, [identifiedItems, anchor, gramsNum]);

  async function handleSubmit() {
    if (!anchor || gramsNum <= 0) return;
    setLoading(true);
    setError(null);
    try {
      setAnchorAnswers(gramsNum, method, fat);
      const calcResult = await calculateNutrition(scaledItems, method, fat);
      const recommendation = generateRecommendation(calcResult.totals, profile?.goal ?? "maintain");
      setResult(calcResult, recommendation);
      router.replace("/scan/results");
    } catch (e: any) {
      setError(e?.message ?? "Could not calculate nutrition for this meal.");
    } finally {
      setLoading(false);
    }
  }

  if (!anchor) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-text text-center">No food was identified in that photo.</Text>
        <PillButton label="Try Again" onPress={() => router.replace("/scan/camera")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-text text-2xl font-bold mb-1">Confirm your meal</Text>
        <Text className="text-muted text-sm mb-6">
          We detected {identifiedItems.length} item{identifiedItems.length !== 1 ? "s" : ""} — tell us
          about the main item ({anchor.name}) and we'll scale the rest automatically.
        </Text>

        <View className="bg-surface rounded-2xl p-4 mb-2">
          {identifiedItems.map((item, index) =>
            editingIndex === index ? (
              <View key={item.name + index} className="flex-row items-center py-1.5">
                <TextInput
                  value={editingText}
                  onChangeText={setEditingText}
                  autoFocus
                  onSubmitEditing={commitEdit}
                  className="flex-1 bg-surface2 text-text rounded-lg px-3 py-2 mr-2"
                />
                <Pressable onPress={commitEdit} className="px-2">
                  <Text className="text-accent font-bold">✓</Text>
                </Pressable>
              </View>
            ) : (
              <View key={item.name + index} className="flex-row justify-between items-center py-1.5">
                <Pressable onPress={() => startEdit(index)} className="flex-1 flex-row items-center mr-2">
                  <Text className={item.isAnchor ? "text-accent font-semibold" : "text-text"} numberOfLines={1}>
                    {item.isAnchor ? "⭐ " : ""}
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Text>
                  <Text className="text-muted text-xs ml-2">✏️</Text>
                </Pressable>
                <Text className="text-muted mr-3">{Math.round(item.proportion * 100)}%</Text>
                {identifiedItems.length > 1 && (
                  <Pressable onPress={() => removeItem(index)}>
                    <Text className="text-danger">✕</Text>
                  </Pressable>
                )}
              </View>
            )
          )}
        </View>
        <Text className="text-muted text-xs mb-6">
          Tap an item to fix its name, or ✕ to remove something that isn't really on your plate.
        </Text>

        <Text className="text-text font-semibold mb-2">
          How much {anchor.name} is this? (grams)
        </Text>
        <TextInput
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          className="bg-surface text-text rounded-2xl px-4 py-4 mb-6 text-lg"
        />

        <Text className="text-text font-semibold mb-3">Cooking method</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {COOKING_METHODS.map((m) => (
            <Pressable
              key={m.value}
              onPress={() => setMethod(m.value)}
              className={`px-4 py-2 rounded-full ${method === m.value ? "bg-accent" : "bg-surface"}`}
            >
              <Text className={method === m.value ? "text-bg font-semibold" : "text-text"}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-text font-semibold mb-3">Added fats / sauces</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {ADDED_FATS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFat(f.value)}
              className={`px-4 py-2 rounded-full ${fat === f.value ? "bg-accent" : "bg-surface"}`}
            >
              <Text className={fat === f.value ? "text-bg font-semibold" : "text-text"}>{f.label}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text className="text-danger text-sm mb-4">{error}</Text> : null}

        <PillButton label="Calculate Nutrition" loading={loading} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
