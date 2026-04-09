import {expect, test} from '@playwright/test';

import {cleanupProductArtifacts, createProduct, getFirstCategory} from './support/appwrite-admin';
import {expectDesktopRailHasNoBranding, expectMobileDrawerHasNoBranding, expectShellTitle} from './support/shell';

test.describe.serial('ui edge cases', () => {
  const suffix = Date.now();
  const outOfStockName = `E2E Out ${suffix}`;
  const checkoutName = `E2E QRIS ${suffix}`;
  let outOfStockProductId: string | null = null;
  let checkoutProductId: string | null = null;

  test.beforeAll(async () => {
    const category = await getFirstCategory();

    if (!category) {
      throw new Error('At least one category is required for UI edge-case tests.');
    }

    const [outOfStockProduct, checkoutProduct] = await Promise.all([
      createProduct({
        name: outOfStockName,
        price: 5000,
        stockQty: 0,
        categoryId: category.$id,
      }),
      createProduct({
        name: checkoutName,
        price: 7000,
        stockQty: 2,
        categoryId: category.$id,
      }),
    ]);

    outOfStockProductId = outOfStockProduct.$id;
    checkoutProductId = checkoutProduct.$id;
  });

  test.afterAll(async () => {
    if (outOfStockProductId) {
      await cleanupProductArtifacts(outOfStockProductId);
    }

    if (checkoutProductId) {
      await cleanupProductArtifacts(checkoutProductId);
    }
  });

  test('keeps the product modal open on backdrop click and closes on escape', async ({page}) => {
    await page.goto('/id/products');
    await page.getByRole('button', {name: 'Produk baru'}).click();

    const dialog = page.getByRole('dialog', {name: 'Produk baru'});

    await expect(dialog).toBeVisible();
    await page.mouse.click(12, 12);
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('blocks out-of-stock products and cash checkout until payment is sufficient', async ({page}) => {
    await page.goto('/id/cashier');

    await page.getByLabel('Cari').fill(outOfStockName);

    const outOfStockButton = page.getByRole('button', {name: new RegExp(outOfStockName)});

    await expect(outOfStockButton).toBeDisabled();
    await expect(outOfStockButton.getByText('Stok habis')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Belum ada item'})).toBeVisible();

    await page.getByLabel('Cari').fill(checkoutName);
    await page.getByRole('button', {name: new RegExp(checkoutName)}).click();

    const submitButton = page.getByRole('button', {name: 'Selesaikan transaksi'});

    await expect(submitButton).toBeDisabled();
    await page.getByLabel('Nominal diterima').fill('6999');
    await expect(submitButton).toBeDisabled();
    await page.getByLabel('Nominal diterima').fill('7000');
    await expect(submitButton).toBeEnabled();
  });

  test('submits a QRIS checkout without showing the cash input', async ({page}) => {
    await page.goto('/id/cashier');

    await page.getByLabel('Cari').fill(checkoutName);
    await page.getByRole('button', {name: new RegExp(checkoutName)}).click();
    await page.getByRole('group', {name: 'Metode bayar'}).getByText('QRIS').click();

    await expect(page.getByLabel('Nominal diterima')).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Selesaikan transaksi'})).toBeEnabled();

    await page.getByRole('button', {name: 'Selesaikan transaksi'}).click();
    await expect(page.getByText('Transaksi siap dikirim ke dapur dan update stok.')).toBeVisible({timeout: 15000});
    await expect(page.getByRole('heading', {name: 'Belum ada item'})).toBeVisible({timeout: 15000});
  });

  test('disables report exports when a custom range has no transactions', async ({page}) => {
    await page.goto('/id/reports');
    await page.getByRole('group', {name: 'Filter periode'}).getByText('Kustom').click();
    await page.getByLabel('Dari').fill('2099-01-01');
    await page.getByLabel('Sampai').fill('2099-01-31');

    await expect(page.getByText('Belum ada transaksi pada periode ini.')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Unduh CSV'})).toBeDisabled();
    await expect(page.getByRole('button', {name: 'Unduh Excel'})).toBeDisabled();
  });

  test('renders navigation correctly on mobile and tablet viewports', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/id');

    await expectShellTitle(page, 'Dashboard');
    const openNavigationButton = page.getByRole('button', {name: 'Buka navigasi'});

    await expect(openNavigationButton).toBeVisible();
    await openNavigationButton.click();
    await expectMobileDrawerHasNoBranding(page);
    await expect(page.getByRole('link', {name: 'Kasir'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('link', {name: 'Kasir'})).toHaveCount(0);

    await page.setViewportSize({width: 1024, height: 768});
    await page.goto('/id');

    await expect(openNavigationButton).toBeHidden();
    await expectDesktopRailHasNoBranding(page);
    await expect(page.getByRole('link', {name: 'Kasir'})).toBeVisible();
  });

  test('keeps long history transaction ids inside the detail panel on tablet', async ({page}) => {
    await page.setViewportSize({width: 1210, height: 834});
    await page.goto('/en/history');

    const detailHeading = page.locator('main h2').first();
    const detailPanel = detailHeading.locator('xpath=ancestor::section[1]');
    const headingBox = await detailHeading.boundingBox();
    const panelBox = await detailPanel.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect((headingBox?.x ?? 0) + (headingBox?.width ?? 0)).toBeLessThanOrEqual(
      (panelBox?.x ?? 0) + (panelBox?.width ?? 0) + 1,
    );
  });
});
