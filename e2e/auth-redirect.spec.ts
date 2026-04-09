import {expect, test} from '@playwright/test';

test.use({storageState: {cookies: [], origins: []}});

test('redirects unauthenticated cashier access to login', async ({page}) => {
  await page.goto('/id/cashier');

  await expect(page).toHaveURL(/\/id\/login$/);
  await expect(page.getByRole('heading', {name: 'Masuk'})).toBeVisible();
});

test('redirects stale-session settings access to login', async ({page}) => {
  await page.goto('/id/login');
  await page.context().addCookies([
    {
      name: 'posku-session',
      value: 'invalid-session-token',
      url: page.url(),
    },
  ]);

  await page.goto('/id/settings');

  await expect(page).toHaveURL(/\/id\/login$/);
  await expect(page.getByRole('heading', {name: 'Masuk'})).toBeVisible();
});
