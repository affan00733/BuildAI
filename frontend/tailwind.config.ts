import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f5f7",
          100: "#e5e5ea",
          900: "#0a0a0f",
          950: "#050507",
        },
        accent: {
          violet: "#8b5cf6",
          fuchsia: "#ec4899",
          cyan: "#06b6d4",
          lime: "#84cc16",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { "background-position": "-1000px 0" },
          "100%": { "background-position": "1000px 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(139, 92, 246, 0.4)",
        "glow-cyan": "0 0 60px -10px rgba(6, 182, 212, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
