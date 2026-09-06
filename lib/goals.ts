// Daily calorie/macro targets. The onboarding flow deliberately doesn't
// collect age or gender (per spec: name, height, weight, body type, goal),
// so this uses a simplified weight+goal-based estimate rather than a full
// Mifflin-St Jeor calculation — clearly an approximation, good enough to
// anchor the dashboard rings, not framed as medical/clinical guidance.
import type { Goal } from "./theme";
import type { UserProfile } from "./types";

const GOAL_ACTIVITY_ADJUST: Record<Goal, number> = {
  bulk: 1.15,
  cut: 0.8,
  maintain: 1.0,
};

const GOAL_PROTEIN_G_PER_KG: Record<Goal, number> = {
  bulk: 2.0,
  cut: 1.8,
  maintain: 1.6,
};

export interface DailyTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function computeDailyTargets(profile: Pick<UserProfile, "weightKg" | "goal">): DailyTargets {
  const baseMaintenance = profile.weightKg * 24 * 1.4; // rough weight-based BMR x light-activity factor
  const calories = Math.round(baseMaintenance * GOAL_ACTIVITY_ADJUST[profile.goal]);

  const protein_g = Math.round(profile.weightKg * GOAL_PROTEIN_G_PER_KG[profile.goal]);
  const fat_g = Math.round((calories * 0.25) / 9);
  const remainingCalories = calories - protein_g * 4 - fat_g * 9;
  const carbs_g = Math.max(Math.round(remainingCalories / 4), 0);

  return { calories, protein_g, carbs_g, fat_g };
}
