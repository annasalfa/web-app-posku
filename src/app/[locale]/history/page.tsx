import {redirect} from 'next/navigation';

import {HistoryPage} from '@/components/history/history-page';
import {getCurrentUser} from '@/lib/server/auth';
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

  const transactions = await listTransactions();

  return <HistoryPage initialTransactions={transactions} />;
}
