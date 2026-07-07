import { expect, test } from '@playwright/test';

const screenshotDir = 'test-results/phase-8-stage-7';

async function expectStableAppShell(page: import('@playwright/test').Page) {
  await expect(page.getByRole('link', { name: /无限画布/ })).toBeVisible();
  await expect(page.getByRole('link', { name: '我的画布' })).toBeVisible();
}

test('captures Phase 8 Stage 7 key web routes', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '无限画布' }).first()).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/home.png`, fullPage: true });

  await page.goto('/canvas');
  await expectStableAppShell(page);
  await expect(page.getByRole('heading', { name: '无限画布' })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/canvas-library.png`, fullPage: true });

  await page.goto('/image');
  await expectStableAppShell(page);
  await expect(page.getByText('生图工作台').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /生成|开始生成/ }).first()).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/image-workbench.png`, fullPage: true });

  await page.goto('/video');
  await expectStableAppShell(page);
  await expect(page.getByText('视频创作台').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /生成|开始生成/ }).first()).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/video-workbench.png`, fullPage: true });

  await page.goto('/prompts');
  await expectStableAppShell(page);
  await expect(page.getByRole('heading', { name: '提示词中心' })).toBeVisible();
  await expect(page.getByPlaceholder('按标题查询')).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/prompts.png`, fullPage: true });

  await page.goto('/assets');
  await expectStableAppShell(page);
  await expect(page.getByRole('heading', { name: '我的素材' })).toBeVisible();
  await expect(page.getByRole('button', { name: /新增素材/ })).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/assets.png`, fullPage: true });
});

test('captures Phase 8 Stage 7 canvas workspace route', async ({ page }) => {
  await page.goto('/canvas');
  await page
    .getByRole('button', { name: /新建画布/ })
    .first()
    .click();

  await expect(page.getByTitle('双击修改画布名称')).toBeVisible();
  await expect(page.getByRole('button', { name: '文本' })).toBeVisible();
  await page.getByRole('button', { name: '文本' }).click();
  await expect(page.locator('[data-node-id^="text-"]').first()).toBeVisible();
  await page.screenshot({ path: `${screenshotDir}/canvas-workspace.png`, fullPage: true });
});
