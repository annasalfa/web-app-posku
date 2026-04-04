import {redirect} from 'next/navigation';

import {CashierPage} from '@/components/cashier/cashier-page';
import {getCurrentUser} from '@/lib/server/auth';
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

  const products = await listProducts({activeOnly: true});
  const categories = Array.from(new Set(products.map((product) => product.categoryName))).filter(Boolean);

  return <CashierPage initialProducts={products} initialCategories={categories} />;
}
