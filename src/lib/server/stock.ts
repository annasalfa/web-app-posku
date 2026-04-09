import 'server-only';

import {ID, Query} from 'node-appwrite';

import {listAllDocuments, runInDatabaseTransaction} from '@/lib/server/database';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {getProduct, listCategories, listProducts} from '@/lib/server/products';
import {
  type AdjustStockInput,
  mapProductDocument,
  type ProductDocument,
  mapStockLogDocument,
  type StockLogDocument,
} from '@/lib/server/pos-types';

export async function listStockOverview() {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, stockLogsCollectionId} = getDatabaseEnv();
  const [products, logs] = await Promise.all([
    listProducts(),
    listAllDocuments<StockLogDocument>({
      databaseId,
      collectionId: stockLogsCollectionId,
      queries: [Query.orderDesc('$createdAt')],
    }),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product.name]));

  return {
    products,
    logs: logs.map((document) =>
      mapStockLogDocument(document, productMap.get(document.productId) ?? document.productId),
    ),
  };
}

export async function adjustStock(input: AdjustStockInput) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, productsCollectionId, stockLogsCollectionId} = getDatabaseEnv();
  const product = await getProduct(input.productId);
  const reason = input.reason.trim();

  if (!reason) {
    throw new Error('STOCK_REASON_REQUIRED');
  }

  const delta = resolveStockDelta(input, product.stockQty);
  const nextStockQty = product.stockQty + delta;

  if (nextStockQty < 0) {
    throw new Error('STOCK_RESULT_NEGATIVE');
  }

  const {product: updatedProduct, stockLog} = await runInDatabaseTransaction(async ({databases, transactionId}) => {
    const updatedProduct = await databases.updateDocument<ProductDocument>({
      databaseId,
      collectionId: productsCollectionId,
      documentId: product.$id,
      data: {
        stockQty: nextStockQty,
      },
      transactionId,
    });

    const stockLog = await databases.createDocument<StockLogDocument>({
      databaseId,
      collectionId: stockLogsCollectionId,
      documentId: ID.unique(),
      data: {
        productId: product.$id,
        changeQty: delta,
        stockBefore: product.stockQty,
        stockAfter: nextStockQty,
        reason,
        transactionId: null,
      },
      transactionId,
    });

    return {product: updatedProduct, stockLog};
  });

  const categories = await listCategories();
  const categoryMap = new Map(categories.map((category) => [category.$id, category.name]));

  return {
    product: mapProductDocument(updatedProduct, categoryMap),
    stockLog: mapStockLogDocument(stockLog, product.name),
  };
}

function resolveStockDelta(input: AdjustStockInput, currentStockQty: number) {
  if (typeof input.nextStockQty === 'number') {
    if (!Number.isInteger(input.nextStockQty) || input.nextStockQty < 0) {
      throw new Error('STOCK_TARGET_INVALID');
    }

    return input.nextStockQty - currentStockQty;
  }

  if (typeof input.delta !== 'number' || !Number.isInteger(input.delta) || input.delta === 0) {
    throw new Error('STOCK_DELTA_INVALID');
  }

  return input.delta;
}
