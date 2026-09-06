import React, { createContext, useContext, useState } from "react";
import type { Goal, BodyType } from "./theme";

interface OnboardingState {
  name: string;
  heightCm: number | null;
  weightKg: number | null;
  bodyType: BodyType | null;
  goal: Goal | null;
}

interface OnboardingContextValue extends OnboardingState {
  setName: (v: string) => void;
  setStats: (heightCm: number, weightKg: number) => void;
  setBodyType: (v: BodyType) => void;
  setGoal: (v: Goal) => void;
}

const initial: OnboardingState = { name: "", heightCm: null, weightKg: null, bodyType: null, goal: null };
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initial);
  const value: OnboardingContextValue = {
    ...state,
    setName: (name) => setState((s) => ({ ...s, name })),
    setStats: (heightCm, weightKg) => setState((s) => ({ ...s, heightCm, weightKg })),
    setBodyType: (bodyType) => setState((s) => ({ ...s, bodyType })),
    setGoal: (goal) => setState((s) => ({ ...s, goal })),
  };
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
