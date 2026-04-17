import 'server-only';

import {ID, Query} from 'node-appwrite';

import {createAdminClient} from '@/lib/server/appwrite';
import {listAllDocuments} from '@/lib/server/database';
import {getDatabaseEnv, hasDatabaseAppwriteEnv} from '@/lib/server/env';
import {
  type CategoryDocument,
  mapProductDocument,
  type ProductDocument,
  type ProductRecord,
  type SaveProductInput,
} from '@/lib/server/pos-types';

const LEGACY_PRODUCT_STOCK_QTY = 0;

export async function listCategories() {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, categoriesCollectionId} = getDatabaseEnv();
  const categories = await listAllDocuments<CategoryDocument>({
    databaseId,
    collectionId: categoriesCollectionId,
    queries: [Query.orderAsc('name')],
  });

  return categories;
}

export async function listProducts(options?: {
  activeOnly?: boolean;
  query?: string;
}) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const {databaseId, productsCollectionId} = getDatabaseEnv();
  const queries = [Query.orderAsc('name')];

  if (options?.activeOnly) {
    queries.push(Query.equal('isActive', true));
  }

  const [categories, products] = await Promise.all([
    listCategories(),
    listAllDocuments<ProductDocument>({
      databaseId,
      collectionId: productsCollectionId,
      queries,
    }),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [category.$id, category.name]),
  );
  const mapped = products.map((document) =>
    mapProductDocument(document, categoryMap),
  );

  if (!options?.query) {
    return mapped;
  }

  const normalizedQuery = options.query.toLowerCase();

  return mapped.filter((product) => {
    return `${product.name} ${product.categoryName}`
      .toLowerCase()
      .includes(normalizedQuery);
  });
}

export async function listProductsByIds(productIds: string[]) {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return [];
  }

  const {databaseId, productsCollectionId} = getDatabaseEnv();
  const [categories, products] = await Promise.all([
    listCategories(),
    listAllDocuments<ProductDocument>({
      databaseId,
      collectionId: productsCollectionId,
      queries: [Query.equal('$id', uniqueIds)],
    }),
  ]);

  const categoryMap = new Map(
    categories.map((category) => [category.$id, category.name]),
  );
  return products.map((document) => mapProductDocument(document, categoryMap));
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

export async function saveProduct(
  input: SaveProductInput,
): Promise<ProductRecord> {
  if (!hasDatabaseAppwriteEnv()) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  const payload = buildProductWritePayload(input);
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
  const categoryMap = new Map(
    categories.map((category) => [category.$id, category.name]),
  );

  return mapProductDocument(document, categoryMap);
}

function buildProductWritePayload(input: SaveProductInput) {
  const name = input.name.trim();

  if (!name) {
    throw new Error('PRODUCT_NAME_REQUIRED');
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error('PRODUCT_PRICE_INVALID');
  }

  return {
    name,
    price: input.price,
    categoryId: input.categoryId ?? null,
    isActive: input.isActive ?? true,
    // Keep legacy Appwrite schemas writable while stock stays removed from the app domain.
    stockQty: LEGACY_PRODUCT_STOCK_QTY,
  };
}
