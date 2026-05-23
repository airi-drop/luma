import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  define: {
    // Explicit env injection supaya Vercel deploy pasti bawa env vars ke
    // client bundle. Vite seharusnya handle ini otomatis via import.meta.env,
    // tapi beberapa hosting (Vercel) kadang tidak forward VITE_* correctly.
    "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(
      process.env.VITE_GEMINI_API_KEY ?? "",
    ),
    "import.meta.env.VITE_OPENAI_API_KEY": JSON.stringify(
      process.env.VITE_OPENAI_API_KEY ?? "",
    ),
    "import.meta.env.VITE_OPENROUTER_API_KEY": JSON.stringify(
      process.env.VITE_OPENROUTER_API_KEY ?? "",
    ),
    "import.meta.env.VITE_AI_PROVIDER": JSON.stringify(
      process.env.VITE_AI_PROVIDER ?? "",
    ),
    "import.meta.env.VITE_AI_MODEL": JSON.stringify(
      process.env.VITE_AI_MODEL ?? "",
    ),
    "import.meta.env.VITE_AI_API_KEY": JSON.stringify(
      process.env.VITE_AI_API_KEY ?? "",
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "icons/icon-192.svg",
        "icons/icon-512.svg",
        "icons/icon-maskable.svg",
      ],
      manifest: {
        id: "/",
        name: "Luma",
        short_name: "Luma",
        description: "Cozy customizable finance space buat catat uang dengan cara yang nyaman.",
        theme_color: "#1A1410",
        background_color: "#1A1410",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "id-ID",
        categories: ["finance", "lifestyle"],
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-images",
              expiration: {
                maxEntries: 48,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
