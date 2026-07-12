import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/design-lab',
  fullyParallel: false,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4175',
    contextOptions: {
      reducedMotion: 'no-preference',
    },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev:design-lab -- --port 4175 --strictPort',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:4175/design-lab.html',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
