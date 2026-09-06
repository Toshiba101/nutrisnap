import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import PillButton from "../../components/PillButton";
import { useOnboarding } from "../../lib/OnboardingContext";

export default function OnboardingName() {
  const router = useRouter();
  const { name, setName } = useOnboarding();
  const [value, setValue] = useState(name);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <OnboardingProgressBar step={1} total={4} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-1 px-6 pt-10">
          <Text className="text-text text-3xl font-bold mb-2">What's your name?</Text>
          <Text className="text-muted text-base mb-10">
            We'll use this to personalize NutriSnap for you.
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Your name"
            placeholderTextColor="#5A5A60"
            autoFocus
            className="bg-surface text-text rounded-2xl px-4 py-4 text-lg"
          />
        </View>
        <View className="px-6 pb-6">
          <PillButton
            label="Continue"
            disabled={value.trim().length === 0}
            onPress={() => {
              setName(value.trim());
              router.push("/onboarding/stats");
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
