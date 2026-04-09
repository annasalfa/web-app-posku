import {redirect} from 'next/navigation';

import {DashboardPage} from '@/components/dashboard/dashboard-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
import {getDashboardMetrics} from '@/lib/server/sales';

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  const metricsResult = await readWithFallback({
    label: 'dashboard-metrics',
    fallback: {
      revenueToday: 0,
      ordersToday: 0,
      averageTicket: 0,
      lowStockCount: 0,
      topProducts: [],
      lowStockProducts: [],
    },
    read: () => getDashboardMetrics(),
  });

  return (
    <DashboardPage
      initialMetrics={metricsResult.data}
      loadError={metricsResult.error}
    />
  );
}
