import { test, expect } from '@playwright/test';

test('catalog → cart → checkout → success', async ({ page }) => {
  await page.goto('/');

  const firstCard = page.locator('article').first();
  await expect(firstCard).toBeVisible();

  await firstCard.getByRole('button', { name: 'Add to cart' }).click();

  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Your cart' });
  await expect(drawer).toBeVisible();

  await drawer.getByRole('button', { name: 'Checkout' }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.getByLabel(/^Full name/).fill('E2E Buyer');
  await page.getByLabel(/^Phone/).fill('+93700000001');

  const placeOrder = page.getByRole('button', { name: 'Place order' });
  await expect(placeOrder).toBeEnabled();
  await placeOrder.click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9-]+\/success$/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();
  await expect(page.locator('body')).toContainText(/SM-\d{14}-[A-Z0-9]{6}/);
});
