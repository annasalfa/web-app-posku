import 'server-only';

import type {Models} from 'node-appwrite';

export type PaymentMethod = 'cash' | 'transfer' | 'qris';

export type CategoryDocument = Models.Document & {
  name: string;
};

export type ProductDocument = Models.Document & {
  name: string;
  price: number;
  stockQty: number;
  categoryId?: string | null;
  isActive: boolean;
};

export type TransactionDocument = Models.Document & {
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
};

export type TransactionItemDocument = Models.Document & {
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type TransactionItemRecord = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type TransactionRecord = {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  notes: string;
  items: TransactionItemRecord[];
};

export type DashboardTopProductRecord = {
  name: string;
  sold: number;
};

export type DashboardLowStockRecord = {
  id: string;
  name: string;
  category: string;
  stockQty: number;
};

export type DashboardMetricsRecord = {
  revenueToday: number;
  ordersToday: number;
  averageTicket: number;
  lowStockCount: number;
  topProducts: DashboardTopProductRecord[];
  lowStockProducts: DashboardLowStockRecord[];
};

export type StockLogDocument = Models.Document & {
  productId: string;
  changeQty: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  transactionId?: string | null;
};

export type ProductRecord = {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string;
  sku: string;
};

export type StockLogRecord = {
  id: string;
  productId: string;
  productName: string;
  changeQty: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdAt: string;
  transactionId: string | null;
};

export type SaveProductInput = {
  id?: string;
  name: string;
  price: number;
  stockQty: number;
  categoryId?: string | null;
  isActive?: boolean;
};

export type AdjustStockInput = {
  productId: string;
  reason: string;
  delta?: number;
  nextStockQty?: number;
};

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export type CheckoutInput = {
  items: CheckoutItemInput[];
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  notes?: string;
};

export function normalizeCategoryName(categoryId: string | null | undefined, categories: Map<string, string>) {
  if (!categoryId) {
    return 'Uncategorized';
  }

  return categories.get(categoryId) ?? 'Uncategorized';
}

export function mapProductDocument(document: ProductDocument, categories: Map<string, string>): ProductRecord {
  return {
    id: document.$id,
    name: document.name,
    price: document.price,
    stockQty: document.stockQty,
    isActive: document.isActive,
    categoryId: document.categoryId ?? null,
    categoryName: normalizeCategoryName(document.categoryId, categories),
    sku: document.$id,
  };
}

export function mapStockLogDocument(document: StockLogDocument, productName: string): StockLogRecord {
  return {
    id: document.$id,
    productId: document.productId,
    productName,
    changeQty: document.changeQty,
    stockBefore: document.stockBefore,
    stockAfter: document.stockAfter,
    reason: document.reason,
    createdAt: document.$createdAt,
    transactionId: document.transactionId ?? null,
  };
}

export function mapTransactionItemDocument(document: TransactionItemDocument, productName: string): TransactionItemRecord {
  return {
    productId: document.productId,
    name: productName,
    quantity: document.quantity,
    unitPrice: document.unitPrice,
    subtotal: document.subtotal,
  };
}

export function mapTransactionDocument(document: TransactionDocument, items: TransactionItemRecord[]): TransactionRecord {
  return {
    id: document.$id,
    createdAt: document.$createdAt,
    paymentMethod: document.paymentMethod,
    totalAmount: document.totalAmount,
    amountPaid: document.amountPaid,
    changeAmount: document.changeAmount,
    notes: document.notes ?? '',
    items,
  };
}
