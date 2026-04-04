'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useActionState, useId} from 'react';

import {loginAction} from '@/app/actions/auth';
import {Button, Input, Panel} from '@/components/shared/ui';

const initialLoginActionState = {
  message: '',
};

export function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(loginAction, initialLoginActionState);
  const emailId = useId();
  const passwordId = useId();

  return (
    <div className="grid min-h-screen gap-6 px-4 py-6 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="rounded-[2.5rem] bg-[var(--color-surface-container-low)] p-6 md:p-10 lg:min-h-[80vh] lg:p-12">
        <div className="mt-12 max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">POSKU</p>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.08em] md:text-7xl">{t('heroTitle')}</h1>
          <p className="max-w-lg text-base leading-7 text-[var(--color-muted)] md:text-lg">{t('heroDescription')}</p>
        </div>
      </div>

      <Panel className="mx-auto w-full max-w-xl p-6 md:p-8">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] md:text-4xl">{t('title')}</h2>
          <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
        </div>

        <form className="mt-8 space-y-4" action={formAction}>
          <input type="hidden" name="locale" value={locale} />
          <div className="space-y-2">
            <label htmlFor={emailId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {t('email')}
            </label>
            <Input id={emailId} name="email" type="email" autoComplete="email" defaultValue="owner@posku.app" />
          </div>
          <div className="space-y-2">
            <label htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {t('password')}
            </label>
            <Input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="demo-posku"
            />
          </div>
          {state.message ? (
            <p role="alert" aria-live="polite" className="text-sm text-[var(--color-error)]">
              {state.message}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? t('signingIn') : t('submit')}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[var(--color-muted)]">{t('hint')}</p>
      </Panel>
    </div>
  );
}
