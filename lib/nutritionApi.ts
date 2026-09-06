import { API_BASE_URL } from "./config";
import type { CookingMethod, AddedFat } from "./theme";
import type { IdentifiedFoodItem, NutritionTotals, ScanItem } from "./types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // localtunnel shows an HTML interstitial to browser-like clients on
      // first visit from a new IP unless this is set — harmless to send
      // against any other host (e.g. once this points at a real deploy).
      "Bypass-Tunnel-Reminder": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function identifyFood(imageBase64: string): Promise<IdentifiedFoodItem[]> {
  const data = await post<{ items: { name: string; proportion: number; is_anchor: boolean }[] }>(
    "/identify",
    { image_base64: imageBase64 }
  );
  return data.items.map((i) => ({
    name: i.name,
    proportion: i.proportion,
    isAnchor: i.is_anchor,
  }));
}

export interface NutritionApiItem {
  name: string;
  grams: number;
  isAnchor: boolean;
}

export async function calculateNutrition(
  items: NutritionApiItem[],
  cookingMethod: CookingMethod,
  addedFat: AddedFat
): Promise<{ totals: NutritionTotals; items: ScanItem[] }> {
  const data = await post<{
    totals: NutritionTotals;
    items: {
      name: string;
      matched_usda_name: string;
      grams: number;
      is_anchor: boolean;
      nutrition: NutritionTotals;
    }[];
  }>("/nutrition", {
    items: items.map((i) => ({ name: i.name, grams: i.grams, is_anchor: i.isAnchor })),
    cooking_method: cookingMethod,
    added_fat: addedFat,
  });

  return {
    totals: data.totals,
    items: data.items.map((i) => ({
      name: i.name,
      matchedUsdaName: i.matched_usda_name,
      grams: i.grams,
      isAnchor: i.is_anchor,
      nutrition: i.nutrition,
    })),
  };
}
