import {redirect} from 'next/navigation';

import {ProductsPage} from '@/components/products/products-page';
import {getCurrentUser} from '@/lib/server/auth';
import {listCategories, listProducts} from '@/lib/server/products';

export default async function ProductsRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <ProductsPage
      initialProducts={products}
      initialCategories={categories.map((category) => ({id: category.$id, name: category.name}))}
    />
  );
}
