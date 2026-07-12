import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { expectedInventoryIds } from './design-lab-test-data';

function currentPreview(page: import('@playwright/test').Page) {
  return page.frameLocator('[data-testid="design-lab-preview-frame"]');
}

async function selectCatalogFilter(
  preview: ReturnType<typeof currentPreview>,
  filterTestId: string,
  option: string,
) {
  await preview.getByTestId(filterTestId).click();
  const visibleOption = preview.locator('.ant-select-dropdown').getByText(option, { exact: true });
  await expect(visibleOption).toBeVisible();
  await visibleOption.click();
}

async function openDesignLab(page: import('@playwright/test').Page) {
  await page.goto('/design-lab.html');
  await expect(page.getByTestId('design-lab-root')).toBeVisible();
  const preview = currentPreview(page);
  await expect(preview.getByTestId('design-lab-preview-root')).toBeVisible();
  await expect(preview.getByText('显示 40 / 40 项')).toBeVisible();
  await expect(preview.getByText('resolving')).toHaveCount(0);
  return preview;
}

test('exposes the complete searchable current-state inventory', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol !== 'data:' && url.origin !== 'http://127.0.0.1:4175') {
      externalRequests.push(request.url());
    }
  });

  const preview = await openDesignLab(page);
  const actualIds = await preview
    .locator('[data-inventory-id]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-inventory-id')));
  expect(new Set(actualIds)).toEqual(new Set(expectedInventoryIds));
  await expect(preview.locator('[data-audit-group]')).toHaveCount(10);
  await expect(preview.getByText('主题与颜色来源', { exact: true })).toBeVisible();
  expect(externalRequests).toEqual([]);

  await preview.getByText('库存顺序', { exact: true }).click();
  const inventoryOrderIds = await preview
    .locator('[data-inventory-id]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-inventory-id')));
  expect(inventoryOrderIds).toEqual(expectedInventoryIds);
  await preview.getByText('相似项对比', { exact: true }).click();

  await preview.getByRole('searchbox', { name: '搜索库存' }).fill('PRM-C06');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(1);
  await expect(preview.locator('[data-inventory-id="PRM-C06"]')).toBeVisible();
  await expect(preview.getByText('显示 1 / 40 项')).toBeVisible();
  await preview.getByRole('link', { name: '跳转到库存锚点 PRM-C06' }).click();
  await expect
    .poll(
      () =>
        page
          .frames()
          .find((frame) => frame.url().includes('design-lab-preview.html'))
          ?.url() || '',
    )
    .toContain('#design-lab-prm-c06');

  await preview.getByRole('button', { name: '重置库存筛选' }).click();
  await selectCatalogFilter(
    preview,
    'design-lab-catalog-audit-group-filter',
    '文本、数值与文件输入',
  );
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(5);
  await expect(preview.locator('[data-audit-group="primitive-entry-pickers"]')).toBeVisible();
  await preview.getByRole('button', { name: '重置库存筛选' }).click();
  const layerFilter = preview.getByTestId('design-lab-catalog-layer-filter');
  await expect(layerFilter).toHaveClass(/ant-select/);
  await expect(layerFilter.locator('.ant-select-arrow')).toBeVisible();
  await selectCatalogFilter(preview, 'design-lab-catalog-layer-filter', 'Primitive');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(17);

  await selectCatalogFilter(preview, 'design-lab-catalog-source-filter', 'Radix');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(1);
  await expect(preview.locator('#design-lab-prm-c06')).toHaveAttribute(
    'data-inventory-id',
    'PRM-C06',
  );
});

test('synchronizes theme, real iframe viewport and the motion-freeze review tool', async ({
  page,
}) => {
  const preview = await openDesignLab(page);

  await page.getByTestId('design-lab-theme-dark').click();
  await expect(page.getByTestId('design-lab-preview')).toHaveAttribute(
    'data-design-lab-theme',
    'dark',
  );
  await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
    'data-design-lab-theme',
    'dark',
  );

  await page.getByTestId('design-lab-viewport-mobile').click();
  await expect(page.getByTestId('design-lab-preview')).toHaveAttribute(
    'data-design-lab-viewport',
    'mobile',
  );
  await expect
    .poll(() =>
      page
        .getByTestId('design-lab-preview-frame')
        .evaluate((frame) => Math.round(frame.getBoundingClientRect().width)),
    )
    .toBe(390);
  await expect.poll(() => preview.locator('body').evaluate(() => window.innerWidth)).toBe(390);

  await page.getByRole('switch', { name: '冻结动态预览（评审工具）' }).click();
  await expect(page.getByTestId('design-lab-preview')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'true',
  );
  await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'true',
  );
  await expect
    .poll(() =>
      preview
        .locator('html')
        .evaluate((root) => root.classList.contains('design-lab-motion-freeze')),
    )
    .toBe(true);
});

test('keeps real reduced-motion media preference separate from motion freeze', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const preview = await openDesignLab(page);
  const prefersReducedMotion = () =>
    preview
      .locator('html')
      .evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  await expect.poll(prefersReducedMotion).toBe(false);
  await expect(page.getByTestId('design-lab-preview')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'false',
  );
  await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'false',
  );

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect.poll(prefersReducedMotion).toBe(true);
  await expect(page.getByTestId('design-lab-preview')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'false',
  );
  await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
    'data-design-lab-motion-freeze',
    'false',
  );
  await expect
    .poll(() =>
      preview
        .locator('html')
        .evaluate((root) => root.classList.contains('design-lab-motion-freeze')),
    )
    .toBe(false);
});

test('keeps current primitive interactions live in deterministic fixtures', async ({ page }) => {
  const preview = await openDesignLab(page);
  const search = preview.getByRole('searchbox', { name: '搜索库存' });

  await search.fill('PRM-C08');
  const interactiveSwitch = preview.getByRole('switch', { name: 'Interactive checked switch' });
  await expect(interactiveSwitch).toHaveAttribute('aria-checked', 'true');
  await interactiveSwitch.click();
  await expect(interactiveSwitch).toHaveAttribute('aria-checked', 'false');

  await search.fill('PRM-C05');
  await expect(preview.getByRole('spinbutton', { name: 'W', exact: true })).toHaveValue('1024');
  await expect(preview.getByRole('spinbutton', { name: 'H', exact: true })).toHaveValue('1024');
  await expect(preview.getByRole('spinbutton', { name: '生成张数' })).toHaveValue('1');

  await search.fill('PRM-C06');
  const radixSelect = preview.getByRole('combobox', { name: 'Shared Radix current select' });
  await expect(radixSelect.locator('.canvas-select-chevron')).toBeVisible();
  await radixSelect.click();
  await expect(preview.getByRole('option', { name: 'gpt-5', exact: true })).toBeVisible();
  await preview.getByRole('option', { name: 'gpt-5', exact: true }).click();
  await expect(radixSelect).toContainText('gpt-5');
});

test('captures Select portals, Tooltip overlay and the mobile C06 current state', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const preview = await openDesignLab(page);
  const previewFrame = page.getByTestId('design-lab-preview-frame');
  const search = preview.getByRole('searchbox', { name: '搜索库存' });

  await page.getByTestId('design-lab-viewport-desktop').click();
  await search.fill('PRM-C06');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(1);

  const antTagsSelect = preview.getByRole('combobox', { name: 'Ant tags model options' });
  await expect(
    antTagsSelect
      .locator(
        'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]',
      )
      .locator('.ant-select-arrow'),
  ).toBeVisible();
  await antTagsSelect.click();
  await expect(
    preview.locator('.ant-select-dropdown').getByText('gpt-5.5（默认渠道）', { exact: true }),
  ).toBeVisible();
  await expect(previewFrame).toHaveScreenshot('design-lab-c06-ant-tags-open-light.png');
  await page.keyboard.press('Escape');

  const radixSelect = preview.getByRole('combobox', { name: 'Shared Radix current select' });
  await radixSelect.click();
  await expect(preview.getByRole('option', { name: 'gpt-5', exact: true })).toBeVisible();
  await expect(previewFrame).toHaveScreenshot('design-lab-c06-radix-open-light.png');
  await page.keyboard.press('Escape');

  await page.getByTestId('design-lab-viewport-mobile').click();
  await expect.poll(() => preview.locator('body').evaluate(() => window.innerWidth)).toBe(390);
  await expect(preview.getByTestId('design-lab-prm-c06-preview')).toHaveScreenshot(
    'design-lab-c06-mobile-current-light.png',
  );

  await search.fill('PRM-C12');
  const tooltipTrigger = preview.getByRole('button', { name: 'Copy current value' });
  await tooltipTrigger.hover();
  await expect(preview.getByRole('tooltip', { name: '复制当前值' })).toBeVisible();
  await expect(previewFrame).toHaveScreenshot('design-lab-c12-tooltip-open-mobile-light.png');
});

test('records automated accessibility findings without claiming compliance', async ({
  page,
}, testInfo) => {
  await openDesignLab(page);
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target),
  }));

  testInfo.annotations.push({
    type: 'axe-current-state',
    description: `${results.violations.length} current-state violation groups recorded`,
  });
  console.log(`Design Lab axe current state: ${JSON.stringify(summary)}`);
  await testInfo.attach('axe-current-state.json', {
    body: Buffer.from(JSON.stringify({ summary, results }, null, 2)),
    contentType: 'application/json',
  });

  expect(results.testEngine.name).toBe('axe-core');
  expect(Array.isArray(results.violations)).toBe(true);
});

test('matches deterministic Design Lab review screenshots', async ({ page }) => {
  const preview = await openDesignLab(page);
  const previewFrame = page.getByTestId('design-lab-preview-frame');

  await page.getByTestId('design-lab-viewport-desktop').click();
  await expect.poll(() => preview.locator('body').evaluate(() => window.innerWidth)).toBe(1440);
  await expect(previewFrame).toHaveScreenshot('design-lab-desktop-light.png');

  await page.getByTestId('design-lab-theme-dark').click();
  await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
    'data-design-lab-theme',
    'dark',
  );
  await expect(previewFrame).toHaveScreenshot('design-lab-desktop-dark.png');

  await selectCatalogFilter(preview, 'design-lab-catalog-layer-filter', 'Primitive');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(17);
  await expect(previewFrame).toHaveScreenshot('design-lab-desktop-primitives-dark.png');

  await page.getByTestId('design-lab-viewport-mobile').click();
  await preview.getByRole('searchbox', { name: '搜索库存' }).fill('PRM-C06');
  await expect(preview.locator('[data-inventory-id]')).toHaveCount(1);
  await expect(previewFrame).toHaveScreenshot('design-lab-mobile-select-dark.png');
});
