import { test, expect } from '@playwright/test';

test('switching language to ps flips html dir to rtl', async ({ page }) => {
  await page.goto('/');

  const html = page.locator('html');
  await expect(html).toHaveAttribute('dir', 'ltr');

  await page.getByLabel('Language').selectOption('ps');

  await expect(html).toHaveAttribute('dir', 'rtl');
  await expect(html).toHaveAttribute('lang', 'ps');
});
