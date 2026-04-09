import {expect, type Page} from '@playwright/test';

export async function expectShellTitle(page: Page, title: string) {
  const shellHeader = page.locator('header').first();

  await expect(shellHeader).toBeVisible();
  await expect(shellHeader.locator('p').first()).toHaveText(title);
}

export async function expectDesktopRailHasNoBranding(page: Page) {
  const rail = page.locator('aside').first();

  await expect(rail).toBeVisible();
  await expect(rail.getByText('POSKU', {exact: true})).toHaveCount(0);
  await expect(rail.getByText('Operator tunggal')).toHaveCount(0);
  await expect(rail.getByText('Solo operator')).toHaveCount(0);
}

export async function expectMobileDrawerHasNoBranding(page: Page) {
  const drawer = page.getByRole('dialog').last();

  await expect(drawer).toBeVisible();
  await expect(drawer.getByText('POSKU', {exact: true})).toHaveCount(0);
  await expect(drawer.getByText('Operator tunggal')).toHaveCount(0);
  await expect(drawer.getByText('Solo operator')).toHaveCount(0);
}
