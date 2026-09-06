import React, { createContext, useContext, useState } from "react";
import type { CookingMethod, AddedFat } from "./theme";
import type { IdentifiedFoodItem, NutritionTotals, ScanItem } from "./types";

interface ScanFlowState {
  photoUri: string | null;
  photoBase64: string | null;
  identifiedItems: IdentifiedFoodItem[];
  anchorGrams: number | null;
  cookingMethod: CookingMethod | null;
  addedFat: AddedFat | null;
  result: { totals: NutritionTotals; items: ScanItem[] } | null;
  recommendation: string | null;
}

interface ScanFlowContextValue extends ScanFlowState {
  setPhoto: (uri: string, base64: string) => void;
  setIdentifiedItems: (items: IdentifiedFoodItem[]) => void;
  setAnchorAnswers: (grams: number, method: CookingMethod, fat: AddedFat) => void;
  setResult: (result: { totals: NutritionTotals; items: ScanItem[] }, recommendation: string) => void;
  reset: () => void;
}

const initialState: ScanFlowState = {
  photoUri: null,
  photoBase64: null,
  identifiedItems: [],
  anchorGrams: null,
  cookingMethod: null,
  addedFat: null,
  result: null,
  recommendation: null,
};

const ScanFlowContext = createContext<ScanFlowContextValue | null>(null);

export function ScanFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScanFlowState>(initialState);

  const value: ScanFlowContextValue = {
    ...state,
    setPhoto: (uri, base64) => setState((s) => ({ ...s, photoUri: uri, photoBase64: base64 })),
    setIdentifiedItems: (items) => setState((s) => ({ ...s, identifiedItems: items })),
    setAnchorAnswers: (grams, method, fat) =>
      setState((s) => ({ ...s, anchorGrams: grams, cookingMethod: method, addedFat: fat })),
    setResult: (result, recommendation) =>
      setState((s) => ({ ...s, result, recommendation })),
    reset: () => setState(initialState),
  };

  return <ScanFlowContext.Provider value={value}>{children}</ScanFlowContext.Provider>;
}

export function useScanFlow() {
  const ctx = useContext(ScanFlowContext);
  if (!ctx) throw new Error("useScanFlow must be used within ScanFlowProvider");
  return ctx;
}
