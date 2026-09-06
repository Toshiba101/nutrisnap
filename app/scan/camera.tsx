import React, { useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScanFlow } from "../../lib/ScanFlowContext";
import { colors } from "../../lib/theme";

export default function ScanCamera() {
  const router = useRouter();
  const { setPhoto } = useScanFlow();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
      if (photo?.base64 && photo.uri) {
        setPhoto(photo.uri, photo.base64);
        router.push("/scan/identify");
      }
    } finally {
      setCapturing(false);
    }
  }

  async function handlePickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setPhoto(result.assets[0].uri, result.assets[0].base64);
      router.push("/scan/identify");
    }
  }

  if (!permission) {
    return <View className="flex-1 bg-bg" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text style={{ fontSize: 40 }} className="mb-4">
          📷
        </Text>
        <Text className="text-text text-xl font-bold text-center mb-2">Camera access needed</Text>
        <Text className="text-muted text-center mb-6">
          NutriSnap needs your camera to scan your plate and identify food.
        </Text>
        <Pressable onPress={requestPermission} className="bg-accent rounded-full px-6 py-3">
          <Text className="text-bg font-bold">Grant Access</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-muted">Cancel</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <SafeAreaView className="flex-1 justify-between">
          <View className="flex-row justify-between items-center px-5 pt-2">
            <Pressable onPress={() => router.back()} className="bg-black/40 rounded-full w-10 h-10 items-center justify-center">
              <Text className="text-white text-lg">✕</Text>
            </Pressable>
            <View className="bg-black/40 rounded-full px-4 py-2">
              <Text className="text-white font-medium">Center your plate</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View className="items-center pb-10">
            <View className="flex-row items-center justify-between w-full px-10">
              <Pressable onPress={handlePickFromLibrary} className="w-12 h-12 rounded-full bg-black/40 items-center justify-center">
                <Text style={{ fontSize: 20 }}>🖼️</Text>
              </Pressable>
              <Pressable
                onPress={handleCapture}
                disabled={capturing}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ borderWidth: 4, borderColor: "white" }}
              >
                <View
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: capturing ? colors.muted : "white" }}
                />
              </Pressable>
              <View style={{ width: 48 }} />
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
