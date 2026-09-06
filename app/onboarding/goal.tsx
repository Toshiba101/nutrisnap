import React, { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import PillButton from "../../components/PillButton";
import OptionCard from "../../components/OptionCard";
import { useOnboarding } from "../../lib/OnboardingContext";
import { useAuth } from "../../lib/AuthContext";
import type { Goal } from "../../lib/theme";

const OPTIONS: { value: Goal; label: string; subtitle: string }[] = [
  { value: "bulk", label: "Build Muscle", subtitle: "Eat in a surplus, prioritize protein" },
  { value: "cut", label: "Lose Weight", subtitle: "Eat in a deficit, stay satiated" },
  { value: "maintain", label: "Maintain", subtitle: "Stay balanced, general fitness" },
];

export default function OnboardingGoal() {
  const router = useRouter();
  const { name, heightCm, weightKg, bodyType, goal, setGoal } = useOnboarding();
  const { saveProfile } = useAuth();
  const [selected, setSelected] = useState<Goal | null>(goal);
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (!selected || !heightCm || !weightKg || !bodyType) return;
    setGoal(selected);
    setSaving(true);
    try {
      await saveProfile({
        name,
        heightCm,
        weightKg,
        bodyType,
        goal: selected,
        createdAt: Date.now(),
      });
      router.replace("/(tabs)/home");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <OnboardingProgressBar step={4} total={4} />
      <View className="flex-1 px-6 pt-10">
        <Text className="text-text text-3xl font-bold mb-2">What's your goal?</Text>
        <Text className="text-muted text-base mb-8">
          This shapes how we score meals and what we recommend.
        </Text>
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label}
            subtitle={o.subtitle}
            selected={selected === o.value}
            onPress={() => setSelected(o.value)}
          />
        ))}
      </View>
      <View className="px-6 pb-6">
        <PillButton label="Get Started" disabled={!selected} loading={saving} onPress={finish} />
      </View>
    </SafeAreaView>
  );
}
