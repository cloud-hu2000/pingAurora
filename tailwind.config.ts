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
        aurora: {
          dark: "#0a0a1a",
          deep: "#0d1b3e",
          glow: "#1a3a6e",
          accent: "#00d4ff",
          soft: "#7fdbff",
          text: "#e0f4ff",
        },
      },
      backgroundImage: {
        "aurora-gradient":
          "radial-gradient(ellipse at 50% 0%, #1a3a6e 0%, #0d1b3e 40%, #0a0a1a 80%)",
      },
    },
  },
  plugins: [],
};
export default config;
