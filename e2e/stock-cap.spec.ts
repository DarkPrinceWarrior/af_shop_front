import { test, expect } from '@playwright/test';

test('plus button disables once cart hits stock_quantity', async ({ page }) => {
  await page.goto('/');

  const card = page.locator('article').first();
  await expect(card).toBeVisible();

  const stockText = await card.getByText(/^In stock:\s*\d+$/).innerText();
  const stock = Number(stockText.replace(/\D/g, ''));
  expect(stock).toBeGreaterThan(0);

  await card.getByRole('button', { name: 'Add to cart' }).click();

  const qtyGroup = card.getByRole('group', { name: 'Quantity' });
  const plus = qtyGroup.getByRole('button', { name: 'Quantity' }).last();
  const counter = qtyGroup.locator('span').first();

  for (let i = 1; i < stock; i += 1) {
    await plus.click();
  }

  await expect(counter).toHaveText(String(stock));
  await expect(plus).toBeDisabled();
});
