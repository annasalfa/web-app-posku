import 'server-only';

import {Query} from 'node-appwrite';

import {listAllDocuments} from '@/lib/server/database';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {
  type DashboardMetricsRecord,
  mapTransactionDocument,
  mapTransactionItemDocument,
  type TransactionDocument,
  type TransactionItemDocument,
  type TransactionRecord,
} from '@/lib/server/pos-types';

const TRANSACTION_ITEM_CHUNK_SIZE = 20;
export async function listTransactions(limit?: number): Promise<TransactionRecord[]> {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, transactionsCollectionId} = getDatabaseEnv();
  const transactionDocuments = await listAllDocuments<TransactionDocument>({
    databaseId,
    collectionId: transactionsCollectionId,
    queries: [Query.orderDesc('$createdAt')],
    maxDocuments: limit,
  });

  if (transactionDocuments.length === 0) {
    return [];
  }

  const itemsByTransactionId = await listTransactionItemsByTransactionIds(
    transactionDocuments.map((transaction) => transaction.$id),
    new Map<string, string>(),
  );

  return transactionDocuments.map((document) =>
    mapTransactionDocument(document, itemsByTransactionId.get(document.$id) ?? []),
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetricsRecord> {
  const transactions = await listTransactions();
  const todayKey = getDateKey(new Date());
  const todayTransactions = transactions.filter((transaction) => getDateKey(new Date(transaction.createdAt)) === todayKey);
  const revenueToday = todayTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
  const ordersToday = todayTransactions.length;
  const averageTicket = ordersToday === 0 ? 0 : revenueToday / ordersToday;
  const topProducts = Array.from(
    transactions
      .flatMap((transaction) => transaction.items)
      .reduce((totals, item) => {
        const current = totals.get(item.productId);

        totals.set(item.productId, {
          name: item.name,
          sold: (current?.sold ?? 0) + item.quantity,
        });

        return totals;
      }, new Map<string, {name: string; sold: number}>())
      .values(),
  )
    .sort((left, right) => right.sold - left.sold || left.name.localeCompare(right.name))
    .slice(0, 3);

  return {
    revenueToday,
    ordersToday,
    averageTicket,
    topProducts,
  };
}

async function listTransactionItemsByTransactionIds(transactionIds: string[], productNames: Map<string, string>) {
  const {databaseId, transactionItemsCollectionId} = getDatabaseEnv();
  const grouped = new Map<string, ReturnType<typeof mapTransactionItemDocument>[]>();
  const chunks = chunk(transactionIds, TRANSACTION_ITEM_CHUNK_SIZE);
  const responses = await Promise.all(
    chunks.map((ids) =>
      listAllDocuments<TransactionItemDocument>({
        databaseId,
        collectionId: transactionItemsCollectionId,
        queries: [Query.equal('transactionId', ids)],
      }),
    ),
  );

  for (const response of responses) {
    for (const document of response) {
      const items = grouped.get(document.transactionId) ?? [];

      items.push(mapTransactionItemDocument(document, productNames.get(document.productId) ?? document.productId));
      grouped.set(document.transactionId, items);
    }
  }

  return grouped;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
