import {redirect} from 'next/navigation';

import {CashierPage} from '@/components/cashier/cashier-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
import {listProducts} from '@/lib/server/products';

export default async function CashierRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  const productsResult = await readWithFallback({
    label: 'cashier-products',
    fallback: [],
    read: () => listProducts({activeOnly: true}),
  });
  const categories = Array.from(new Set(productsResult.data.map((product) => product.categoryName))).filter(Boolean);

  return (
    <CashierPage
      initialProducts={productsResult.data}
      initialCategories={categories}
      loadError={productsResult.error}
    />
  );
}
