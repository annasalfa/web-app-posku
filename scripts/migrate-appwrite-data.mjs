import fs from 'fs';
import path from 'path';

import {Client, Databases, Query} from 'node-appwrite';

loadEnvFile(path.resolve(process.cwd(), '.env'));

const PAGE_SIZE = 100;
const config = {
  endpoint: requiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'),
  projectId: requiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'),
  apiKey: requiredEnv('APPWRITE_API_KEY'),
  databaseId: requiredEnv('APPWRITE_DATABASE_ID'),
  productsCollectionId: requiredEnv('APPWRITE_PRODUCTS_COLLECTION_ID'),
  transactionItemsCollectionId: requiredEnv('APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID'),
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

await migrateTransactionItemSnapshots();

async function migrateTransactionItemSnapshots() {
  const products = await listAllDocuments({
    collectionId: config.productsCollectionId,
    queries: [],
  });
  const productNames = new Map(products.map((product) => [product.$id, product.name]));
  const transactionItems = await listAllDocuments({
    collectionId: config.transactionItemsCollectionId,
    queries: [],
  });
  let updated = 0;

  for (const item of transactionItems) {
    if (typeof item.productNameSnapshot === 'string' && item.productNameSnapshot.trim()) {
      continue;
    }

    const productNameSnapshot = productNames.get(item.productId) ?? item.productId;

    await databases.updateDocument({
      databaseId: config.databaseId,
      collectionId: config.transactionItemsCollectionId,
      documentId: item.$id,
      data: {
        productNameSnapshot,
      },
    });
    updated += 1;
  }

  console.log(`Backfilled productNameSnapshot on ${updated} transaction items.`);
}

async function listAllDocuments({collectionId, queries}) {
  const documents = [];
  let cursorAfter = null;

  while (true) {
    const response = await databases.listDocuments({
      databaseId: config.databaseId,
      collectionId,
      queries: [
        ...queries,
        Query.limit(PAGE_SIZE),
        ...(cursorAfter ? [Query.cursorAfter(cursorAfter)] : []),
      ],
      total: false,
    });

    documents.push(...response.documents);

    if (response.documents.length < PAGE_SIZE) {
      return documents;
    }

    cursorAfter = response.documents.at(-1)?.$id ?? null;

    if (!cursorAfter) {
      return documents;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
