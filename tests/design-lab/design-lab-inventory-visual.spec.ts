import { expect, test } from '@playwright/test';

import { expectedInventoryIds } from './design-lab-test-data';

function currentPreview(page: import('@playwright/test').Page) {
  return page.frameLocator('[data-testid="design-lab-preview-frame"]');
}

async function openInventoryItem(page: import('@playwright/test').Page, inventoryId: string) {
  await page.goto('/design-lab.html');
  await expect(page.getByTestId('design-lab-root')).toBeVisible();
  await page.getByTestId('design-lab-viewport-desktop').click();

  const preview = currentPreview(page);
  await expect(preview.getByTestId('design-lab-preview-root')).toBeVisible();
  await preview.getByRole('searchbox', { name: '搜索库存' }).fill(inventoryId);
  await expect(preview.locator(`[data-inventory-id="${inventoryId}"]`)).toBeVisible();
  return preview;
}

for (const inventoryId of expectedInventoryIds) {
  test(`${inventoryId} current implementation matches Light and Dark`, async ({ page }) => {
    const preview = await openInventoryItem(page, inventoryId);
    const currentImplementation = preview.locator(`[data-inventory-preview="${inventoryId}"]`);

    await expect(currentImplementation).toHaveScreenshot(`${inventoryId.toLowerCase()}-light.png`);

    await page.getByTestId('design-lab-theme-dark').click();
    await expect(preview.getByTestId('design-lab-preview-root')).toHaveAttribute(
      'data-design-lab-theme',
      'dark',
    );
    await expect(currentImplementation).toHaveScreenshot(`${inventoryId.toLowerCase()}-dark.png`);
  });
}
