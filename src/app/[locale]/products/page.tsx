import {redirect} from 'next/navigation';

import {ProductsPage} from '@/components/products/products-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
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

  const productsResult = await readWithFallback({
    label: 'products-page-data',
    fallback: {products: [], categories: []},
    read: async () => {
      const [products, categories] = await Promise.all([listProducts(), listCategories()]);

      return {products, categories};
    },
  });

  return (
    <ProductsPage
      initialProducts={productsResult.data.products}
      initialCategories={productsResult.data.categories.map((category) => ({id: category.$id, name: category.name}))}
      loadError={productsResult.error}
    />
  );
}
