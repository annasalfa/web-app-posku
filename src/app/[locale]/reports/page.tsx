import {redirect} from 'next/navigation';

import {ReportsPage} from '@/components/reports/reports-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
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

  const transactionsResult = await readWithFallback({
    label: 'reports-transactions',
    fallback: [],
    read: () => listTransactions(),
  });

  return (
    <ReportsPage
      initialTransactions={transactionsResult.data}
      loadError={transactionsResult.error}
    />
  );
}
