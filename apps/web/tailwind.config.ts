import type { Config } from "tailwindcss";

/**
 * Design tokens do ObraOS.
 * concrete  → superfícies (betão claro)
 * steel     → texto/ações primárias (aço)
 * signal    → acento (terracota de projeto técnico) — usar com moderação, sempre com texto steel por cima
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        concrete: { 50: "#FAFAF8", 100: "#F3F4F2", 200: "#E4E6E2", 300: "#C9CCC6", 500: "#8A8F88" },
        steel: { 500: "#3B4A5C", 700: "#1F2A37", 900: "#111821" },
        signal: {
          100: "#fff3e8", 200: "#ffe0c6", 300: "#fdc79b", 400: "#f0a76c",
          DEFAULT: "#c56a24", 500: "#e08744", 600: "#ab5a1d", 700: "#8a4715", 800: "#63330f", 900: "#40200a",
        },
        ok: "#1E8E5A",
        warn: "#C2410C",
        danger: "#B42318",
      },
      fontFamily: {
        display: ["\"Barlow Condensed\"", "\"Arial Narrow\"", "sans-serif"],
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
      fontSize: { "num-lg": ["2.75rem", { lineHeight: "1", fontWeight: "600" }] },
      borderRadius: { DEFAULT: "6px", lg: "10px" },
      minHeight: { touch: "48px" },
    },
  },
  plugins: [],
} satisfies Config;
