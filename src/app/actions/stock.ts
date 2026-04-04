'use server';

import {revalidatePath} from 'next/cache';

import {requireCurrentUser} from '@/lib/server/auth';
import type {AdjustStockInput} from '@/lib/server/pos-types';
import {adjustStock, listStockOverview} from '@/lib/server/stock';

export async function listStockOverviewAction() {
  await requireCurrentUser();
  return listStockOverview();
}

export async function adjustStockAction(input: AdjustStockInput) {
  await requireCurrentUser();
  const result = await adjustStock(input);

  revalidateBackoffice(['/', '/stock', '/products', '/cashier']);

  return result;
}

function revalidateBackoffice(paths: string[]) {
  for (const path of paths) {
    revalidatePath(`/id${path}`);
    revalidatePath(`/en${path}`);
  }
}
