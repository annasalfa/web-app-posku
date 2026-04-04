import {redirect} from 'next/navigation';

import {ReportsPage} from '@/components/reports/reports-page';
import {getCurrentUser} from '@/lib/server/auth';
import {listTransactions} from '@/lib/server/sales';

export default async function ReportsRoute({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/${locale}/login`);
  }

  const transactions = await listTransactions(500);

  return <ReportsPage initialTransactions={transactions} />;
}
