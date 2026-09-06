// Google Sign-In via expo-auth-session's generic OAuth flow (works inside
// Expo Go — no native module/config-plugin rebuild needed, unlike
// @react-native-google-signin/google-signin).
//
// Uses the authorization CODE flow (+ PKCE), not the simpler implicit
// id_token flow — confirmed live, in this exact order, that Google
// requires this specific combination for an Android-type OAuth client
// with a custom URI scheme redirect:
//   1. response_type=id_token alone -> rejected (wrong client type) until
//      the client was switched from Web to Android.
//   2. Web client's implicit flow -> "doesn't comply with OAuth 2.0
//      policy" until the redirect URI's scheme was changed to the app's
//      package name (Android clients require this).
//   3. Custom-scheme redirect -> "Custom URI scheme is not enabled for
//      your Android client" until that toggle was turned on in Google
//      Cloud Console (off by default).
//   4. response_type=id_token -> "unsupported_response_type" — Android
//      custom-URI-scheme clients only support the code flow.
// So: request a code, then exchange it for tokens ourselves.
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

const CLIENT_ID = GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID || "unconfigured";
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: "com.mostafa.nutrisnap" });

export function useGoogleSignIn() {
  const { applyAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.code && request?.codeVerifier) {
      setLoading(true);
      AuthSession.exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code: response.params.code,
          redirectUri: REDIRECT_URI,
          extraParams: { code_verifier: request.codeVerifier },
        },
        discovery
      )
        .then((tokenResponse) => {
          if (!tokenResponse.idToken) throw new Error("No ID token returned by Google.");
          return backend.signInWithGoogleIdToken(tokenResponse.idToken);
        })
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
