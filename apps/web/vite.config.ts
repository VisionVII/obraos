import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ObraOS", short_name: "ObraOS", description: "O seu trabalho. As suas obras. Num só lugar.",
        theme_color: "#1F2A37", background_color: "#F3F4F2", display: "standalone", lang: "pt-PT",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  envDir: path.resolve(__dirname, "../.."), // .env partilhado na raiz do monorepo
  server: { port: 5173 },
  build: { sourcemap: true },
});
