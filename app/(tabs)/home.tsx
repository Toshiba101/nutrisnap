import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/AuthContext";
import { colors, goalLabels } from "../../lib/theme";
import { computeDailyTargets } from "../../lib/goals";
import { computeStreak } from "../../lib/streak";
import Ring from "../../components/Ring";
import MealCard from "../../components/MealCard";

function isToday(ts: number) {
  const d = new Date(ts);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export default function Home() {
  const router = useRouter();
  const { profile, scans } = useAuth();

  const todayScans = useMemo(() => scans.filter((s) => isToday(s.createdAt)), [scans]);
  const streak = useMemo(() => computeStreak(scans.map((s) => s.createdAt)), [scans]);
  const targets = useMemo(
    () => (profile ? computeDailyTargets(profile) : { calories: 2000, protein_g: 120, carbs_g: 200, fat_g: 60 }),
    [profile]
  );

  const consumed = todayScans.reduce(
    (acc, s) => ({
      calories: acc.calories + s.totals.calories,
      protein_g: acc.protein_g + s.totals.protein_g,
      carbs_g: acc.carbs_g + s.totals.carbs_g,
      fat_g: acc.fat_g + s.totals.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const caloriesLeft = Math.max(Math.round(targets.calories - consumed.calories), 0);

  const macroRing = (label: string, consumedVal: number, target: number, color: string, emoji: string) => (
    <View className="flex-1 bg-surface rounded-2xl py-4 items-center">
      <Ring size={64} strokeWidth={7} progress={consumedVal / target} color={color} trackColor={colors.line}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </Ring>
      <Text className="text-text font-bold mt-2">{Math.max(Math.round(target - consumedVal), 0)}g</Text>
      <Text className="text-muted text-xs">{label} left</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-muted text-sm">Welcome back,</Text>
            <Text className="text-text text-2xl font-bold">{profile?.name ?? "there"} 👋</Text>
          </View>
          <View className="bg-surface rounded-full px-3 py-2 flex-row items-center">
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text className="text-text font-bold ml-1">{streak}</Text>
          </View>
        </View>

        {profile ? (
          <View className="bg-accentDim/20 rounded-full self-start px-3 py-1 mb-4">
            <Text className="text-xs font-semibold" style={{ color: colors.accent }}>{goalLabels[profile.goal]}</Text>
          </View>
        ) : null}

        <View className="bg-surface rounded-3xl p-6 flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-text text-4xl font-bold">{caloriesLeft}</Text>
            <Text className="text-muted text-sm mt-1">Calories left</Text>
          </View>
          <Ring
            size={110}
            strokeWidth={11}
            progress={consumed.calories / targets.calories}
            color={colors.accent}
            trackColor={colors.line}
          >
            <Text style={{ fontSize: 22 }}>🔥</Text>
          </Ring>
        </View>

        <View className="flex-row gap-3 mb-6">
          {macroRing("Protein", consumed.protein_g, targets.protein_g, colors.protein, "🥩")}
          {macroRing("Carbs", consumed.carbs_g, targets.carbs_g, colors.carbs, "🌾")}
          {macroRing("Fat", consumed.fat_g, targets.fat_g, colors.fat, "💧")}
        </View>

        <Text className="text-text text-lg font-bold mb-3">Today's meals</Text>
        {todayScans.length === 0 ? (
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Text className="text-muted text-center">
              No meals scanned yet today. Tap the button below to scan your first plate.
            </Text>
          </View>
        ) : (
          todayScans.map((s) => <MealCard key={s.id} scan={s} />)
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/scan/camera")}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-accent items-center justify-center"
        style={{ shadowColor: colors.accent, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}
      >
        <Text style={{ fontSize: 28, color: colors.bg }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
