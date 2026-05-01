import { test, expect } from '@playwright/test';

test.describe('cart drawer a11y', () => {
  test('Escape closes the drawer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Cart', exact: true }).click();

    const drawer = page.getByRole('dialog', { name: 'Your cart' });
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('focus stays trapped inside the drawer on Tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Cart', exact: true }).click();

    const drawer = page.getByRole('dialog', { name: 'Your cart' });
    await expect(drawer).toBeVisible();

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await drawer.evaluate((el) =>
        el.contains(document.activeElement),
      );
      expect(inside).toBe(true);
    }
  });

  test('body scroll is locked while the drawer is open', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');

    await page.getByRole('button', { name: 'Cart', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeVisible();

    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked', '1');
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Your cart' })).toBeHidden();
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
  });
});
