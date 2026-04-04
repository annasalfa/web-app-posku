import {expect, test} from '@playwright/test';

test('loads dashboard with authenticated session', async ({page}) => {
  await page.goto('/id');

  await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();
  await expect(page.getByText('Revenue hari ini')).toBeVisible();
});

test('navigates to cashier and renders checkout controls', async ({page}) => {
  await page.goto('/id');
  await page.getByRole('link', {name: 'Kasir'}).click();

  await expect(page).toHaveURL(/\/id\/cashier$/);
  await expect(page.getByRole('heading', {name: 'Kasir'})).toBeVisible();
  await expect(page.getByRole('group', {name: 'Filter kategori'})).toBeVisible();
  await expect(page.getByRole('group', {name: 'Metode bayar'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Selesaikan transaksi'})).toBeVisible();
});

test.describe('logout flow', () => {
  test.use({storageState: {cookies: [], origins: []}});

  test('can log out from settings', async ({page}) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASS;

    if (!email || !password) {
      throw new Error('USER_EMAIL and USER_PASS must be set for logout test.');
    }

    await page.goto('/id/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', {name: 'Masuk'}).click();

    await expect(page).toHaveURL(/\/id$/);
    await page.goto('/id/settings');

    await expect(page.getByRole('heading', {name: 'Pengaturan'})).toBeVisible();
    await page.getByRole('button', {name: 'Keluar'}).click();

    await expect(page).toHaveURL(/\/id\/login$/);
    await expect(page.getByRole('heading', {name: 'Masuk'})).toBeVisible();
  });
});
