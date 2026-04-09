import fs from 'node:fs';

import {expect, test as setup} from '@playwright/test';

import {expectShellTitle} from './support/shell';

const authFile = `${process.cwd()}/playwright/.auth/user.json`;

function getRequiredEnv(name: 'USER_EMAIL' | 'USER_PASS') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Playwright auth setup.`);
  }

  return value;
}

setup('authenticate', async ({page}) => {
  fs.mkdirSync(`${process.cwd()}/playwright/.auth`, {recursive: true});

  await page.goto('/id/login');
  await page.getByLabel('Email').fill(getRequiredEnv('USER_EMAIL'));
  await page.getByLabel('Password').fill(getRequiredEnv('USER_PASS'));
  await page.getByRole('button', {name: 'Masuk'}).click();

  await page.waitForURL('/id');
  await expectShellTitle(page, 'Dashboard');
  await Promise.race([
    page.getByText('Revenue hari ini').waitFor({state: 'visible', timeout: 15000}),
    page.getByText('Data sedang tidak tersedia').waitFor({state: 'visible', timeout: 15000}),
  ]);
  await page.context().storageState({path: authFile});
});
