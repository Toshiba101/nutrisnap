// Short, food-education-framed observations about a single scanned meal,
// relative to the user's stated goal — deliberately NOT medical-advice
// styled (no "you must", no clinical claims), just plain nutrition
// literacy a person can act on next meal. Rule-based on purpose: the
// numbers behind it come from the real USDA lookup, not a model guess.
import type { Goal } from "./theme";
import type { NutritionTotals } from "./types";

interface Observation {
  text: string;
  priority: number; // lower = shown first
}

export function generateRecommendation(totals: NutritionTotals, goal: Goal): string {
  const obs: Observation[] = [];
  const kcal = Math.max(totals.calories, 1);
  const proteinPct = ((totals.protein_g * 4) / kcal) * 100;
  const fatPct = ((totals.fat_g * 9) / kcal) * 100;

  if (goal === "bulk") {
    if (totals.protein_g >= 30) {
      obs.push({ text: `Good protein for your muscle-building goal (${Math.round(totals.protein_g)}g).`, priority: 1 });
    } else {
      obs.push({ text: `Light on protein for a bulking goal — aim for 30g+ at your next meal.`, priority: 0 });
    }
    if (totals.calories < 500) {
      obs.push({ text: `This meal is fairly light on calories for a bulking phase.`, priority: 2 });
    }
  } else if (goal === "cut") {
    if (fatPct > 40) {
      obs.push({ text: `Fat made up a large share of this meal's calories — worth balancing with a lighter next meal.`, priority: 0 });
    }
    if (totals.protein_g >= 25) {
      obs.push({ text: `Solid protein-to-calorie ratio, which helps with satiety while cutting.`, priority: 1 });
    }
    if (totals.calories > 800) {
      obs.push({ text: `A calorie-dense meal — consider a lighter follow-up meal today.`, priority: 1 });
    }
  } else {
    if (totals.protein_g >= 20 && totals.protein_g <= 45) {
      obs.push({ text: `Balanced protein for general maintenance.`, priority: 2 });
    }
  }

  if (totals.fiber_g < 4) {
    obs.push({ text: `Consider more fiber next meal — this one was light on it.`, priority: 1 });
  } else if (totals.fiber_g >= 8) {
    obs.push({ text: `Great fiber content in this meal.`, priority: 2 });
  }

  if (totals.sodium_mg > 1000) {
    obs.push({ text: `This meal is fairly high in sodium — balance it out later today.`, priority: 1 });
  }

  if (obs.length === 0) {
    return "A well-rounded meal — nothing stands out as unbalanced.";
  }

  obs.sort((a, b) => a.priority - b.priority);
  return obs.slice(0, 2).map((o) => o.text).join(" ");
}
