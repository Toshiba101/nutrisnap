import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as backend from "./backend";
import type { UserProfile, ScanRecord } from "./types";

interface AuthContextValue {
  uid: string | null;
  email: string | null;
  profile: UserProfile | null;
  scans: ScanRecord[];
  loading: boolean;
  refreshScans: () => Promise<void>;
  saveProfile: (p: UserProfile) => Promise<void>;
  saveScan: (s: ScanRecord) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshScans = useCallback(async () => {
    if (!uid) return;
    setScans(await backend.listScans(uid));
  }, [uid]);

  useEffect(() => {
    const unsub = backend.onAuthChange(async (user) => {
      setLoading(true);
      try {
        if (user) {
          setUid(user.uid);
          setEmail(user.email);
          // If Firestore is unreachable or slow, fall back to "no profile"
          // rather than hanging forever — a stuck `loading: true` here
          // silently freezes the whole app on the sign-in screen with no
          // error shown, since RootNav has nothing else to render.
          const [p, s] = await Promise.all([
            withTimeout(backend.getProfile(user.uid).catch(() => null), 8000, null),
            withTimeout(backend.listScans(user.uid).catch(() => []), 8000, []),
          ]);
          setProfileState(p);
          setScans(s);
        } else {
          setUid(null);
          setEmail(null);
          setProfileState(null);
          setScans([]);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const saveProfile = useCallback(
    async (p: UserProfile) => {
      if (!uid) return;
      await backend.setProfile(uid, p);
      setProfileState(p);
    },
    [uid]
  );

  const saveScan = useCallback(
    async (s: ScanRecord) => {
      if (!uid) return;
      await backend.addScan(uid, s);
      await refreshScans();
    },
    [uid, refreshScans]
  );

  return (
    <AuthContext.Provider
      value={{ uid, email, profile, scans, loading, refreshScans, saveProfile, saveScan }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
