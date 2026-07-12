#!/usr/bin/env node

/* global console, document, fetch, process, URL, window, navigator */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { _electron as electron, chromium } from '@playwright/test';
import { preview as startVitePreview } from 'vite';

const root = process.cwd();
const finalOutputRoot = path.join(root, 'docs/design-system/baselines/current');
const outputRoot = path.join(root, 'test-results', 'design-system-current-baseline-next');
const backupOutputRoot = path.join(root, 'test-results', 'design-system-current-baseline-backup');
const webBase = 'http://127.0.0.1:4174';
const fileBase = pathToFileURL(path.join(root, 'dist/index.html')).href;
const consoleProblems = [];
const require = createRequire(import.meta.url);
const writeAck = 'OVERWRITE_FROZEN_CURRENT_BASELINE';
const rewriteAllowed = process.env.DESIGN_SYSTEM_BASELINE_WRITE === writeAck;
const productionInputPaths = [
  'src',
  'electron',
  'public',
  'index.html',
  'tailwind.config.ts',
  'postcss.config.cjs',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'package.json',
  'package-lock.json',
];
const frozenProductionInputTreeHash =
  '3949a6c8406af61b31d39df177a89dd057168b84d5770d6bb12b53a6a7c25764';
let chromiumVersion = '';
let electronVersion = '';
let electronAppVersion = '';
let electronDeviceScaleFactor = 0;
let electronRendererViewport = '';
let electronLocale = '';
let electronTimezone = '';

if (!rewriteAllowed) {
  throw new Error(
    'Refusing to overwrite the frozen baseline. Set ' +
      'DESIGN_SYSTEM_BASELINE_WRITE=OVERWRITE_FROZEN_CURRENT_BASELINE after reviewing the protocol.',
  );
}
const mediaFixture = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d6d3d1" />
        <stop offset="1" stop-color="#78716c" />
      </linearGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".18" />
      </pattern>
    </defs>
    <rect width="1200" height="800" fill="url(#bg)" />
    <rect width="1200" height="800" fill="url(#grid)" />
    <circle cx="600" cy="350" r="96" fill="#ffffff" fill-opacity=".18" />
    <text x="600" y="560" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="44" font-weight="600">MEDIA FIXTURE</text>
  </svg>`;

function run(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCaptureInputs() {
  const repositoryRoot = run('git', ['rev-parse', '--show-toplevel']);
  if (path.resolve(repositoryRoot) !== path.resolve(root)) {
    throw new Error('Run this script from the repository root.');
  }

  const changedInputs = run('git', [
    'status',
    '--porcelain',
    '--untracked-files=all',
    '--',
    ...productionInputPaths,
  ]);
  if (changedInputs) {
    throw new Error(
      'Production rendering inputs have uncommitted changes. Refusing to rewrite current baseline:\n' +
        changedInputs,
    );
  }

  const inputManifest = execFileSync('git', ['ls-files', '-s', '--', ...productionInputPaths], {
    cwd: root,
    encoding: 'utf8',
  });
  const inputTreeHash = createHash('sha256').update(inputManifest).digest('hex');
  if (inputTreeHash !== frozenProductionInputTreeHash) {
    throw new Error(
      'Production rendering inputs no longer match the frozen current baseline. ' +
        'Write new visual evidence under an approved batch instead of overwriting current.',
    );
  }
}

function buildCurrentInputs() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  for (const script of ['build:renderer', 'build:electron']) {
    execFileSync(npmCommand, ['run', script], { cwd: root, stdio: 'inherit' });
  }
}

async function startLocalPreview() {
  return startVitePreview({
    root,
    logLevel: 'error',
    preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  });
}

async function assertPreview() {
  const response = await fetch(webBase);
  if (!response.ok) throw new Error('Local Preview returned HTTP ' + response.status);
  const servedHtml = await response.text();
  const builtHtml = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
  if (servedHtml !== builtHtml) {
    throw new Error('Local Preview HTML does not match the freshly built dist/index.html.');
  }
}

async function closeLocalPreview(previewServer) {
  await new Promise((resolve, reject) => {
    previewServer.httpServer.close((error) => (error ? reject(error) : resolve()));
  });
}

function prepareStagingBaseline() {
  const frozenReadmePath = path.join(finalOutputRoot, 'README.md');
  if (!fs.existsSync(frozenReadmePath)) {
    throw new Error('Frozen baseline README is missing: ' + frozenReadmePath);
  }
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.copyFileSync(frozenReadmePath, path.join(outputRoot, 'README.md'));
}

function outputPath(...segments) {
  const filePath = path.join(outputRoot, ...segments);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  return filePath;
}

async function installNetworkFixture(context) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    const parsedUrl = new URL(url);
    const isPreviewOrigin = parsedUrl.origin === webBase;
    if (isPreviewOrigin && parsedUrl.pathname === '/__resource-proxy') {
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: mediaFixture });
      return;
    }
    if (isPreviewOrigin && parsedUrl.pathname === '/__ai-proxy') {
      await route.abort('blockedbyclient');
      return;
    }
    if (url.startsWith('infinite-canvas://resource-proxy')) {
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: mediaFixture });
      return;
    }
    if (url.startsWith('infinite-canvas://ai-proxy')) {
      await route.abort('blockedbyclient');
      return;
    }
    if (/^https?:/i.test(url) && !isPreviewOrigin) {
      if (request.resourceType() === 'image') {
        await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: mediaFixture });
      } else {
        await route.abort('blockedbyclient');
      }
      return;
    }
    await route.continue();
  });
}

async function waitForApp(page, expectedTheme = 'dark') {
  await page.locator('body').waitFor({ state: 'visible' });
  await page.waitForFunction(
    (theme) => document.documentElement.style.colorScheme === theme,
    expectedTheme,
  );
  await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
}

async function gotoWeb(page, route, theme, marker) {
  await page.goto(`${webBase}${route}`, { waitUntil: 'domcontentloaded' });
  await waitForApp(page, theme);
  if (marker) await marker(page).waitFor({ state: 'visible', timeout: 15_000 });
}

async function gotoFile(page, hash, marker) {
  await page.goto(`${fileBase}${hash}`, { waitUntil: 'domcontentloaded' });
  await waitForApp(page, 'dark');
  await page.getByText(marker).first().waitFor({ state: 'visible', timeout: 15_000 });
}

async function shot(page, relativePath) {
  const filePath = outputPath(...relativePath.split('/'));
  await page.waitForTimeout(650);
  await page.screenshot({
    path: filePath,
    fullPage: false,
    animations: 'disabled',
    caret: 'hide',
  });
  console.log(`captured ${relativePath}`);
}

async function switchToLight(page) {
  const button = page.getByRole('button', { name: '切换到浅色主题' }).first();
  await button.waitFor({ state: 'visible' });
  await button.click();
  await page.waitForFunction(() => document.documentElement.style.colorScheme === 'light');
  await page.waitForTimeout(500);
}

function attachDiagnostics(page, label) {
  page.on('pageerror', (error) => consoleProblems.push(`${label}: pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleProblems.push(`${label}: console: ${message.text()}`);
  });
}

async function captureMainRoutes(page, directory, theme) {
  const routes = [
    ['/', '01-home.png', (p) => p.getByRole('heading', { name: '无限画布' }).first()],
    ['/canvas', '02-canvas-library.png', (p) => p.getByRole('heading', { name: '还没有画布' })],
    ['/image', '03-image-workbench.png', (p) => p.getByText('生图工作台').first()],
    ['/video', '04-video-workbench.png', (p) => p.getByText('视频创作台').first()],
    ['/prompts', '05-prompts.png', (p) => p.getByRole('heading', { name: '提示词中心' })],
    ['/assets', '06-assets.png', (p) => p.getByRole('heading', { name: '我的素材' })],
  ];
  for (const [route, file, marker] of routes) {
    await gotoWeb(page, route, theme, marker);
    await shot(page, `${directory}/${file}`);
  }
}

async function captureConfig(page, directory, theme, includeWebdav) {
  await gotoWeb(page, '/', theme, (p) => p.getByRole('heading', { name: '无限画布' }).first());
  await page.getByRole('button', { name: '配置' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await shot(page, `${directory}/07-config-channels.png`);
  if (includeWebdav) {
    await page.getByRole('tab', { name: 'WebDAV' }).click();
    await shot(page, `${directory}/08-config-webdav.png`);
  }
  await page.keyboard.press('Escape');
}

async function captureCatalogDialogs(page, directory, theme) {
  await gotoWeb(page, '/prompts', theme, (p) => p.getByRole('heading', { name: '提示词中心' }));
  await page.getByRole('heading', { name: 'RAW iPhone 质感：地铁站' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await shot(page, `${directory}/09-prompt-detail.png`);
  await page.keyboard.press('Escape');

  await gotoWeb(page, '/assets', theme, (p) => p.getByRole('heading', { name: '我的素材' }));
  await page.getByRole('button', { name: /新增素材/ }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await shot(page, `${directory}/10-asset-create.png`);
  await page.keyboard.press('Escape');
}

async function dragNodeTo(page, prefix, x, y) {
  const node = page.locator(`[data-node-id^="${prefix}-"]`).last();
  await node.waitFor({ state: 'visible' });
  const box = await node.boundingBox();
  if (!box) throw new Error(`No box for ${prefix} node`);
  await page.mouse.move(box.x + 48, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(x + 48, y + 20, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(120);
}

async function addCanvasNodes(page) {
  const nodes = [
    ['文本', 'text', 110, 150],
    ['生成配置', 'config', 550, 150],
    ['图片', 'image', 990, 150],
    ['视频', 'video', 120, 500],
    ['音频', 'audio', 690, 560],
  ];
  for (const [buttonName, prefix, x, y] of nodes) {
    await page.getByRole('button', { name: buttonName, exact: true }).click();
    await dragNodeTo(page, prefix, x, y);
  }
}

async function captureCanvas(page, directory, theme, includePanels) {
  await gotoWeb(page, '/canvas', theme, (p) => p.getByRole('heading', { name: '还没有画布' }));
  await page
    .getByRole('button', { name: /新建画布/ })
    .first()
    .click();
  await page.getByTitle('双击修改画布名称').waitFor({ state: 'visible' });
  await shot(page, `${directory}/11-canvas-empty.png`);
  await addCanvasNodes(page);
  await shot(page, `${directory}/12-canvas-node-types.png`);
  if (!includePanels) return;

  const appearanceButton = page.getByRole('button', { name: '画布外观' });
  await appearanceButton.click();
  await page.getByText('主题模式', { exact: true }).waitFor({ state: 'visible' });
  await shot(page, `${directory}/13-canvas-appearance.png`);
  await appearanceButton.click();
  await page.getByText('主题模式', { exact: true }).waitFor({ state: 'hidden' });

  await page.getByRole('button', { name: '快捷键' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await shot(page, `${directory}/14-canvas-shortcuts.png`);
  await page.locator('.ant-modal-close').last().click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });

  await page.locator('button').filter({ hasText: 'Agent' }).first().click();
  await page.getByText('画布助手', { exact: true }).waitFor({ state: 'visible' });
  await shot(page, `${directory}/15-canvas-assistant.png`);
}

async function captureDesktop(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await installNetworkFixture(context);
  const page = await context.newPage();
  attachDiagnostics(page, `web-desktop-${theme}`);
  await gotoWeb(page, '/', 'dark', (p) => p.getByRole('heading', { name: '无限画布' }).first());
  if (theme === 'light') await switchToLight(page);
  const directory = `web/desktop-${theme}`;
  await captureMainRoutes(page, directory, theme);
  await captureConfig(page, directory, theme, theme === 'dark');
  if (theme === 'dark') await captureCatalogDialogs(page, directory, theme);
  await captureCanvas(page, directory, theme, true);
  await context.close();
}

async function captureMobile(browser, theme) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await installNetworkFixture(context);
  const page = await context.newPage();
  attachDiagnostics(page, `web-mobile-${theme}`);
  await gotoWeb(page, '/', 'dark', (p) => p.getByRole('heading', { name: '无限画布' }).first());
  if (theme === 'light') await switchToLight(page);
  const directory = `web/mobile-${theme}`;

  const routes =
    theme === 'dark'
      ? [
          ['/', '01-home.png', (p) => p.getByRole('heading', { name: '无限画布' }).first()],
          [
            '/canvas',
            '02-canvas-library.png',
            (p) => p.getByRole('heading', { name: '还没有画布' }),
          ],
          ['/image', '03-image-workbench.png', (p) => p.getByRole('button', { name: '参数' })],
          ['/video', '05-video-workbench.png', (p) => p.getByRole('button', { name: '参数' })],
          ['/prompts', '07-prompts.png', (p) => p.getByRole('heading', { name: '提示词中心' })],
          ['/assets', '08-assets.png', (p) => p.getByRole('heading', { name: '我的素材' })],
        ]
      : [
          ['/', '01-home.png', (p) => p.getByRole('heading', { name: '无限画布' }).first()],
          ['/image', '02-image-workbench.png', (p) => p.getByRole('button', { name: '参数' })],
          ['/prompts', '03-prompts.png', (p) => p.getByRole('heading', { name: '提示词中心' })],
        ];

  for (const [route, file, marker] of routes) {
    await gotoWeb(page, route, theme, marker);
    await shot(page, `${directory}/${file}`);
    if (theme === 'dark' && route === '/image') {
      await page.getByRole('button', { name: '参数' }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await shot(page, `${directory}/04-image-parameters.png`);
      await page.keyboard.press('Escape');
    }
    if (theme === 'dark' && route === '/video') {
      await page.getByRole('button', { name: '参数' }).click();
      await page.getByRole('dialog').waitFor({ state: 'visible' });
      await shot(page, `${directory}/06-video-parameters.png`);
      await page.keyboard.press('Escape');
    }
  }

  await gotoWeb(page, '/', theme, (p) => p.getByRole('heading', { name: '无限画布' }).first());
  await page.getByRole('button', { name: '打开导航菜单' }).click();
  await page.getByText('导航', { exact: true }).waitFor({ state: 'visible' });
  await shot(page, `${directory}/${theme === 'dark' ? '09' : '04'}-mobile-navigation.png`);
  await page.keyboard.press('Escape');

  if (theme === 'dark') {
    await page.getByRole('button', { name: '配置' }).click();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await shot(page, `${directory}/10-config.png`);
    await page.keyboard.press('Escape');
  }

  await gotoWeb(page, '/canvas', theme, (p) => p.getByRole('heading', { name: '还没有画布' }));
  await page
    .getByRole('button', { name: /新建画布/ })
    .first()
    .click();
  await page.getByTitle('双击修改画布名称').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '文本', exact: true }).click();
  await shot(page, `${directory}/${theme === 'dark' ? '11' : '05'}-canvas-workspace.png`);
  await context.close();
}

async function capturePromptStates(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await installNetworkFixture(context);
  let releasePromptRequest = () => undefined;
  const responseGate = new Promise((resolve) => {
    releasePromptRequest = resolve;
  });
  await context.route('**/data/local-prompts.json', async (route) => {
    await responseGate;
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'BASELINE FIXTURE ERROR' }),
    });
  });

  const page = await context.newPage();
  attachDiagnostics(page, 'web-desktop-dark-prompt-states');
  try {
    await page.goto(webBase + '/prompts', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.style.colorScheme === 'dark');
    await page.getByRole('heading', { name: '提示词中心' }).waitFor({ state: 'visible' });
    await page.locator('.ant-spin').waitFor({ state: 'visible' });
    await shot(page, 'web/desktop-dark/16-prompts-loading.png');

    releasePromptRequest();
    await page.getByText('本地提示词库读取失败').waitFor({ state: 'visible' });
    await page.getByText('没有找到匹配的提示词').waitFor({ state: 'visible' });
    await shot(page, 'web/desktop-dark/17-prompts-error.png');
  } finally {
    releasePromptRequest();
    await context.close();
  }
}

async function captureFileRoutes(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await installNetworkFixture(context);
  const page = await context.newPage();
  attachDiagnostics(page, 'electron-file-dark');
  const routes = [
    ['#/', '01-home.png', '开始使用'],
    ['#/canvas', '02-canvas-library.png', '新建画布'],
    ['#/image', '03-image-workbench.png', '生图工作台'],
    ['#/video', '04-video-workbench.png', '视频创作台'],
    ['#/prompts', '05-prompts.png', '提示词中心'],
    ['#/assets', '06-assets.png', '我的素材'],
  ];
  for (const [hash, file, marker] of routes) {
    await gotoFile(page, hash, marker);
    await shot(page, `electron-file/desktop-dark/${file}`);
  }
  await gotoFile(page, '#/canvas', '新建画布');
  await page
    .getByRole('button', { name: /新建画布/ })
    .first()
    .click();
  await page.getByTitle('双击修改画布名称').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: '文本', exact: true }).click();
  await shot(page, 'electron-file/desktop-dark/07-canvas-workspace.png');
  await context.close();
}

async function gotoElectron(page, hash, marker) {
  const baseUrl = page.url().split('#')[0];
  await page.goto(baseUrl + hash, { waitUntil: 'domcontentloaded' });
  await waitForApp(page, 'dark');
  await page.getByText(marker).first().waitFor({ state: 'visible', timeout: 15_000 });
}

async function captureElectronRoutes() {
  const isolatedHome = path.join(root, 'test-results', 'design-system-electron-home');
  fs.rmSync(isolatedHome, { recursive: true, force: true });
  fs.mkdirSync(isolatedHome, { recursive: true });
  const isolatedMainEntryPath = path.join(isolatedHome, 'baseline-main.cjs');
  fs.writeFileSync(
    isolatedMainEntryPath,
    [
      "'use strict';",
      "process.env.DESIGN_SYSTEM_BASELINE_MAIN_NETWORK_BLOCKED = 'true';",
      "globalThis.fetch = async () => { throw new Error('Network blocked by design-system baseline capture'); };",
      'require(' + JSON.stringify(path.join(root, 'dist-electron', 'main', 'index.cjs')) + ');',
      '',
    ].join('\n'),
  );

  const electronApp = await electron.launch({
    args: [
      isolatedMainEntryPath,
      '--user-data-dir=' + path.join(isolatedHome, 'profile'),
      '--host-resolver-rules=MAP * 0.0.0.0, EXCLUDE localhost',
    ],
    cwd: root,
    env: {
      ...process.env,
      HOME: isolatedHome,
      USERPROFILE: isolatedHome,
      VITE_DEV_SERVER_URL: '',
      ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
      LANG: 'zh_CN.UTF-8',
      TZ: 'Asia/Shanghai',
    },
  });

  try {
    const mainNetworkBlocked = await electronApp.evaluate(
      () => process.env.DESIGN_SYSTEM_BASELINE_MAIN_NETWORK_BLOCKED === 'true',
    );
    if (!mainNetworkBlocked) {
      throw new Error('Electron main-process network blocker did not load.');
    }
    electronVersion = await electronApp.evaluate(() => process.versions.electron || '');
    electronAppVersion = await electronApp.evaluate(({ app }) => app.getVersion());
    const context = electronApp.context();
    await installNetworkFixture(context);
    await context.setOffline(true);
    const page = await electronApp.firstWindow();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const electronRuntime = await page.evaluate(() => ({
      devicePixelRatio: window.devicePixelRatio,
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewport: window.innerWidth + 'x' + window.innerHeight + ' CSS px',
    }));
    electronDeviceScaleFactor = electronRuntime.devicePixelRatio;
    electronRendererViewport = electronRuntime.viewport;
    electronLocale = electronRuntime.locale;
    electronTimezone = electronRuntime.timezone;
    attachDiagnostics(page, 'electron-runtime-dark');

    const routes = [
      ['#/', '01-home.png', '开始使用'],
      ['#/canvas', '02-canvas-library.png', '新建画布'],
      ['#/image', '03-image-workbench.png', '生图工作台'],
      ['#/video', '04-video-workbench.png', '视频创作台'],
      ['#/prompts', '05-prompts.png', '提示词中心'],
      ['#/assets', '06-assets.png', '我的素材'],
    ];
    for (const [hash, file, marker] of routes) {
      await gotoElectron(page, hash, marker);
      await shot(page, 'electron/desktop-dark/' + file);
    }

    await gotoElectron(page, '#/canvas', '新建画布');
    await page
      .getByRole('button', { name: /新建画布/ })
      .first()
      .click();
    await page.getByTitle('双击修改画布名称').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: '文本', exact: true }).click();
    await shot(page, 'electron/desktop-dark/07-canvas-workspace.png');
  } finally {
    await electronApp.close();
  }
}

function collectPngMetadata(directory, relativePrefix = '') {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.posix.join(relativePrefix, entry.name);
      if (entry.isDirectory()) return collectPngMetadata(absolutePath, relativePath);
      if (!entry.isFile() || !entry.name.endsWith('.png')) return [];
      const bytes = fs.readFileSync(absolutePath);
      return [
        {
          path: relativePath,
          width: bytes.readUInt32BE(16),
          height: bytes.readUInt32BE(20),
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
        },
      ];
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}

function normalizedConsoleProblems() {
  return consoleProblems.map((problem) => problem.split(root).join('<repo>'));
}

function writeCaptureRecords() {
  const files = collectPngMetadata(outputRoot);
  const normalizedProblems = normalizedConsoleProblems();
  const counts = files.reduce((result, file) => {
    const family = file.path.split('/').slice(0, 2).join('/');
    result[family] = (result[family] || 0) + 1;
    return result;
  }, {});
  const metadata = {
    schemaVersion: 1,
    kind: 'pre-change-current-visual-baseline',
    capturedAt: new Date().toISOString(),
    sourceRevision: run('git', ['rev-parse', 'HEAD']),
    productionInputTreeSha256: frozenProductionInputTreeHash,
    captureScriptSha256: createHash('sha256')
      .update(fs.readFileSync(fileURLToPath(import.meta.url)))
      .digest('hex'),
    application: {
      name: require('../package.json').name,
      version: require('../package.json').version,
      electronReportedVersion: electronAppVersion,
    },
    runtime: {
      os: os.type() + ' ' + os.release(),
      architecture: process.arch,
      node: process.version,
      npm: run('npm', ['--version']),
      playwright: require('@playwright/test/package.json').version,
      chromium: chromiumVersion,
      electron: electronVersion,
      tailwind: require('tailwindcss/package.json').version,
    },
    electronRuntime: {
      mode: 'isolated unpackaged runtime loading the production main bundle',
      deviceScaleFactor: electronDeviceScaleFactor,
      rendererViewport: electronRendererViewport,
      locale: electronLocale,
      timezone: electronTimezone,
    },
    captureContract: {
      webDesktopViewport: '1440x900 CSS px',
      webMobileViewport: '390x844 CSS px',
      electronWindow: '1280x800 native window; Retina screenshot is device-pixel scaled',
      locale: 'zh-CN',
      timezone: 'Asia/Shanghai',
      reducedMotion: 'reduce',
      serviceWorkers: 'blocked',
      externalMedia: 'deterministic MEDIA FIXTURE SVG',
      externalNonMediaRequests: 'blocked',
      previewProxyPaths: '/__ai-proxy blocked; /__resource-proxy fulfilled with fixture',
      electronRendererNetwork: 'offline plus request interception',
      electronMainNetwork: 'global fetch blocked before production main entry is required',
      preview: 'fresh in-process Vite Preview; served HTML matched dist/index.html',
      persistedUserProfile: 'not used',
      realServices: 'AI, WebDAV, online assistant and local Agent not called',
      screenshot: 'viewport only; animations disabled; caret hidden; 650ms portal settle',
    },
    counts,
    screenshotCount: files.length,
    files,
  };
  fs.writeFileSync(
    path.join(outputRoot, 'capture-metadata.json'),
    JSON.stringify(metadata, null, 2) + '\n',
  );
  fs.writeFileSync(
    path.join(outputRoot, 'diagnostics.txt'),
    normalizedProblems.length
      ? normalizedProblems.join('\n') + '\n'
      : 'No pageerror or console.error events were observed.\n',
  );
}

function expectedScreenshotMatrix() {
  const families = [
    {
      directory: 'web/desktop-dark',
      width: 1440,
      height: 900,
      files: [
        '01-home.png',
        '02-canvas-library.png',
        '03-image-workbench.png',
        '04-video-workbench.png',
        '05-prompts.png',
        '06-assets.png',
        '07-config-channels.png',
        '08-config-webdav.png',
        '09-prompt-detail.png',
        '10-asset-create.png',
        '11-canvas-empty.png',
        '12-canvas-node-types.png',
        '13-canvas-appearance.png',
        '14-canvas-shortcuts.png',
        '15-canvas-assistant.png',
        '16-prompts-loading.png',
        '17-prompts-error.png',
      ],
    },
    {
      directory: 'web/desktop-light',
      width: 1440,
      height: 900,
      files: [
        '01-home.png',
        '02-canvas-library.png',
        '03-image-workbench.png',
        '04-video-workbench.png',
        '05-prompts.png',
        '06-assets.png',
        '07-config-channels.png',
        '11-canvas-empty.png',
        '12-canvas-node-types.png',
        '13-canvas-appearance.png',
        '14-canvas-shortcuts.png',
        '15-canvas-assistant.png',
      ],
    },
    {
      directory: 'web/mobile-dark',
      width: 390,
      height: 844,
      files: [
        '01-home.png',
        '02-canvas-library.png',
        '03-image-workbench.png',
        '04-image-parameters.png',
        '05-video-workbench.png',
        '06-video-parameters.png',
        '07-prompts.png',
        '08-assets.png',
        '09-mobile-navigation.png',
        '10-config.png',
        '11-canvas-workspace.png',
      ],
    },
    {
      directory: 'web/mobile-light',
      width: 390,
      height: 844,
      files: [
        '01-home.png',
        '02-image-workbench.png',
        '03-prompts.png',
        '04-mobile-navigation.png',
        '05-canvas-workspace.png',
      ],
    },
    {
      directory: 'electron-file/desktop-dark',
      width: 1440,
      height: 900,
      files: [
        '01-home.png',
        '02-canvas-library.png',
        '03-image-workbench.png',
        '04-video-workbench.png',
        '05-prompts.png',
        '06-assets.png',
        '07-canvas-workspace.png',
      ],
    },
    {
      directory: 'electron/desktop-dark',
      width: 2560,
      height: 1536,
      files: [
        '01-home.png',
        '02-canvas-library.png',
        '03-image-workbench.png',
        '04-video-workbench.png',
        '05-prompts.png',
        '06-assets.png',
        '07-canvas-workspace.png',
      ],
    },
  ];
  return new Map(
    families.flatMap((family) =>
      family.files.map((file) => [
        path.posix.join(family.directory, file),
        { width: family.width, height: family.height },
      ]),
    ),
  );
}

function validateExpectedDiagnostics() {
  const expected = new Map([
    [
      'web-desktop-dark-prompt-states: console: Failed to load resource: the server responded with a status of 503 (Service Unavailable)',
      2,
    ],
    [
      'electron-file-dark: console: Fetch API cannot load file://<repo>/dist/data/local-prompts.json. URL scheme "file" is not supported.',
      3,
    ],
  ]);
  const actual = normalizedConsoleProblems().reduce((counts, problem) => {
    counts.set(problem, (counts.get(problem) || 0) + 1);
    return counts;
  }, new Map());
  if (
    actual.size !== expected.size ||
    [...expected].some(([problem, count]) => actual.get(problem) !== count)
  ) {
    throw new Error(
      'Unexpected browser diagnostics. Refusing to publish: ' +
        JSON.stringify({
          expected: Object.fromEntries(expected),
          actual: Object.fromEntries(actual),
        }),
    );
  }
}

function validateStagedBaseline() {
  const expectedFiles = expectedScreenshotMatrix();
  const metadata = JSON.parse(
    fs.readFileSync(path.join(outputRoot, 'capture-metadata.json'), 'utf8'),
  );
  if (
    metadata.screenshotCount !== expectedFiles.size ||
    metadata.files?.length !== expectedFiles.size
  ) {
    throw new Error('Staged screenshot manifest must contain exactly 59 PNG files.');
  }
  const metadataFiles = new Map(metadata.files.map((file) => [file.path, file]));
  for (const [relativePath, expectedSize] of expectedFiles) {
    const record = metadataFiles.get(relativePath);
    if (!record || record.width !== expectedSize.width || record.height !== expectedSize.height) {
      throw new Error('Staged screenshot is missing or has an unexpected size: ' + relativePath);
    }
    const bytes = fs.readFileSync(path.join(outputRoot, relativePath));
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (
      bytes.length !== record.bytes ||
      hash !== record.sha256 ||
      bytes.readUInt32BE(16) !== record.width ||
      bytes.readUInt32BE(20) !== record.height
    ) {
      throw new Error('Staged screenshot metadata mismatch: ' + relativePath);
    }
  }
  if ([...metadataFiles.keys()].some((relativePath) => !expectedFiles.has(relativePath))) {
    throw new Error('Staged screenshot manifest contains an unexpected path.');
  }
  validateExpectedDiagnostics();
  for (const requiredFile of ['README.md', 'capture-metadata.json', 'diagnostics.txt']) {
    if (!fs.existsSync(path.join(outputRoot, requiredFile))) {
      throw new Error('Staged baseline is missing ' + requiredFile);
    }
  }
}

function publishStagedBaseline() {
  fs.rmSync(backupOutputRoot, { recursive: true, force: true });
  fs.renameSync(finalOutputRoot, backupOutputRoot);
  try {
    fs.renameSync(outputRoot, finalOutputRoot);
  } catch (error) {
    fs.renameSync(backupOutputRoot, finalOutputRoot);
    throw error;
  }
  fs.rmSync(backupOutputRoot, { recursive: true, force: true });
}

assertCaptureInputs();
buildCurrentInputs();
const previewServer = await startLocalPreview();
try {
  await assertPreview();
  prepareStagingBaseline();

  const browser = await chromium.launch({
    headless: true,
    args: ['--allow-file-access-from-files'],
  });
  try {
    chromiumVersion = browser.version();
    await captureDesktop(browser, 'dark');
    await captureDesktop(browser, 'light');
    await captureMobile(browser, 'dark');
    await captureMobile(browser, 'light');
    await capturePromptStates(browser);
    await captureFileRoutes(browser);
  } finally {
    await browser.close();
  }

  await captureElectronRoutes();
  writeCaptureRecords();
  validateStagedBaseline();
  publishStagedBaseline();
} finally {
  await closeLocalPreview(previewServer);
}

if (consoleProblems.length) {
  console.log('DIAGNOSTICS');
  for (const problem of consoleProblems) console.log(problem);
}
