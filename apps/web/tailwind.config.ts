import type { Config } from "tailwindcss";

/**
 * Design tokens do ObraOS.
 * concrete  → superfícies (betão claro)
 * steel     → texto/ações primárias (aço)
 * signal    → acento (amarelo de sinalização de obra) — usar com moderação, sempre com texto steel por cima
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        concrete: { 50: "#FAFAF8", 100: "#F3F4F2", 200: "#E4E6E2", 300: "#C9CCC6", 500: "#8A8F88" },
        steel: { 500: "#3B4A5C", 700: "#1F2A37", 900: "#111821" },
        signal: { DEFAULT: "#F5C400", 600: "#D4A900" },
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
