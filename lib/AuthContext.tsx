import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  applyAuthUser: (user: { uid: string; email: string } | null) => Promise<void>;
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
  // Guards against the listener and a manual applyAuthUser() call (see
  // below) both firing for the same sign-in and doubling up the work —
  // harmless either way, just wasted requests, but easy to avoid.
  const lastAppliedUid = useRef<string | null>(null);

  const refreshScans = useCallback(async () => {
    if (!uid) return;
    setScans(await backend.listScans(uid));
  }, [uid]);

  const applyAuthUser = useCallback(async (user: { uid: string; email: string } | null) => {
    if (user && lastAppliedUid.current === user.uid) return;
    lastAppliedUid.current = user?.uid ?? null;
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
  }, []);

  useEffect(() => {
    // The listener is kept as the source of truth for sign-out and token
    // refresh, but a real device (standalone release build) showed it
    // doesn't always reliably fire right after a fresh sign-in/sign-up —
    // the login screen just sat there with no error and no navigation.
    // Each sign-in/sign-up/Google screen also calls applyAuthUser()
    // directly with the user it already has from the resolved auth call,
    // so the app doesn't depend on this listener alone to make progress.
    const unsub = backend.onAuthChange(applyAuthUser);

    // 2026-09-19: confirmed live -- on a standalone build, Firebase's
    // auth-state listener can fail to fire even ONCE on cold app open
    // (not just "slow to fire after sign-in", the case handled above) --
    // most likely a stale/corrupted local Firebase Auth persistence
    // cache on that specific device. Since `loading` starts `true` and
    // NOTHING else ever flips it, that leaves the app frozen on the
    // root spinner forever with no error and no way out for the user.
    // Force progress after a timeout: treat it as "no signed-in user"
    // so the app falls through to the sign-in screen instead of hanging
    // indefinitely. If the listener does fire first, this is a no-op.
    const failsafe = setTimeout(() => {
      setLoading((current) => (current ? false : current));
    }, 10000);

    return () => {
      unsub();
      clearTimeout(failsafe);
    };
  }, [applyAuthUser]);

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
      value={{ uid, email, profile, scans, loading, refreshScans, saveProfile, saveScan, applyAuthUser }}
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
