import { defineConfig, devices } from "@playwright/test";

/**
 * Drie flows, twee viewports. Mobiel is de norm, desktop de controle.
 * Vereist een draaiende database (zie README) en een geseede gebruiker.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // Normaal gesproken regelt `playwright install` de browser. In omgevingen
    // waar er al een Chromium staat, wijs je die aan met PW_CHROMIUM_PATH.
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    {
      // iPhone 14-formaat op Chromium: WebKit is niet overal beschikbaar en de
      // schermmaat is wat we willen toetsen, niet de engine.
      name: "mobiel",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 664 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000/login",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
