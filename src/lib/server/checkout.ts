import 'server-only';

import {ID} from 'node-appwrite';

import {createAdminClient} from '@/lib/server/appwrite';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {getProduct} from '@/lib/server/products';
import {
  type CheckoutInput,
  type PaymentMethod,
  type ProductDocument,
  type StockLogDocument,
  type TransactionDocument,
  type TransactionItemDocument,
} from '@/lib/server/pos-types';

type CheckoutLine = {
  product: ProductDocument;
  quantity: number;
  subtotal: number;
};

export async function submitCheckout(input: CheckoutInput) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, transactionsCollectionId, transactionItemsCollectionId, productsCollectionId, stockLogsCollectionId} =
    getDatabaseEnv();
  const {databases} = createAdminClient();
  const lines = await buildCheckoutLines(input.items);
  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const amountPaid = resolveAmountPaid(input.paymentMethod, input.amountPaid, totalAmount);
  const changeAmount = input.paymentMethod === 'cash' ? amountPaid - totalAmount : 0;

  let transactionId: string | null = null;
  const createdItemIds: string[] = [];
  const createdStockLogIds: string[] = [];
  const originalProducts = lines.map((line) => ({id: line.product.$id, stockQty: line.product.stockQty}));

  try {
    const transaction = await databases.createDocument<TransactionDocument>({
      databaseId,
      collectionId: transactionsCollectionId,
      documentId: ID.unique(),
      data: {
        totalAmount,
        amountPaid,
        changeAmount,
        paymentMethod: input.paymentMethod,
        notes: input.notes?.trim() ?? '',
      },
    });

    transactionId = transaction.$id;

    for (const line of lines) {
      const item = await databases.createDocument<TransactionItemDocument>({
        databaseId,
        collectionId: transactionItemsCollectionId,
        documentId: ID.unique(),
        data: {
          transactionId,
          productId: line.product.$id,
          quantity: line.quantity,
          unitPrice: line.product.price,
          subtotal: line.subtotal,
        },
      });

      createdItemIds.push(item.$id);
    }

    for (const line of lines) {
      const nextStockQty = line.product.stockQty - line.quantity;

      await databases.updateDocument({
        databaseId,
        collectionId: productsCollectionId,
        documentId: line.product.$id,
        data: {
          stockQty: nextStockQty,
        },
      });
    }

    for (const line of lines) {
      const stockLog = await databases.createDocument<StockLogDocument>({
        databaseId,
        collectionId: stockLogsCollectionId,
        documentId: ID.unique(),
        data: {
          productId: line.product.$id,
          changeQty: -line.quantity,
          stockBefore: line.product.stockQty,
          stockAfter: line.product.stockQty - line.quantity,
          reason: 'sale',
          transactionId,
        },
      });

      createdStockLogIds.push(stockLog.$id);
    }

    return {
      transactionId,
      totalAmount,
      amountPaid,
      changeAmount,
    };
  } catch (error) {
    await rollbackCheckout({
      transactionId,
      createdItemIds,
      createdStockLogIds,
      originalProducts,
      databaseId,
      transactionsCollectionId,
      transactionItemsCollectionId,
      productsCollectionId,
      stockLogsCollectionId,
    });

    throw error;
  }
}

async function buildCheckoutLines(items: CheckoutInput['items']) {
  if (!items.length) {
    throw new Error('CHECKOUT_ITEMS_REQUIRED');
  }

  const lines: CheckoutLine[] = [];

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('CHECKOUT_ITEM_INVALID');
    }

    const product = await getProduct(item.productId);

    if (!product.isActive) {
      throw new Error('CHECKOUT_PRODUCT_INACTIVE');
    }

    if (product.stockQty < item.quantity) {
      throw new Error('CHECKOUT_STOCK_INSUFFICIENT');
    }

    lines.push({
      product,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    });
  }

  return lines;
}

function resolveAmountPaid(paymentMethod: PaymentMethod, amountPaid: number | undefined, totalAmount: number) {
  if (paymentMethod !== 'cash') {
    return totalAmount;
  }

  if (typeof amountPaid !== 'number' || !Number.isFinite(amountPaid) || amountPaid < totalAmount) {
    throw new Error('CHECKOUT_AMOUNT_INVALID');
  }

  return amountPaid;
}

async function rollbackCheckout(input: {
  transactionId: string | null;
  createdItemIds: string[];
  createdStockLogIds: string[];
  originalProducts: Array<{id: string; stockQty: number}>;
  databaseId: string;
  transactionsCollectionId: string;
  transactionItemsCollectionId: string;
  productsCollectionId: string;
  stockLogsCollectionId: string;
}) {
  const {databases} = createAdminClient();

  for (const stockLogId of input.createdStockLogIds) {
    await safeRun(() =>
      databases.deleteDocument({
        databaseId: input.databaseId,
        collectionId: input.stockLogsCollectionId,
        documentId: stockLogId,
      }),
    );
  }

  for (const product of input.originalProducts) {
    await safeRun(() =>
      databases.updateDocument<ProductDocument>({
        databaseId: input.databaseId,
        collectionId: input.productsCollectionId,
        documentId: product.id,
        data: {
          stockQty: product.stockQty,
        },
      }),
    );
  }

  for (const itemId of input.createdItemIds) {
    await safeRun(() =>
      databases.deleteDocument({
        databaseId: input.databaseId,
        collectionId: input.transactionItemsCollectionId,
        documentId: itemId,
      }),
    );
  }

  if (input.transactionId) {
    const transactionId = input.transactionId;

    await safeRun(() =>
      databases.deleteDocument({
        databaseId: input.databaseId,
        collectionId: input.transactionsCollectionId,
        documentId: transactionId,
      }),
    );
  }
}

async function safeRun(task: () => Promise<unknown>) {
  try {
    await task();
  } catch {
    return;
  }
}
