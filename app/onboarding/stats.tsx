import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import PillButton from "../../components/PillButton";
import { useOnboarding } from "../../lib/OnboardingContext";

export default function OnboardingStats() {
  const router = useRouter();
  const { setStats } = useOnboarding();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const heightNum = parseFloat(height);
  const weightNum = parseFloat(weight);
  const valid = heightNum > 50 && heightNum < 260 && weightNum > 20 && weightNum < 400;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <OnboardingProgressBar step={2} total={4} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-1 px-6 pt-10">
          <Text className="text-text text-3xl font-bold mb-2">Your stats</Text>
          <Text className="text-muted text-base mb-10">
            This calibrates how we read your meals against your goal.
          </Text>

          <Text className="text-muted text-sm mb-2 ml-1">Height (cm)</Text>
          <TextInput
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="175"
            placeholderTextColor="#5A5A60"
            className="bg-surface text-text rounded-2xl px-4 py-4 mb-4 text-lg"
          />
          <Text className="text-muted text-sm mb-2 ml-1">Weight (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="70"
            placeholderTextColor="#5A5A60"
            className="bg-surface text-text rounded-2xl px-4 py-4 text-lg"
          />
        </View>
        <View className="px-6 pb-6">
          <PillButton
            label="Continue"
            disabled={!valid}
            onPress={() => {
              setStats(heightNum, weightNum);
              router.push("/onboarding/body-type");
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
