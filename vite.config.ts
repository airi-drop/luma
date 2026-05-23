import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // AI key jangan ikut masuk bundle production.
  // Kalau nanti butuh AI production, pakai proxy/backend terpisah.
  const fileEnv = loadEnv(mode, process.cwd(), "");

  const get = (key: string) =>
    fileEnv[key] || process.env[key] || "";

  return {
    define: {
      __LUMA_ENV__: JSON.stringify({
        geminiKey:
          mode === "production"
            ? ""
            : get("VITE_GEMINI_API_KEY") || get("GEMINI_API_KEY"),
        openaiKey:
          mode === "production"
            ? ""
            : get("VITE_OPENAI_API_KEY") || get("OPENAI_API_KEY"),
        openrouterKey:
          mode === "production"
            ? ""
            : get("VITE_OPENROUTER_API_KEY") || get("OPENROUTER_API_KEY"),
        universalKey:
          mode === "production"
            ? ""
            : get("VITE_AI_API_KEY") || get("AI_API_KEY"),
        provider:
          mode === "production"
            ? ""
            : get("VITE_AI_PROVIDER") || get("AI_PROVIDER"),
        model:
          mode === "production"
            ? ""
            : get("VITE_AI_MODEL") || get("AI_MODEL"),
      }),
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
  };
});
