import 'server-only';

import {AppwriteException, Query, type Databases, type Models} from 'node-appwrite';

import {createAdminClient} from '@/lib/server/appwrite';

const DEFAULT_PAGE_SIZE = 100;

export type ServerReadResult<T> = {
  data: T;
  error: boolean;
};

export async function listAllDocuments<Document extends Models.Document>(input: {
  databaseId: string;
  collectionId: string;
  queries?: string[];
  maxDocuments?: number;
  pageSize?: number;
  transactionId?: string;
}) {
  const {databases} = createAdminClient();
  const documents: Document[] = [];
  const pageSize = normalizePageSize(input.pageSize);
  let cursorAfter: string | null = null;

  while (true) {
    const response: Models.DocumentList<Document> = await databases.listDocuments<Document>({
      databaseId: input.databaseId,
      collectionId: input.collectionId,
      queries: [
        ...(input.queries ?? []),
        Query.limit(pageSize),
        ...(cursorAfter ? [Query.cursorAfter(cursorAfter)] : []),
      ],
      transactionId: input.transactionId,
      total: false,
    });

    documents.push(...response.documents);

    if (typeof input.maxDocuments === 'number' && documents.length >= input.maxDocuments) {
      return documents.slice(0, input.maxDocuments);
    }

    if (response.documents.length < pageSize) {
      return documents;
    }

    cursorAfter = response.documents.at(-1)?.$id ?? null;

    if (!cursorAfter) {
      return documents;
    }
  }
}

export async function runInDatabaseTransaction<T>(
  task: (context: {databases: Databases; transactionId: string}) => Promise<T>,
) {
  const {databases} = createAdminClient();
  const transaction = await databases.createTransaction({ttl: 120});

  try {
    const result = await task({databases, transactionId: transaction.$id});

    await databases.updateTransaction({
      transactionId: transaction.$id,
      commit: true,
    });

    return result;
  } catch (error) {
    await safeRollbackTransaction(databases, transaction.$id, error);
    throw error;
  }
}

export async function readWithFallback<T>(input: {
  fallback: T;
  label: string;
  read: () => Promise<T>;
  retries?: number;
}) {
  const retries = Math.max(0, input.retries ?? 1);
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const data = await input.read();
      return {data, error: false} satisfies ServerReadResult<T>;
    } catch (error) {
      const canRetry = attempt < retries && isRetryableReadError(error);

      if (canRetry) {
        await waitForRetry(attempt + 1);
        attempt += 1;
        continue;
      }

      console.error(`[server-read] ${input.label}`, error);
      return {data: input.fallback, error: true} satisfies ServerReadResult<T>;
    }
  }

  return {data: input.fallback, error: true} satisfies ServerReadResult<T>;
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isInteger(value) || !value || value <= 0) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(value, DEFAULT_PAGE_SIZE);
}

function isRetryableReadError(error: unknown) {
  if (error instanceof AppwriteException) {
    return error.code >= 500 || error.code === 429;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = `${error.name} ${error.message}`.toLowerCase();

  return (
    message.includes('timedout') ||
    message.includes('timeout') ||
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('econnrefused')
  );
}

async function safeRollbackTransaction(databases: Databases, transactionId: string, rootError: unknown) {
  try {
    await databases.updateTransaction({
      transactionId,
      rollback: true,
    });
  } catch (rollbackError) {
    console.error('[database-transaction] rollback failed', {
      transactionId,
      rootError,
      rollbackError,
    });
  }
}

async function waitForRetry(attempt: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, 200 * attempt);
  });
}
