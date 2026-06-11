import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#1c1917",
        muted: "#f5f5f4",
        border: "rgba(0,0,0,0.08)",
        soloz: {
          bg: "#ffffff",
          primary: "#ea580c",
          textSecondary: "#57534e",
          textMuted: "#78716c",
          ember: "#ff7a1a",
          amber: "#ea580c",
          gold: "#d97706",
          forest: "#12352d",
          night: "#1c1917",
          ash: "#78716c"
        }
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"]
      },
      boxShadow: {
        glow: "0 20px 70px rgba(255, 122, 26, 0.22)"
      },
      backgroundImage: {
        "radial-fire": "radial-gradient(circle at top left, rgba(255,122,26,0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(18,53,45,0.45), transparent 34%)"
      }
    }
  },
  plugins: []
};

export default config;
