import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/AuthContext";
import { signOutUser, usingLocalDemoMode } from "../../lib/backend";
import { isUnlocked } from "../../lib/purchases";
import { colors, goalLabels } from "../../lib/theme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-line">
      <Text className="text-muted">{label}</Text>
      <Text className="text-text font-medium">{value}</Text>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { profile, email } = useAuth();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    isUnlocked().then(setUnlocked);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-text text-2xl font-bold mb-6">Settings</Text>

        {usingLocalDemoMode && (
          <View className="bg-surface2 rounded-2xl p-4 mb-6">
            <Text className="text-sm font-semibold mb-1" style={{ color: colors.accent }}>Local demo mode</Text>
            <Text className="text-muted text-xs leading-5">
              No Firebase project is configured yet, so your account and meals are stored on
              this device only. Add EXPO_PUBLIC_FIREBASE_* env vars to switch to real cloud
              auth + database.
            </Text>
          </View>
        )}

        <View className="bg-surface rounded-2xl px-4 mb-6">
          <Row label="Name" value={profile?.name ?? "—"} />
          <Row label="Email" value={email ?? "—"} />
          <Row label="Height" value={profile ? `${profile.heightCm} cm` : "—"} />
          <Row label="Weight" value={profile ? `${profile.weightKg} kg` : "—"} />
          <Row label="Body type" value={profile?.bodyType ?? "—"} />
          <Row label="Goal" value={profile ? goalLabels[profile.goal] : "—"} />
        </View>

        <Pressable
          onPress={() => router.push("/paywall")}
          className="bg-accent rounded-2xl p-4 mb-4 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-bg font-bold text-base">NutriSnap Unlimited</Text>
            <Text className="text-bg/70 text-xs mt-0.5">
              {unlocked ? "Active — unlimited scans" : "Unlimited scans + full micronutrients"}
            </Text>
          </View>
          <Text className="text-bg text-xl">→</Text>
        </Pressable>

        <Pressable
          onPress={() => signOutUser()}
          className="bg-surface rounded-2xl p-4 items-center"
        >
          <Text className="font-semibold" style={{ color: colors.danger }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
