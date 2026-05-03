import { test, expect } from '@playwright/test';

const uniqueEmail = () => `e2e+${Date.now()}@example.com`;
const PASSWORD = 'testpass1234';

test('register on checkout binds order to user and shows it in My orders', async ({
  page,
}) => {
  const email = uniqueEmail();

  await page.goto('/');
  const card = page.locator('article').first();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await page.getByRole('dialog', { name: 'Your cart' }).getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  await page.locator('#auth_full_name').fill('E2E Buyer');
  await page.locator('#auth_email').fill(email);
  await page.locator('#auth_password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 10_000 });

  await expect(page.getByRole('link', { name: 'My orders' })).toBeVisible();

  await page.getByLabel(/^Phone/).fill('+93700000002');

  const placeOrder = page.getByRole('button', { name: 'Place order' });
  await expect(placeOrder).toBeEnabled();
  await placeOrder.click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9-]+\/success$/, {
    timeout: 15_000,
  });
  await expect(page.getByText('Saved to your account')).toBeVisible();

  await page.getByRole('link', { name: 'My orders' }).click();
  await expect(page).toHaveURL(/\/orders\/me$/);
  await expect(page.getByText(/SM-\d{14}-[A-Z0-9]{6}/)).toBeVisible();
});

test('guest checkout still works without auth', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('article').first();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await page.getByRole('dialog', { name: 'Your cart' }).getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Guest', exact: true }),
  ).toBeVisible();

  await page.getByLabel(/^Full name/).fill('Guest Buyer');
  await page.getByLabel(/^Phone/).fill('+93700000003');

  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/\/orders\/[A-Z0-9-]+\/success$/, {
    timeout: 15_000,
  });
  await expect(page.getByText('Saved to your account')).toBeHidden();
});
