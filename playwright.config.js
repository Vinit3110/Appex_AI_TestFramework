// playwright.config.js
// Central configuration for all Playwright test runs.
// Controls browsers, timeouts, screenshot/video capture, and reporting.

const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  // ─── Where to find tests ───────────────────────────────────────────────────
  testDir: './backend/test-engine/web/tests',

  // ─── Run tests in parallel (set to false to debug one at a time) ──────────
  fullyParallel: true,

  // ─── Fail the CI build if you accidentally left test.only in source ────────
  forbidOnly: !!process.env.CI,

  // ─── Retry failed tests (1 retry locally, 2 in CI) ────────────────────────
  retries: process.env.CI ? 2 : 1,

  // ─── Parallel workers ──────────────────────────────────────────────────────
  workers: process.env.CI ? 1 : undefined,

  // ─── Reporters ─────────────────────────────────────────────────────────────
  // html   → opens a rich visual report in browser (npm run test:report)
  // list   → prints live pass/fail lines in the terminal
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'backend/reports/test-results.json' }]
  ],

  // ─── Shared settings for every test ───────────────────────────────────────
  use: {
    // Base URL — set BASE_URL in .env to override
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Capture screenshot only when a test FAILS (used later by AI analyzer)
    screenshot: 'only-on-failure',

    // Record video only on first retry of a failed test
    video: 'on-first-retry',

    // Attach a full trace on first retry (great for debugging)
    trace: 'on-first-retry',

    // Reasonable action timeout
    actionTimeout: 10_000,

    // Navigation timeout for page loads (goto, waitForURL)
    navigationTimeout: 15_000,
  },

  // ─── Test projects (browsers) ──────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Uncomment to also run on Safari / mobile
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  // ─── Output folder for test artifacts (screenshots, videos, traces) ────────
  outputDir: 'backend/reports/artifacts',
});
