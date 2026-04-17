import fs from 'fs';
import path from 'path';

import {Client, Databases} from 'node-appwrite';

loadEnvFile(path.resolve(process.cwd(), '.env'));

const config = {
  endpoint: requiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'),
  projectId: requiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'),
  apiKey: requiredEnv('APPWRITE_API_KEY'),
  databaseId: requiredEnv('APPWRITE_DATABASE_ID'),
  categoriesCollectionId: requiredEnv('APPWRITE_CATEGORIES_COLLECTION_ID'),
  productsCollectionId: requiredEnv('APPWRITE_PRODUCTS_COLLECTION_ID'),
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

const categories = [
  {id: 'cat-coffee', name: 'Coffee'},
  {id: 'cat-tea', name: 'Tea'},
  {id: 'cat-pastry', name: 'Pastry'},
  {id: 'cat-rice-bowl', name: 'Rice Bowl'},
  {id: 'cat-cold-bar', name: 'Cold Bar'},
];

const products = [
  {id: 'prd-1', name: 'Espresso Tonic', categoryId: 'cat-coffee', price: 32000, isActive: true},
  {id: 'prd-2', name: 'Cloud Latte', categoryId: 'cat-coffee', price: 30000, isActive: true},
  {id: 'prd-3', name: 'Gyokuro Lemon', categoryId: 'cat-tea', price: 28000, isActive: true},
  {id: 'prd-4', name: 'Burnt Butter Kouign', categoryId: 'cat-pastry', price: 26000, isActive: true},
  {id: 'prd-5', name: 'Miso Chicken Bowl', categoryId: 'cat-rice-bowl', price: 46000, isActive: true},
  {id: 'prd-6', name: 'Yuzu Sparkler', categoryId: 'cat-cold-bar', price: 27000, isActive: true},
  {id: 'prd-7', name: 'Black Sesame Bun', categoryId: 'cat-pastry', price: 21000, isActive: true},
  {id: 'prd-8', name: 'House Cold Brew', categoryId: 'cat-coffee', price: 29000, isActive: true},
];

await seed();

async function seed() {
  for (const category of categories) {
    await upsertDocument(config.categoriesCollectionId, category.id, {name: category.name});
    console.log(`Seeded category: ${category.id}`);
  }

  for (const product of products) {
    const {id, ...data} = product;
    await upsertDocument(config.productsCollectionId, id, data);
    console.log(`Seeded product: ${product.id}`);
  }

  console.log('Seed data complete.');
}

async function upsertDocument(collectionId, documentId, data) {
  const existing = await maybe(
    databases.getDocument({
      databaseId: config.databaseId,
      collectionId,
      documentId,
    }),
  );

  if (existing) {
    return databases.updateDocument({
      databaseId: config.databaseId,
      collectionId,
      documentId,
      data,
    });
  }

  return databases.createDocument({
    databaseId: config.databaseId,
    collectionId,
    documentId,
    data,
  });
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
