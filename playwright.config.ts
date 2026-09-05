import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, fullyParallel: false, workers: 1,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100',
    browserName: 'chromium', channel: process.env.CI ? undefined : 'chrome', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run start -- --port 3100', url: 'http://localhost:3100', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
