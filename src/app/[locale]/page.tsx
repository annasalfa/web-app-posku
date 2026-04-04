import {redirect} from 'next/navigation';

import {DashboardPage} from '@/components/dashboard/dashboard-page';
import {getCurrentUser} from '@/lib/server/auth';
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

  const metrics = await getDashboardMetrics();

  return <DashboardPage initialMetrics={metrics} />;
}
