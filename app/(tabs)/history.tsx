import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { computeDailyTargets } from "../../lib/goals";
import { computeStreak } from "../../lib/streak";
import WeeklyBarChart from "../../components/WeeklyBarChart";
import MealCard from "../../components/MealCard";
import { isUnlocked } from "../../lib/purchases";
import { colors } from "../../lib/theme";
import { useEffect, useState } from "react";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function History() {
  const router = useRouter();
  const { profile, scans } = useAuth();
  const [unlocked, setUnlocked] = useState(true);

  useEffect(() => {
    isUnlocked().then(setUnlocked);
  }, [scans.length]);

  const targets = profile ? computeDailyTargets(profile) : { calories: 2000 };
  const streak = computeStreak(scans.map((s) => s.createdAt));

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayTotal = scans
        .filter((s) => {
          const sd = new Date(s.createdAt);
          return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate();
        })
        .reduce((sum, s) => sum + s.totals.calories, 0);
      days.push({ label: DAY_LABELS[d.getDay()], calories: Math.round(dayTotal) });
    }
    return days;
  }, [scans]);

  const avgCalories = Math.round(
    last7Days.reduce((sum, d) => sum + d.calories, 0) / (last7Days.filter((d) => d.calories > 0).length || 1)
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-text text-2xl font-bold mb-1">Your Trends</Text>
        <Text className="text-muted text-sm mb-6">Last 7 days vs. your {targets.calories} kcal target</Text>

        <WeeklyBarChart days={last7Days} target={targets.calories} />

        <View className="flex-row gap-3 mt-4 mb-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
            <Text className="text-text text-xl font-bold">{streak}</Text>
            <Text className="text-muted text-xs mt-1">Day streak 🔥</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
            <Text className="text-text text-xl font-bold">{avgCalories || 0}</Text>
            <Text className="text-muted text-xs mt-1">Avg kcal/day</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
            <Text className="text-text text-xl font-bold">{scans.length}</Text>
            <Text className="text-muted text-xs mt-1">Total scans</Text>
          </View>
        </View>

        {!unlocked && (
          <View className="bg-surface rounded-2xl p-4 mb-6 flex-row items-center justify-between">
            <Text className="text-muted text-sm flex-1 mr-3">
              Unlock extended micronutrient trends and unlimited history with NutriSnap Unlimited.
            </Text>
            <Text className="font-semibold" style={{ color: colors.accent }} onPress={() => router.push("/paywall")}>
              Upgrade
            </Text>
          </View>
        )}

        <Text className="text-text text-lg font-bold mb-3">All meals</Text>
        {scans.length === 0 ? (
          <View className="bg-surface rounded-2xl p-6 items-center">
            <Text className="text-muted text-center">No scans yet — your history will show up here.</Text>
          </View>
        ) : (
          scans.map((s) => <MealCard key={s.id} scan={s} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
