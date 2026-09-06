// Google Sign-In via expo-auth-session's generic OAuth flow (works inside
// Expo Go — no native module/config-plugin rebuild needed, unlike
// @react-native-google-signin/google-signin). Requires a Google "Web
// client ID", which Firebase auto-generates the moment the Google
// provider is enabled in Authentication > Sign-in method — see that
// screen's "Web SDK configuration" section.
import { useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID, IS_GOOGLE_SIGN_IN_CONFIGURED } from "./config";
import * as backend from "./backend";
import { useAuth } from "./AuthContext";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export function useGoogleSignIn() {
  const { applyAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID || "unconfigured",
      scopes: ["openid", "profile", "email"],
      // For an Android-type OAuth client, Google requires the redirect
      // URI's scheme to be the app's package name (confirmed via Google's
      // own error detail page: "redirect_uri=nutrisnap://" was rejected
      // outright as a policy violation) — not our regular deep-link scheme.
      redirectUri: AuthSession.makeRedirectUri({ scheme: "com.mostafa.nutrisnap" }),
      responseType: AuthSession.ResponseType.IdToken,
      // PKCE (code_challenge/code_challenge_method) is only valid for the
      // authorization_code flow — Google rejects it outright on the
      // implicit id_token flow used here ("Parameter not allowed for this
      // message type: code_challenge_method", confirmed live on device).
      usePKCE: false,
      extraParams: { nonce: Math.random().toString(36).slice(2) },
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      setLoading(true);
      backend
        .signInWithGoogleIdToken(response.params.id_token)
        .then((user) => applyAuthUser(user))
        .catch((e: any) => setError(e?.message ?? "Google sign-in failed."))
        .finally(() => setLoading(false));
    } else if (response?.type === "error") {
      setError(response.error?.message || response.params?.error_description || "Google sign-in was cancelled or failed.");
    }
  }, [response]);

  return {
    isConfigured: IS_GOOGLE_SIGN_IN_CONFIGURED,
    loading,
    error,
    promptAsync: () => promptAsync(),
    ready: Boolean(request),
  };
}
