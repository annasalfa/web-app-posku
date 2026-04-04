import {expect, test} from '@playwright/test';

test.use({storageState: {cookies: [], origins: []}});

test('redirects unauthenticated cashier access to login', async ({page}) => {
  await page.goto('/id/cashier');

  await expect(page).toHaveURL(/\/id\/login$/);
  await expect(page.getByRole('heading', {name: 'Masuk'})).toBeVisible();
});
