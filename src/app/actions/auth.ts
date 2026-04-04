'use server';

import {redirect} from 'next/navigation';

import {getAuthErrorMessage, loginWithEmailPassword, logoutCurrentSession} from '@/lib/server/auth';

export type LoginActionState = {
  message: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const locale = normalizeLocale(String(formData.get('locale') ?? 'id'));
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return {
      message: locale === 'id' ? 'Email dan password wajib diisi.' : 'Email and password are required.',
    };
  }

  try {
    await loginWithEmailPassword(email, password);
  } catch (error) {
    return {
      message: getAuthErrorMessage(error, locale),
    };
  }

  redirect(`/${locale}`);
}

export async function logoutAction(locale: string) {
  await logoutCurrentSession();
  redirect(`/${normalizeLocale(locale)}/login`);
}

function normalizeLocale(locale: string) {
  return locale === 'en' ? 'en' : 'id';
}
