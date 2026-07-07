import { expect, test } from '@playwright/test';

test('opens a canvas workspace and performs basic node actions', async ({ page }) => {
  await page.goto('/canvas');

  await page
    .getByRole('button', { name: /新建画布/ })
    .first()
    .click();

  await expect(page.getByTitle('双击修改画布名称')).toBeVisible();
  await expect(page.getByRole('button', { name: '文本' })).toBeVisible();
  await expect(page.getByRole('button', { name: '图片' })).toBeVisible();
  await expect(page.getByRole('button', { name: '生成配置' })).toBeVisible();
  await expect(page.getByRole('slider', { name: '放大/缩小画布' })).toBeVisible();
  await expect(page.getByRole('button', { name: '打开小地图' })).toBeVisible();

  await page.getByRole('button', { name: '文本' }).click();
  const textNode = page.locator('[data-node-id^="text-"]').first();
  await expect(textNode).toBeVisible();

  await expect(page.getByRole('button', { name: '删除选中' })).toBeVisible();
  await page.getByRole('button', { name: '删除选中' }).click();
  await expect(textNode).toHaveCount(0);
});
