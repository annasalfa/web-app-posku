import {redirect} from 'next/navigation';

import {StockPage} from '@/components/stock/stock-page';
import {getCurrentUser} from '@/lib/server/auth';
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

  const overview = await listStockOverview();

  return <StockPage initialProducts={overview.products} initialLogs={overview.logs} />;
}
