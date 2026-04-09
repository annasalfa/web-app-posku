import 'server-only';

import {cache} from 'react';
import {AppwriteException, type Models} from 'node-appwrite';

import {createAdminClient, createSessionClient} from '@/lib/server/appwrite';
import {hasServerAppwriteEnv} from '@/lib/server/env';
import {clearSessionSecret, getSessionSecret, setSessionSecret} from '@/lib/server/session';

export async function loginWithEmailPassword(email: string, password: string) {
  if (!hasServerAppwriteEnv()) {
    throw new Error('APPWRITE_SERVER_ENV_MISSING');
  }

  const {account} = createAdminClient();
  const session = await account.createEmailPasswordSession({email, password});

  await setSessionSecret(session.secret, session.expire);

  return session;
}

export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  return readCurrentUser();
}

const readCurrentUser = cache(async (): Promise<Models.User<Models.Preferences> | null> => {
  if (!hasServerAppwriteEnv()) {
    return null;
  }

  const sessionSecret = await getSessionSecret();

  if (!sessionSecret) {
    return null;
  }

  try {
    const {account} = createSessionClient(sessionSecret);

    return await account.get();
  } catch {
    return null;
  }
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  return user;
}

export async function logoutCurrentSession() {
  if (!hasServerAppwriteEnv()) {
    await clearSessionSecret();
    return;
  }

  const sessionSecret = await getSessionSecret();

  if (!sessionSecret) {
    await clearSessionSecret();
    return;
  }

  try {
    const {account} = createSessionClient(sessionSecret);
    await account.deleteSession({sessionId: 'current'});
  } catch (error) {
    if (!(error instanceof AppwriteException) || error.code !== 401) {
      throw error;
    }
  } finally {
    await clearSessionSecret();
  }
}

export function getAuthErrorMessage(error: unknown, locale: 'id' | 'en') {
  if (error instanceof Error && error.message === 'APPWRITE_SERVER_ENV_MISSING') {
    return locale === 'id'
      ? 'Konfigurasi server Appwrite belum lengkap.'
      : 'Appwrite server configuration is incomplete.';
  }

  if (error instanceof AppwriteException && (error.code === 401 || error.code === 404)) {
    return locale === 'id' ? 'Email atau password tidak valid.' : 'Invalid email or password.';
  }

  return locale === 'id'
    ? 'Terjadi kesalahan saat masuk. Coba lagi.'
    : 'Unable to sign in right now. Please try again.';
}
