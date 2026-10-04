import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
// The service worker keeps one Python cache per Pyodide version.
import { version as pyodideVersion } from "./node_modules/pyodide/package.json";

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
  define: { __PYODIDE_VERSION__: JSON.stringify(pyodideVersion) },
  worker: { format: "es" },
  // The whole curriculum is bundled so the game works offline. It sits in its
  // own chunk (with the YAML reader), apart from React, so a code change doesn't
  // make the browser fetch the lessons again, and vice versa.
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const prose = id.match(/\/content\/year-(\d+)\/[^/]+\/(lecture|spellbook)\.md/);
          if (prose) return `lectures-y${prose[1]}`;
          if (id.includes("/content/auror/")) return "auror";
          if (id.includes("/content/") || id.includes("node_modules/js-yaml")) return "content";
          if (/node_modules\/(react|react-dom|scheduler|zustand)\//.test(id)) return "react";
          return undefined;
        },
      },
    },
  },
  server: { proxy: llmProxy },
  preview: { proxy: llmProxy },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
