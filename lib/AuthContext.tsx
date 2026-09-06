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
      if (user) {
        setUid(user.uid);
        setEmail(user.email);
        const [p, s] = await Promise.all([
          backend.getProfile(user.uid),
          backend.listScans(user.uid),
        ]);
        setProfileState(p);
        setScans(s);
      } else {
        setUid(null);
        setEmail(null);
        setProfileState(null);
        setScans([]);
      }
      setLoading(false);
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
