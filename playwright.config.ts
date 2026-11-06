import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3200);
// Navigateur système facultatif (environnements sans téléchargement des navigateurs Playwright)
const executablePath = process.env.PLAYWRIGHT_CHROME_PATH;
const launchOptions = {
  ...(executablePath ? { executablePath } : {}),
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
};

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e-results.json" }]],
  use: {
    baseURL: `http://localhost:${port}`,
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions }, testIgnore: /responsive|a11y/ },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
