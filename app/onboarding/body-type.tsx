import React, { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import PillButton from "../../components/PillButton";
import OptionCard from "../../components/OptionCard";
import { useOnboarding } from "../../lib/OnboardingContext";
import type { BodyType } from "../../lib/theme";

const OPTIONS: { value: BodyType; label: string; subtitle: string }[] = [
  { value: "ectomorph", label: "Ectomorph", subtitle: "Naturally lean, gains weight slowly" },
  { value: "mesomorph", label: "Mesomorph", subtitle: "Athletic build, gains/loses fairly easily" },
  { value: "endomorph", label: "Endomorph", subtitle: "Gains weight easily, broader build" },
];

export default function OnboardingBodyType() {
  const router = useRouter();
  const { bodyType, setBodyType } = useOnboarding();
  const [selected, setSelected] = useState<BodyType | null>(bodyType);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <OnboardingProgressBar step={3} total={4} />
      <View className="flex-1 px-6 pt-10">
        <Text className="text-text text-3xl font-bold mb-2">Your body type</Text>
        <Text className="text-muted text-base mb-8">
          A rough starting point — you can always adjust later.
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
        <PillButton
          label="Continue"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setBodyType(selected);
            router.push("/onboarding/goal");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
