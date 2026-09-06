import React from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { useGoogleSignIn } from "../lib/useGoogleSignIn";
import { colors } from "../lib/theme";

export default function GoogleSignInButton() {
  const { isConfigured, loading, error, promptAsync, ready } = useGoogleSignIn();

  if (!isConfigured) return null;

  return (
    <View className="mt-4">
      <Pressable
        onPress={() => promptAsync()}
        disabled={!ready || loading}
        className={`w-full py-4 rounded-full items-center justify-center flex-row bg-surface ${
          !ready || loading ? "opacity-50" : ""
        }`}
      >
        {loading ? (
          <ActivityIndicator color="#F5F5F7" />
        ) : (
          <>
            <Text style={{ fontSize: 16 }} className="mr-2">
              🔵
            </Text>
            <Text className="text-text font-semibold text-base">Continue with Google</Text>
          </>
        )}
      </Pressable>
      {error ? <Text className="text-xs mt-2 text-center" style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}
