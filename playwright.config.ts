import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: "http://localhost:4173",
    // The offline test turns the service worker back on for itself; elsewhere it
    // would hide requests from page.route (the fake AI Professor).
    serviceWorkers: "block",
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
