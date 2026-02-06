import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eggshell: "#FDFDF8", // The soft off-white base
        ink: "#1A1A1A",      // Softer than pure black
        discord: "#5865F2",  // Brand accent
        "discord-dark": "#4752C4",
        success: "#22C55E",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        "soft-sm": "0 2px 8px -2px rgba(26, 26, 26, 0.05)",
        "soft-md": "0 8px 24px -6px rgba(26, 26, 26, 0.08)",
        "soft-xl": "0 20px 40px -10px rgba(26, 26, 26, 0.12)",
        "float": "0 10px 30px -5px rgba(88, 101, 242, 0.15)", // Purple tinted shadow
      },
    },
  },
  plugins: [],
};
export default config;