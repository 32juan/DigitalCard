const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }]
  ],
  outputDir: "test-results/playwright",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
    acceptDownloads: true,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npx http-server . -a 127.0.0.1 -p 4173 -c-1 --silent",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: "mobile-360",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: "mobile-390",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: "mobile-430",
      use: {
        viewport: { width: 430, height: 932 },
        isMobile: true,
        hasTouch: true
      }
    },
    {
      name: "tablet-768",
      use: {
        viewport: { width: 768, height: 1024 }
      }
    },
    {
      name: "desktop-1280",
      use: {
        viewport: { width: 1280, height: 900 }
      }
    }
  ]
});
