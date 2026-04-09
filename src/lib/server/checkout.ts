import 'server-only';

import {ID} from 'node-appwrite';

import {runInDatabaseTransaction} from '@/lib/server/database';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {listProductsByIds} from '@/lib/server/products';
import {
  type CheckoutInput,
  type PaymentMethod,
  type StockLogDocument,
  type TransactionDocument,
  type TransactionItemDocument,
  type ProductRecord,
} from '@/lib/server/pos-types';

type CheckoutLine = {
  product: ProductRecord;
  quantity: number;
  subtotal: number;
};

export async function submitCheckout(input: CheckoutInput) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, transactionsCollectionId, transactionItemsCollectionId, productsCollectionId, stockLogsCollectionId} =
    getDatabaseEnv();
  const lines = await buildCheckoutLines(input.items);
  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const amountPaid = resolveAmountPaid(input.paymentMethod, input.amountPaid, totalAmount);
  const changeAmount = input.paymentMethod === 'cash' ? amountPaid - totalAmount : 0;

  return runInDatabaseTransaction(async ({databases, transactionId}) => {
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
      transactionId,
    });

    for (const line of lines) {
      await databases.createDocument<TransactionItemDocument>({
        databaseId,
        collectionId: transactionItemsCollectionId,
        documentId: ID.unique(),
        data: {
          transactionId: transaction.$id,
          productId: line.product.id,
          productNameSnapshot: line.product.name,
          quantity: line.quantity,
          unitPrice: line.product.price,
          subtotal: line.subtotal,
        },
        transactionId,
      });
    }

    for (const line of lines) {
      const nextStockQty = line.product.stockQty - line.quantity;

      await databases.updateDocument({
        databaseId,
        collectionId: productsCollectionId,
        documentId: line.product.id,
        data: {
          stockQty: nextStockQty,
        },
        transactionId,
      });
    }

    for (const line of lines) {
      await databases.createDocument<StockLogDocument>({
        databaseId,
        collectionId: stockLogsCollectionId,
        documentId: ID.unique(),
        data: {
          productId: line.product.id,
          changeQty: -line.quantity,
          stockBefore: line.product.stockQty,
          stockAfter: line.product.stockQty - line.quantity,
          reason: 'sale',
          transactionId: transaction.$id,
        },
        transactionId,
      });
    }

    return {
      transactionId: transaction.$id,
      totalAmount,
      amountPaid,
      changeAmount,
    };
  });
}

async function buildCheckoutLines(items: CheckoutInput['items']) {
  if (!items.length) {
    throw new Error('CHECKOUT_ITEMS_REQUIRED');
  }

  const products = await listProductsByIds(items.map((item) => item.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines: CheckoutLine[] = [];

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('CHECKOUT_ITEM_INVALID');
    }

    const product = productsById.get(item.productId);

    if (!product) {
      throw new Error('CHECKOUT_ITEM_INVALID');
    }

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
