import 'server-only';

type ServerEnvName = 'NEXT_PUBLIC_APPWRITE_ENDPOINT' | 'NEXT_PUBLIC_APPWRITE_PROJECT_ID' | 'APPWRITE_API_KEY';
type DatabaseEnvName =
  | 'APPWRITE_DATABASE_ID'
  | 'APPWRITE_PRODUCTS_COLLECTION_ID'
  | 'APPWRITE_CATEGORIES_COLLECTION_ID'
  | 'APPWRITE_TRANSACTIONS_COLLECTION_ID'
  | 'APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID';

function readEnv(name: ServerEnvName | DatabaseEnvName) {
  const value = process.env[name];

  return value ?? null;
}

export function hasServerAppwriteEnv() {
  return Boolean(
    readEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT') &&
      readEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID') &&
      readEnv('APPWRITE_API_KEY'),
  );
}

export function getServerEnv() {
  const endpoint = readEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT');
  const projectId = readEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  const apiKey = readEnv('APPWRITE_API_KEY');

  if (!endpoint || !projectId || !apiKey) {
    throw new Error('APPWRITE_SERVER_ENV_MISSING');
  }

  return {
    endpoint,
    projectId,
    apiKey,
  };
}

export function hasDatabaseAppwriteEnv() {
  return Boolean(
    hasServerAppwriteEnv() &&
      readEnv('APPWRITE_DATABASE_ID') &&
      readEnv('APPWRITE_PRODUCTS_COLLECTION_ID') &&
      readEnv('APPWRITE_CATEGORIES_COLLECTION_ID') &&
      readEnv('APPWRITE_TRANSACTIONS_COLLECTION_ID') &&
      readEnv('APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID'),
  );
}

export function getDatabaseEnv() {
  const databaseId = readEnv('APPWRITE_DATABASE_ID');
  const productsCollectionId = readEnv('APPWRITE_PRODUCTS_COLLECTION_ID');
  const categoriesCollectionId = readEnv('APPWRITE_CATEGORIES_COLLECTION_ID');
  const transactionsCollectionId = readEnv('APPWRITE_TRANSACTIONS_COLLECTION_ID');
  const transactionItemsCollectionId = readEnv('APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID');

  if (
    !databaseId ||
    !productsCollectionId ||
    !categoriesCollectionId ||
    !transactionsCollectionId ||
    !transactionItemsCollectionId
  ) {
    throw new Error('APPWRITE_DATABASE_ENV_MISSING');
  }

  return {
    databaseId,
    productsCollectionId,
    categoriesCollectionId,
    transactionsCollectionId,
    transactionItemsCollectionId,
  };
}
