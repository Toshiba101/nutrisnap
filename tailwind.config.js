/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        xl2: "28px",
      },
    },
  },
  plugins: [],
};
