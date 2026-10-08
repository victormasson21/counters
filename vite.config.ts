import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      pwaAssets: { config: true },
      manifest: {
        name: "Counters",
        short_name: "Counters",
        description: "Time since the things that matter.",
        display: "standalone",
        theme_color: "#f4f1ea",
        background_color: "#f4f1ea",
      },
    }),
  ],
})
