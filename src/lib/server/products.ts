import 'server-only';

import {ID, Query} from 'node-appwrite';

import {createAdminClient} from '@/lib/server/appwrite';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {
  type CategoryDocument,
  mapProductDocument,
  type ProductDocument,
  type ProductRecord,
  type SaveProductInput,
} from '@/lib/server/pos-types';

export async function listCategories() {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, categoriesCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();
  const result = await databases.listDocuments<CategoryDocument>({
    databaseId,
    collectionId: categoriesCollectionId,
    queries: [Query.orderAsc('name'), Query.limit(200)],
  });

  return result.documents;
}

export async function listProducts(options?: {
  activeOnly?: boolean;
  query?: string;
}) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, productsCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();
  const queries = [Query.orderAsc('name'), Query.limit(200)];

  if (options?.activeOnly) {
    queries.push(Query.equal('isActive', true));
  }

  const [categories, products] = await Promise.all([
    listCategories(),
    databases.listDocuments<ProductDocument>({
      databaseId,
      collectionId: productsCollectionId,
      queries,
    }),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.$id, category.name]));
  const mapped = products.documents.map((document) => mapProductDocument(document, categoryMap));

  if (!options?.query) {
    return mapped;
  }

  const normalizedQuery = options.query.toLowerCase();

  return mapped.filter((product) => {
    return `${product.name} ${product.categoryName}`.toLowerCase().includes(normalizedQuery);
  });
}

export async function getProduct(productId: string) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, productsCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();

  return databases.getDocument<ProductDocument>({
    databaseId,
    collectionId: productsCollectionId,
    documentId: productId,
  });
}

export async function saveProduct(input: SaveProductInput): Promise<ProductRecord> {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const payload = validateProductInput(input);
  const {databaseId, productsCollectionId} = getDatabaseEnv();
  const {databases} = createAdminClient();

  const document = input.id
    ? await databases.updateDocument<ProductDocument>({
        databaseId,
        collectionId: productsCollectionId,
        documentId: input.id,
        data: payload,
      })
    : await databases.createDocument<ProductDocument>({
        databaseId,
        collectionId: productsCollectionId,
        documentId: ID.unique(),
        data: payload,
      });

  const categories = await listCategories();
  const categoryMap = new Map(categories.map((category) => [category.$id, category.name]));

  return mapProductDocument(document, categoryMap);
}

function validateProductInput(input: SaveProductInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('PRODUCT_NAME_REQUIRED');
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error('PRODUCT_PRICE_INVALID');
  }

  if (!Number.isInteger(input.stockQty) || input.stockQty < 0) {
    throw new Error('PRODUCT_STOCK_INVALID');
  }

  return {
    name,
    price: input.price,
    stockQty: input.stockQty,
    categoryId: input.categoryId ?? null,
    isActive: input.isActive ?? true,
  };
}
