import type { Goal, BodyType, CookingMethod, AddedFat } from "./theme";

export interface UserProfile {
  name: string;
  heightCm: number;
  weightKg: number;
  bodyType: BodyType;
  goal: Goal;
  createdAt: number;
}

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
  calcium_mg: number;
  iron_mg: number;
  vitamin_c_mg: number;
}

export interface ScanItem {
  name: string;
  matchedUsdaName: string;
  grams: number;
  isAnchor: boolean;
  nutrition: NutritionTotals;
}

export interface ScanRecord {
  id: string;
  createdAt: number;
  photoUri: string;
  cookingMethod: CookingMethod;
  addedFat: AddedFat;
  items: ScanItem[];
  totals: NutritionTotals;
  recommendation: string;
}

export interface IdentifiedFoodItem {
  name: string;
  proportion: number;
  isAnchor: boolean;
}
