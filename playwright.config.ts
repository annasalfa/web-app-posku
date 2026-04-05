import {loadEnvConfig} from '@next/env';
import {defineConfig, devices} from '@playwright/test';

loadEnvConfig(process.cwd());

const authFile = `${process.cwd()}/playwright/.auth/user.json`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'public',
      testMatch: /auth-redirect\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
      testIgnore: /auth-redirect\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000/id/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
