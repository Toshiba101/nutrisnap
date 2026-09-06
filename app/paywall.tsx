import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOfferings, purchase, restorePurchases, type PaywallOffering } from "../lib/purchases";
import { IS_REVENUECAT_CONFIGURED, FREE_TIER_DAILY_SCANS } from "../lib/config";
import PillButton from "../components/PillButton";

const FEATURES = [
  "Unlimited food scans every day",
  "Full micronutrient breakdown per meal",
  "Extended trend charts & history",
  "Priority support",
];

export default function Paywall() {
  const router = useRouter();
  const [offerings, setOfferings] = useState<PaywallOffering[]>([]);
  const [selected, setSelected] = useState<PaywallOffering | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOfferings().then((o) => {
      setOfferings(o);
      setSelected(o[0] ?? null);
    });
  }, []);

  async function handlePurchase() {
    if (!selected) return;
    setLoading(true);
    try {
      const ok = await purchase(selected);
      if (ok) router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const ok = await restorePurchases();
      if (ok) router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View className="items-end">
          <Pressable onPress={() => router.back()}>
            <Text className="text-muted text-lg">✕</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 44 }} className="text-center mt-2 mb-2">
          ✨
        </Text>
        <Text className="text-text text-3xl font-bold text-center mb-2">NutriSnap Unlimited</Text>
        <Text className="text-muted text-center mb-8">
          Free plan includes {FREE_TIER_DAILY_SCANS} scans/day. Go unlimited to track every meal.
        </Text>

        <View className="bg-surface rounded-2xl p-5 mb-8">
          {FEATURES.map((f) => (
            <View key={f} className="flex-row items-center py-2">
              <Text className="text-accent mr-3">✓</Text>
              <Text className="text-text flex-1">{f}</Text>
            </View>
          ))}
        </View>

        {offerings.map((o) => (
          <Pressable
            key={o.identifier}
            onPress={() => setSelected(o)}
            className={`rounded-2xl p-5 mb-3 border ${
              selected?.identifier === o.identifier ? "border-accent bg-accentDim/20" : "border-line bg-surface"
            }`}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-text font-semibold text-base">{o.title}</Text>
              <Text className="text-text font-bold text-base">{o.priceString}</Text>
            </View>
          </Pressable>
        ))}

        {!IS_REVENUECAT_CONFIGURED && (
          <Text className="text-muted text-xs text-center mb-4">
            Demo mode — no RevenueCat project configured yet, so this unlocks locally on this
            device instead of charging a real subscription.
          </Text>
        )}

        <PillButton label="Continue" onPress={handlePurchase} loading={loading} disabled={!selected} />
        <Pressable onPress={handleRestore} className="mt-4 items-center">
          <Text className="text-muted">Restore Purchases</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
