import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// DeepSeek's API is reached through this local proxy while the game runs via
// `npm run dev` / `npm run preview`, which avoids browser CORS restrictions.
const llmProxy = {
  "/llm/deepseek": {
    target: "https://api.deepseek.com",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/llm\/deepseek/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  worker: { format: "es" },
  // The whole curriculum is bundled so the game works offline.
  build: { chunkSizeWarningLimit: 1600 },
  server: { proxy: llmProxy },
  preview: { proxy: llmProxy },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
