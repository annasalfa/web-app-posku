import {redirect} from 'next/navigation';

import {HistoryPage} from '@/components/history/history-page';
import {getCurrentUser} from '@/lib/server/auth';
import {readWithFallback} from '@/lib/server/database';
import {listTransactions} from '@/lib/server/sales';

export default async function HistoryRoute({
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
    label: 'history-transactions',
    fallback: [],
    read: () => listTransactions(),
  });

  return (
    <HistoryPage
      initialTransactions={transactionsResult.data}
      loadError={transactionsResult.error}
    />
  );
}
