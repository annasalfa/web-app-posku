'use server';

import {revalidatePath} from 'next/cache';

import {requireCurrentUser} from '@/lib/server/auth';
import {listCategories, listProducts, saveProduct} from '@/lib/server/products';
import type {SaveProductInput} from '@/lib/server/pos-types';

export async function listProductsAction() {
  await requireCurrentUser();
  return listProducts();
}

export async function listCategoriesAction() {
  await requireCurrentUser();
  return listCategories();
}

export async function saveProductAction(input: SaveProductInput) {
  await requireCurrentUser();
  const product = await saveProduct(input);

  revalidateBackoffice(['/', '/products', '/cashier']);

  return product;
}

function revalidateBackoffice(paths: string[]) {
  for (const path of paths) {
    revalidatePath(`/id${path}`);
    revalidatePath(`/en${path}`);
  }
}
