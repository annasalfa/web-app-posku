import {redirect} from 'next/navigation';

import {StockPage} from '@/components/stock/stock-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
import {listStockOverview} from '@/lib/server/stock';

export default async function StockRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  const overviewResult = await readWithFallback({
    label: 'stock-overview',
    fallback: {products: [], logs: []},
    read: () => listStockOverview(),
  });

  return (
    <StockPage
      initialProducts={overviewResult.data.products}
      initialLogs={overviewResult.data.logs}
      loadError={overviewResult.error}
    />
  );
}
