import { expect, test } from '@playwright/test';

test('renders the migrated canvas library shell', async ({ page }) => {
  await page.goto('/canvas');

  await expect(page.getByRole('link', { name: /无限画布/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: '无限画布' })).toBeVisible();
  await expect(page.getByRole('button', { name: /新建画布/ }).first()).toBeVisible();
});
