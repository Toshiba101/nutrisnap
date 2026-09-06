import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as backend from "../../lib/backend";
import { useAuth } from "../../lib/AuthContext";
import PillButton from "../../components/PillButton";
import GoogleSignInButton from "../../components/GoogleSignInButton";

export default function SignUp() {
  const { applyAuthUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await backend.signUp(email.trim(), password);
      await applyAuthUser(user);
    } catch (e: any) {
      setError(e?.message ?? "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 justify-center">
            <Text className="text-4xl mb-1">🥗</Text>
            <Text className="text-text text-3xl font-bold mb-1">Create your account</Text>
            <Text className="text-muted text-base mb-8">
              Scan meals, track macros, and see real progress.
            </Text>

            <Text className="text-muted text-sm mb-2 ml-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#5A5A60"
              className="bg-surface text-text rounded-2xl px-4 py-4 mb-4 text-base"
            />
            <Text className="text-muted text-sm mb-2 ml-1">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 6 characters"
              placeholderTextColor="#5A5A60"
              className="bg-surface text-text rounded-2xl px-4 py-4 mb-2 text-base"
            />
            {error ? <Text className="text-danger text-sm mb-2">{error}</Text> : null}

            <View className="mt-4">
              <PillButton label="Create Account" onPress={handleSignUp} loading={loading} />
            </View>

            <GoogleSignInButton />

            <View className="flex-row justify-center mt-6">
              <Text className="text-muted">Already have an account? </Text>
              <Link href="/(auth)/sign-in" className="text-accent font-semibold">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
