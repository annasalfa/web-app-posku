import {Client, Databases, ID, Query, type Models} from 'node-appwrite';

type CategoryDocument = Models.Document & {
  name: string;
};

type ProductDocument = Models.Document & {
  name: string;
  price: number;
  stockQty: number;
  categoryId?: string | null;
  isActive: boolean;
};

type TransactionItemDocument = Models.Document & {
  transactionId: string;
  productId: string;
};

type StockLogDocument = Models.Document & {
  productId: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Playwright Appwrite helpers.`);
  }

  return value;
}

function createDatabases() {
  const client = new Client()
    .setEndpoint(requireEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'))
    .setProject(requireEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'))
    .setKey(requireEnv('APPWRITE_API_KEY'));

  return new Databases(client);
}

function getIds() {
  return {
    databaseId: requireEnv('APPWRITE_DATABASE_ID'),
    categoriesCollectionId: requireEnv('APPWRITE_CATEGORIES_COLLECTION_ID'),
    productsCollectionId: requireEnv('APPWRITE_PRODUCTS_COLLECTION_ID'),
    transactionsCollectionId: requireEnv('APPWRITE_TRANSACTIONS_COLLECTION_ID'),
    transactionItemsCollectionId: requireEnv('APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID'),
    stockLogsCollectionId: requireEnv('APPWRITE_STOCK_LOGS_COLLECTION_ID'),
  };
}

export async function getFirstCategory() {
  const databases = createDatabases();
  const {databaseId, categoriesCollectionId} = getIds();
  const result = await databases.listDocuments<CategoryDocument>({
    databaseId,
    collectionId: categoriesCollectionId,
    queries: [Query.orderAsc('name'), Query.limit(1)],
  });

  return result.documents[0] ?? null;
}

export async function findProductByName(name: string) {
  const databases = createDatabases();
  const {databaseId, productsCollectionId} = getIds();
  const result = await databases.listDocuments<ProductDocument>({
    databaseId,
    collectionId: productsCollectionId,
    queries: [Query.equal('name', name), Query.limit(1)],
  });

  return result.documents[0] ?? null;
}

export async function createProduct(input: {
  name: string;
  price: number;
  stockQty: number;
  categoryId?: string | null;
  isActive?: boolean;
}) {
  const databases = createDatabases();
  const {databaseId, productsCollectionId} = getIds();

  return databases.createDocument<ProductDocument>({
    databaseId,
    collectionId: productsCollectionId,
    documentId: ID.unique(),
    data: {
      name: input.name,
      price: input.price,
      stockQty: input.stockQty,
      categoryId: input.categoryId ?? null,
      isActive: input.isActive ?? true,
    },
  });
}

export async function cleanupProductArtifacts(productId: string) {
  const databases = createDatabases();
  const {
    databaseId,
    productsCollectionId,
    transactionsCollectionId,
    transactionItemsCollectionId,
    stockLogsCollectionId,
  } = getIds();

  const stockLogs = await databases.listDocuments<StockLogDocument>({
    databaseId,
    collectionId: stockLogsCollectionId,
    queries: [Query.equal('productId', productId), Query.limit(200)],
  });

  for (const log of stockLogs.documents) {
    await safeRun(() =>
      databases.deleteDocument({
        databaseId,
        collectionId: stockLogsCollectionId,
        documentId: log.$id,
      }),
    );
  }

  const transactionItems = await databases.listDocuments<TransactionItemDocument>({
    databaseId,
    collectionId: transactionItemsCollectionId,
    queries: [Query.equal('productId', productId), Query.limit(200)],
  });

  const transactionIds = new Set(transactionItems.documents.map((item) => item.transactionId));

  for (const item of transactionItems.documents) {
    await safeRun(() =>
      databases.deleteDocument({
        databaseId,
        collectionId: transactionItemsCollectionId,
        documentId: item.$id,
      }),
    );
  }

  for (const transactionId of transactionIds) {
    await safeRun(() =>
      databases.deleteDocument({
        databaseId,
        collectionId: transactionsCollectionId,
        documentId: transactionId,
      }),
    );
  }

  await safeRun(() =>
    databases.deleteDocument({
      databaseId,
      collectionId: productsCollectionId,
      documentId: productId,
    }),
  );
}

async function safeRun(task: () => Promise<unknown>) {
  try {
    await task();
  } catch {
    return;
  }
}
