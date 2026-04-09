import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  cleanupProductArtifacts,
  findProductByName,
  getFirstCategory,
} from "./support/appwrite-admin";
import { expectShellTitle } from "./support/shell";

async function gotoReady(page: Page, path: string, ready: () => Locator) {
  await expect(async () => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(ready()).toBeVisible();
  }).toPass({ timeout: 30000 });
}

test.describe.serial("backoffice interactions", () => {
  const productName = `000 E2E Product ${Date.now()}`;
  const updatedProductName = `${productName} Updated`;
  const finalProductName = `${updatedProductName} Final`;
  const stockReason = `e2e-restock-${Date.now()}`;
  let createdProductId: string | null = null;

  test.afterAll(async () => {
    if (createdProductId) {
      await cleanupProductArtifacts(createdProductId);
      return;
    }

    const existing =
      (await findProductByName(finalProductName)) ??
      (await findProductByName(updatedProductName));
    if (existing) {
      await cleanupProductArtifacts(existing.$id);
    }
  });

  test("keeps the product dialog open when name validation fails", async ({
    page,
  }) => {
    await gotoReady(page, "/id/products", () =>
      page.getByRole("button", { name: "Produk baru" }),
    );
    await page.getByRole("button", { name: "Produk baru" }).click();

    const dialog = page.getByRole("dialog", { name: "Produk baru" });

    await expect(dialog).toBeVisible();
    await page.getByLabel("Nama").fill("");
    await page.getByLabel("Harga").fill("1000");
    await page.getByLabel("Stok awal").fill("1");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(dialog).toBeVisible();
    await expect(page.getByRole("alert")).toHaveText(
      "Nama produk wajib diisi.",
    );
  });

  test("creates and edits a product from the products page", async ({
    page,
  }) => {
    const firstCategory = await getFirstCategory();
    expect(firstCategory).not.toBeNull();

    await gotoReady(page, "/id/products", () =>
      page.getByRole("button", { name: "Produk baru" }),
    );
    await page.getByRole("button", { name: "Produk baru" }).click();

    await expect(
      page.getByRole("dialog", { name: "Produk baru" }),
    ).toBeVisible();
    await page.getByLabel("Nama").fill(productName);
    await page.getByRole("combobox", { name: "Kategori" }).click();
    await page.getByRole("option", { name: firstCategory!.name }).click();
    await page.getByLabel("Harga").fill("12345");
    await page.getByLabel("Stok awal").fill("6");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByLabel("Cari").fill(productName);
    await expect(
      page.getByRole("button", { name: new RegExp(productName) }),
    ).toBeVisible();

    await page.getByRole("button", { name: new RegExp(productName) }).click();
    await expect(page.getByRole("dialog", { name: productName })).toBeVisible();
    await page.getByLabel("Nama").fill(updatedProductName);
    await page.getByLabel("Harga").fill("13000");
    await page.getByLabel("Stok awal").fill("6");
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByLabel("Cari").fill(updatedProductName);
    await expect(
      page.getByRole("button", { name: new RegExp(updatedProductName) }),
    ).toBeVisible();

    const product = await findProductByName(updatedProductName);
    expect(product).not.toBeNull();
    createdProductId = product!.$id;
  });

  test("adjusts stock for the temporary product", async ({ page }) => {
    await gotoReady(page, "/id/stock", () => page.getByLabel("Delta"));

    const productButton = page.getByRole("button", {
      name: new RegExp(updatedProductName),
    });

    await expect(async () => {
      await page.reload();
      await expect(productButton).toBeVisible();
    }).toPass({ timeout: 20000 });

    await productButton.click();
    await expect(
      page.getByRole("heading", { name: updatedProductName }),
    ).toBeVisible();
    await page.getByLabel("Delta").fill("2");
    await page.getByLabel("Alasan").fill(stockReason);
    await page.getByRole("button", { name: "Sesuaikan stok" }).click();

    await expect(productButton).toContainText("8");
    await expect(async () => {
      await page.reload();
      await expect(page.getByText(stockReason)).toBeVisible();
    }).toPass({ timeout: 15000 });
  });

  test("uses cashier interactions and completes checkout", async ({ page }) => {
    await gotoReady(page, "/id/cashier", () => page.getByLabel("Cari"));

    await page.getByLabel("Cari").fill(updatedProductName);
    await expect(
      page.getByRole("button", { name: new RegExp(updatedProductName) }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: new RegExp(updatedProductName) })
      .click();

    await expect(
      page.getByRole("button", {
        name: new RegExp(`Hapus ${updatedProductName}`),
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Selesaikan transaksi" }),
    ).toBeDisabled();

    await page
      .getByRole("group", { name: "Metode bayar" })
      .getByText("Transfer bank")
      .click();
    await expect(
      page.getByRole("button", { name: "Selesaikan transaksi" }),
    ).toBeEnabled();

    await page
      .getByRole("group", { name: "Metode bayar" })
      .getByText("Tunai")
      .click();
    await page
      .getByRole("button", {
        name: new RegExp(`Tambah jumlah untuk ${updatedProductName}`),
      })
      .click();
    await page
      .getByRole("button", {
        name: new RegExp(`Kurangi jumlah untuk ${updatedProductName}`),
      })
      .click();
    await page.getByLabel("Nominal diterima").fill("13000");
    await expect(
      page.getByRole("button", { name: "Selesaikan transaksi" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Selesaikan transaksi" }).click();
    await expect(
      page.getByText("Transaksi siap dikirim ke dapur dan update stok."),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Belum ada item" }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("renames the product after checkout without mutating receipt snapshots", async ({
    page,
  }) => {
    await gotoReady(page, "/id/products", () => page.getByLabel("Cari"));
    await page.getByLabel("Cari").fill(updatedProductName);
    await page
      .getByRole("button", { name: new RegExp(updatedProductName) })
      .click();
    await expect(
      page.getByRole("dialog", { name: updatedProductName }),
    ).toBeVisible();
    await page.getByLabel("Nama").fill(finalProductName);
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByLabel("Cari").fill(finalProductName);
    await expect(
      page.getByRole("button", { name: new RegExp(finalProductName) }),
    ).toBeVisible();
  });

  test("filters and inspects history for the submitted checkout", async ({
    page,
  }) => {
    await gotoReady(page, "/id/history", () =>
      page.getByRole("group", { name: "Filter pembayaran" }),
    );

    await page
      .getByRole("group", { name: "Filter pembayaran" })
      .getByText("Tunai")
      .click();
    await expect(
      page
        .getByRole("heading", { name: /trx_/i })
        .or(page.getByRole("heading", { name: /[a-z0-9]{10,}/i })),
    ).toBeVisible();
    await expect(page.getByText(updatedProductName).last()).toBeVisible();
    await expect(page.getByText(finalProductName)).toHaveCount(0);

    await page
      .getByLabel("Cari transaksi atau catatan")
      .fill("tidak-ada-transaksi");
    await expect(
      page.getByText("Tidak ada transaksi yang cocok."),
    ).toBeVisible();

    await page.getByLabel("Cari transaksi atau catatan").fill("");
    await expect(page.getByText(updatedProductName).last()).toBeVisible();
  });

  test("switches report periods and downloads CSV", async ({ page }) => {
    await gotoReady(page, "/id/reports", () =>
      page.getByRole("group", { name: "Filter periode" }),
    );

    await page
      .getByRole("group", { name: "Filter periode" })
      .getByText("Kustom")
      .click();
    await expect(page.getByLabel("Dari")).toBeVisible();
    await expect(page.getByLabel("Sampai")).toBeVisible();

    const today = new Date().toISOString().slice(0, 10);
    await page.getByLabel("Dari").fill(today);
    await page.getByLabel("Sampai").fill(today);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Unduh CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("posku-custom.csv");
  });

  test("switches theme and locale from settings", async ({ page }) => {
    await gotoReady(page, "/id/settings", () =>
      page.getByRole("group", { name: "Tema" }),
    );

    await expectShellTitle(page, "Pengaturan");
    await page.getByRole("group", { name: "Tema" }).getByText("Gelap").click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page
      .getByRole("group", { name: "Bahasa" })
      .getByText("English")
      .click();
    await expect(page).toHaveURL(/\/en\/settings$/);
    await expectShellTitle(page, "Settings");

    await page
      .getByRole("group", { name: "Language" })
      .getByText("Bahasa Indonesia")
      .click();
    await expect(page).toHaveURL(/\/id\/settings$/);
    await expectShellTitle(page, "Pengaturan");
  });
});
