import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        teacher: {
          yellow: "#F59E0B",
          "yellow-light": "#FEF3C7",
          "yellow-dark": "#B45309",
          orange: "#F97316",
          blue: "#3B82F6",
          "blue-light": "#DBEAFE",
          green: "#10B981",
          "green-light": "#D1FAE5",
          red: "#EF4444",
          "red-light": "#FEE2E2",
          purple: "#8B5CF6",
          "purple-light": "#EDE9FE",
          cream: "#FFFBEB",
          warm: "#FEF9EE",
        },
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
