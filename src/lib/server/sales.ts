import 'server-only';

import {Query} from 'node-appwrite';

import {createAdminClient} from '@/lib/server/appwrite';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {listProducts} from '@/lib/server/products';
import {
  type DashboardMetricsRecord,
  mapTransactionDocument,
  mapTransactionItemDocument,
  type TransactionDocument,
  type TransactionItemDocument,
  type TransactionRecord,
} from '@/lib/server/pos-types';

const DEFAULT_TRANSACTION_LIMIT = 200;
const DASHBOARD_TRANSACTION_LIMIT = 200;
const TRANSACTION_ITEM_CHUNK_SIZE = 20;
const TRANSACTION_ITEM_QUERY_LIMIT = 200;
const LOW_STOCK_THRESHOLD = 5;

export async function listTransactions(limit = DEFAULT_TRANSACTION_LIMIT): Promise<TransactionRecord[]> {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, transactionsCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();
  const [products, transactions] = await Promise.all([
    listProducts(),
    databases.listDocuments<TransactionDocument>({
      databaseId,
      collectionId: transactionsCollectionId,
      queries: [Query.orderDesc('$createdAt'), Query.limit(limit)],
    }),
  ]);

  if (transactions.documents.length === 0) {
    return [];
  }

  const itemsByTransactionId = await listTransactionItemsByTransactionIds(
    transactions.documents.map((transaction) => transaction.$id),
    new Map(products.map((product) => [product.id, product.name])),
  );

  return transactions.documents.map((document) =>
    mapTransactionDocument(document, itemsByTransactionId.get(document.$id) ?? []),
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetricsRecord> {
  const [products, transactions] = await Promise.all([listProducts(), listTransactions(DASHBOARD_TRANSACTION_LIMIT)]);
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

  const allLowStockProducts = products
    .filter((product) => product.stockQty <= LOW_STOCK_THRESHOLD)
    .sort((left, right) => left.stockQty - right.stockQty || left.name.localeCompare(right.name));

  const lowStockProducts = allLowStockProducts
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.categoryName,
      stockQty: product.stockQty,
    }));

  return {
    revenueToday,
    ordersToday,
    averageTicket,
    lowStockCount: allLowStockProducts.length,
    topProducts,
    lowStockProducts,
  };
}

async function listTransactionItemsByTransactionIds(transactionIds: string[], productNames: Map<string, string>) {
  const {databaseId, transactionItemsCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();
  const grouped = new Map<string, ReturnType<typeof mapTransactionItemDocument>[]>();
  const chunks = chunk(transactionIds, TRANSACTION_ITEM_CHUNK_SIZE);
  const responses = await Promise.all(
    chunks.map((ids) =>
      databases.listDocuments<TransactionItemDocument>({
        databaseId,
        collectionId: transactionItemsCollectionId,
        queries: [Query.equal('transactionId', ids), Query.limit(TRANSACTION_ITEM_QUERY_LIMIT)],
      }),
    ),
  );

  for (const response of responses) {
    for (const document of response.documents) {
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
