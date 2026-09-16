import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  testMatch: 'capture-screenshots.spec.ts',
  outputDir: './playwright-capture-results',
  use: {
    screenshot: 'on',
    video: 'off',
    trace: 'off',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    baseURL: 'http://localhost:5173',
  },
  reporter: 'list',
  timeout: 60000,
  workers: 1,
  fullyParallel: false,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
