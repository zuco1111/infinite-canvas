#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');

const rootDir = process.cwd();
const indexPath = path.join(rootDir, 'dist', 'index.html');
const screenshotDir = path.join(rootDir, 'test-results', 'phase-8-stage-7');

const routes = [
  { hash: '#/', label: 'home', text: '开始使用' },
  { hash: '#/canvas', label: 'canvas-library', text: '新建画布' },
  { hash: '#/image', label: 'image-workbench', text: '生图工作台' },
  { hash: '#/video', label: 'video-workbench', text: '视频创作台' },
  { hash: '#/prompts', label: 'prompts', text: '提示词中心' },
  { hash: '#/assets', label: 'assets', text: '我的素材' },
];

async function main() {
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run `npm run build` before desktop hash smoke.');
  }
  fs.mkdirSync(screenshotDir, { recursive: true });

  const baseUrl = pathToFileURL(indexPath).href;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    for (const route of routes) {
      await page.goto(`${baseUrl}${route.hash}`, { waitUntil: 'domcontentloaded' });
      await page.getByText(route.text).first().waitFor({ state: 'visible', timeout: 15_000 });
      await page.screenshot({
        path: path.join(screenshotDir, `desktop-hash-${route.label}.png`),
        fullPage: true,
      });
      console.log(`Desktop hash route smoke passed: ${route.hash}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
