import 'server-only';

import {cookies} from 'next/headers';

export const SESSION_COOKIE_NAME = 'posku-session';

export async function getSessionSecret() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function setSessionSecret(secret: string, expire: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expire),
  });
}

export async function clearSessionSecret() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}
