'use server';

import {revalidatePath} from 'next/cache';

import {requireCurrentUser} from '@/lib/server/auth';
import type {CheckoutInput} from '@/lib/server/pos-types';
import {submitCheckout} from '@/lib/server/checkout';

export async function checkoutAction(input: CheckoutInput) {
  await requireCurrentUser();
  const result = await submitCheckout(input);

  revalidateBackoffice(['/', '/cashier', '/history', '/reports', '/stock']);

  return result;
}

function revalidateBackoffice(paths: string[]) {
  for (const path of paths) {
    revalidatePath(`/id${path}`);
    revalidatePath(`/en${path}`);
  }
}
