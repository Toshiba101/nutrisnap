// Dark-first health-app palette — see Phase 0 research notes: near-black
// surfaces, one confident accent, and the protein/carbs/fat ring colors
// that Cal AI-style trackers have already trained users to read at a
// glance. Kept as plain JS constants (not just Tailwind classes) so charts
// and SVG rings — which take real color values, not class names — share
// the exact same palette as the rest of the UI.
export const colors = {
  bg: "#0E0E10",
  surface: "#17171B",
  surface2: "#1F2024",
  line: "#2A2B30",
  accent: "#3DDC84",
  accentDim: "#1F5C3B",
  protein: "#FF6B6B",
  carbs: "#FFA94D",
  fat: "#4DABF7",
  fiber: "#B197FC",
  muted: "#8E8E96",
  text: "#F5F5F7",
  danger: "#FF5D5D",
};

export const goalLabels: Record<Goal, string> = {
  bulk: "Build Muscle",
  cut: "Lose Weight",
  maintain: "Maintain",
};

export type Goal = "bulk" | "cut" | "maintain";
export type BodyType = "ectomorph" | "mesomorph" | "endomorph";
export type CookingMethod =
  | "raw"
  | "steamed"
  | "boiled"
  | "baked"
  | "grilled"
  | "fried"
  | "deep_fried"
  | "other";
export type AddedFat =
  | "none"
  | "olive_oil"
  | "ghee"
  | "butter"
  | "plant_based_oil"
  | "sauce_dressing"
  | "other";
