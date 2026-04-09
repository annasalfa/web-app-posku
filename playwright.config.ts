import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

const authFile = `${process.cwd()}/playwright/.auth/user.json`;
const playwrightPort = Number(process.env.PLAYWRIGHT_PORT ?? "3100");
const baseURL = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "public",
      testMatch: /auth-redirect\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "authenticated",
      dependencies: ["setup"],
      testMatch: /.*\.spec\.ts/,
      testIgnore: /auth-redirect\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
  ],
  webServer: {
    command: `npm run start -- --port ${playwrightPort}`,
    url: `${baseURL}/id/login`,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
