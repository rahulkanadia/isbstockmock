import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eggshell: "#FDFDF8",
        ink: "#1A1A1B",
        discord: "#5865F2",
        success: "#22C55E",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
export default config;