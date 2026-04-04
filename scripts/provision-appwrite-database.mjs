import fs from 'fs';
import path from 'path';

import {
  Client,
  Databases,
  DatabasesIndexType,
  OrderBy,
  Permission,
  Role,
} from 'node-appwrite';

loadEnvFile(path.resolve(process.cwd(), '.env'));

const config = {
  endpoint: requiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'),
  projectId: requiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'),
  apiKey: requiredEnv('APPWRITE_API_KEY'),
  databaseId: requiredEnv('APPWRITE_DATABASE_ID'),
  collections: {
    products: requiredEnv('APPWRITE_PRODUCTS_COLLECTION_ID'),
    categories: requiredEnv('APPWRITE_CATEGORIES_COLLECTION_ID'),
    transactions: requiredEnv('APPWRITE_TRANSACTIONS_COLLECTION_ID'),
    transactionItems: requiredEnv('APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID'),
    stockLogs: requiredEnv('APPWRITE_STOCK_LOGS_COLLECTION_ID'),
  },
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

const COLLECTIONS = [
  {
    id: config.collections.categories,
    name: 'Categories',
    attributes: [
      {type: 'string', key: 'name', size: 255, required: true},
    ],
    indexes: [
      {key: 'categories_name_key', type: DatabasesIndexType.Key, attributes: ['name'], orders: [OrderBy.Asc]},
    ],
  },
  {
    id: config.collections.products,
    name: 'Products',
    attributes: [
      {type: 'string', key: 'name', size: 255, required: true},
      {type: 'float', key: 'price', required: true, min: 0},
      {type: 'integer', key: 'stockQty', required: true, min: 0},
      {type: 'string', key: 'categoryId', size: 36, required: false},
      {type: 'boolean', key: 'isActive', required: true},
    ],
    indexes: [
      {key: 'products_category_id_key', type: DatabasesIndexType.Key, attributes: ['categoryId'], orders: [OrderBy.Asc]},
      {key: 'products_is_active_key', type: DatabasesIndexType.Key, attributes: ['isActive'], orders: [OrderBy.Asc]},
    ],
  },
  {
    id: config.collections.transactions,
    name: 'Transactions',
    attributes: [
      {type: 'float', key: 'totalAmount', required: true, min: 0},
      {type: 'float', key: 'amountPaid', required: true, min: 0},
      {type: 'float', key: 'changeAmount', required: true, min: 0},
      {type: 'string', key: 'paymentMethod', size: 20, required: true},
      {type: 'string', key: 'notes', size: 1024, required: false},
    ],
    indexes: [
      {key: 'transactions_payment_method_key', type: DatabasesIndexType.Key, attributes: ['paymentMethod'], orders: [OrderBy.Asc]},
    ],
  },
  {
    id: config.collections.transactionItems,
    name: 'Transaction Items',
    attributes: [
      {type: 'string', key: 'transactionId', size: 36, required: true},
      {type: 'string', key: 'productId', size: 36, required: true},
      {type: 'integer', key: 'quantity', required: true, min: 1},
      {type: 'float', key: 'unitPrice', required: true, min: 0},
      {type: 'float', key: 'subtotal', required: true, min: 0},
    ],
    indexes: [
      {key: 'transaction_items_transaction_id_key', type: DatabasesIndexType.Key, attributes: ['transactionId'], orders: [OrderBy.Asc]},
      {key: 'transaction_items_product_id_key', type: DatabasesIndexType.Key, attributes: ['productId'], orders: [OrderBy.Asc]},
    ],
  },
  {
    id: config.collections.stockLogs,
    name: 'Stock Logs',
    attributes: [
      {type: 'string', key: 'productId', size: 36, required: true},
      {type: 'integer', key: 'changeQty', required: true},
      {type: 'integer', key: 'stockBefore', required: true, min: 0},
      {type: 'integer', key: 'stockAfter', required: true, min: 0},
      {type: 'string', key: 'reason', size: 64, required: true},
      {type: 'string', key: 'transactionId', size: 36, required: false},
    ],
    indexes: [
      {key: 'stock_logs_product_id_key', type: DatabasesIndexType.Key, attributes: ['productId'], orders: [OrderBy.Asc]},
    ],
  },
];

await provision();

async function provision() {
  for (const collection of COLLECTIONS) {
    await ensureCollection(collection);
    await ensureAttributes(collection);
    await ensureIndexes(collection);
  }

  console.log('Appwrite database provisioning complete.');
}

async function ensureCollection(collection) {
  const existing = await maybe(
    databases.getCollection({
      databaseId: config.databaseId,
      collectionId: collection.id,
    }),
  );

  if (existing) {
    console.log(`Collection exists: ${collection.id}`);
    return;
  }

  await databases.createCollection({
    databaseId: config.databaseId,
    collectionId: collection.id,
    name: collection.name,
    permissions: defaultCollectionPermissions(),
    documentSecurity: false,
    enabled: true,
  });

  console.log(`Created collection: ${collection.id}`);
}

async function ensureAttributes(collection) {
  for (const attribute of collection.attributes) {
    const existing = await maybe(
      databases.getAttribute({
        databaseId: config.databaseId,
        collectionId: collection.id,
        key: attribute.key,
      }),
    );

    if (!existing) {
      await createAttribute(collection.id, attribute);
      console.log(`Created attribute ${collection.id}.${attribute.key}`);
    } else {
      console.log(`Attribute exists: ${collection.id}.${attribute.key}`);
    }

    await waitForAttribute(collection.id, attribute.key);
  }
}

async function ensureIndexes(collection) {
  for (const index of collection.indexes) {
    const existing = await maybe(
      databases.getIndex({
        databaseId: config.databaseId,
        collectionId: collection.id,
        key: index.key,
      }),
    );

    if (existing) {
      console.log(`Index exists: ${collection.id}.${index.key}`);
      continue;
    }

    await databases.createIndex({
      databaseId: config.databaseId,
      collectionId: collection.id,
      key: index.key,
      type: index.type,
      attributes: index.attributes,
      orders: index.orders,
    });

    console.log(`Created index ${collection.id}.${index.key}`);
  }
}

async function createAttribute(collectionId, attribute) {
  const base = {
    databaseId: config.databaseId,
    collectionId,
    key: attribute.key,
    required: attribute.required,
  };

  if (attribute.type === 'string') {
    return databases.createStringAttribute({
      ...base,
      size: attribute.size,
      xdefault: attribute.xdefault,
      array: false,
      encrypt: false,
    });
  }

  if (attribute.type === 'integer') {
    return databases.createIntegerAttribute({
      ...base,
      min: attribute.min,
      max: attribute.max,
      xdefault: attribute.xdefault,
      array: false,
    });
  }

  if (attribute.type === 'float') {
    return databases.createFloatAttribute({
      ...base,
      min: attribute.min,
      max: attribute.max,
      xdefault: attribute.xdefault,
      array: false,
    });
  }

  if (attribute.type === 'boolean') {
    return databases.createBooleanAttribute({
      ...base,
      xdefault: attribute.xdefault,
      array: false,
    });
  }

  if (attribute.type === 'datetime') {
    return databases.createDatetimeAttribute({
      ...base,
      xdefault: attribute.xdefault,
      array: false,
    });
  }

  throw new Error(`Unsupported attribute type: ${attribute.type}`);
}

async function waitForAttribute(collectionId, key) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120000) {
    const attribute = await databases.getAttribute({
      databaseId: config.databaseId,
      collectionId,
      key,
    });

    if (attribute.status === 'available') {
      return;
    }

    if (attribute.status === 'failed') {
      throw new Error(`Attribute failed: ${collectionId}.${key} -> ${attribute.error}`);
    }

    await sleep(1500);
  }

  throw new Error(`Timed out waiting for attribute: ${collectionId}.${key}`);
}

function defaultCollectionPermissions() {
  return [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];
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

async function maybe(promise) {
  try {
    return await promise;
  } catch (error) {
    if (error?.code === 404) {
      return null;
    }

    throw error;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
