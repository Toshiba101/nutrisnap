import React, { useEffect, useState } from "react";
import { View, Image, Text } from "react-native";
import { useRouter } from "expo-router";
import { useScanFlow } from "../../lib/ScanFlowContext";
import { useAuth } from "../../lib/AuthContext";
import { identifyFood } from "../../lib/nutritionApi";
import { isUnlocked } from "../../lib/purchases";
import { scansToday } from "../../lib/streak";
import { FREE_TIER_DAILY_SCANS } from "../../lib/config";
import ScanningOverlay from "../../components/ScanningOverlay";
import PillButton from "../../components/PillButton";

export default function ScanIdentify() {
  const router = useRouter();
  const { photoUri, photoBase64, setIdentifiedItems } = useScanFlow();
  const { scans } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!photoBase64) {
        router.replace("/scan/camera");
        return;
      }

      const unlocked = await isUnlocked();
      const usedToday = scansToday(scans.map((s) => s.createdAt));
      if (!unlocked && usedToday >= FREE_TIER_DAILY_SCANS) {
        router.replace("/paywall");
        return;
      }

      try {
        const items = await identifyFood(photoBase64);
        if (cancelled) return;
        setIdentifiedItems(items);
        router.replace("/scan/confirm");
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Could not identify the food in this photo.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [photoBase64]);

  return (
    <View className="flex-1 bg-bg">
      {photoUri && <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />}
      {!error ? (
        <ScanningOverlay label="Identifying your meal..." />
      ) : (
        <View className="absolute inset-0 items-center justify-center px-8 bg-black/70">
          <Text className="text-text text-center mb-4">{error}</Text>
          <PillButton label="Try Again" onPress={() => router.replace("/scan/camera")} />
        </View>
      )}
    </View>
  );
}
