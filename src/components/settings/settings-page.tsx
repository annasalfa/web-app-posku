'use client';

import {startTransition, useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';

import {logoutAction} from '@/app/actions/auth';
import {Button, Panel, SectionHeader, StatusPill} from '@/components/shared/ui';
import {usePathname, useRouter} from '@/i18n/navigation';
import {createBrowserClient} from '@/lib/appwrite/client';
import {useMounted} from '@/lib/utils/use-online-status';

export function SettingsPage() {
  const t = useTranslations('settings');
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const {theme, setTheme} = useTheme();
  const mounted = useMounted();
  const [logoutPending, startLogoutTransition] = useTransition();

  const hasAppwrite = Boolean(createBrowserClient());

  function switchLocale(nextLocale: 'id' | 'en') {
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  function logout() {
    startLogoutTransition(async () => {
      await logoutAction(locale);
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{common('theme')}</h2>
          <div className="flex flex-wrap gap-3">
            {['light', 'dark', 'system'].map((option) => (
              <Button
                key={option}
                variant={mounted && theme === option ? 'primary' : 'secondary'}
                onClick={() => setTheme(option)}
              >
                {common(option as 'light' | 'dark' | 'system')}
              </Button>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{common('language')}</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant={locale === 'id' ? 'primary' : 'secondary'} onClick={() => switchLocale('id')}>
              Bahasa Indonesia
            </Button>
            <Button variant={locale === 'en' ? 'primary' : 'secondary'} onClick={() => switchLocale('en')}>
              English
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="space-y-4 bg-[var(--color-surface-container-low)]">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{t('frontendReadiness')}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-[var(--color-surface-container-lowest)] p-4">
            <p className="text-sm font-semibold">{t('appwrite')}</p>
            <div className="mt-3">
              <StatusPill tone={hasAppwrite ? 'success' : 'warning'}>
                {hasAppwrite ? t('configured') : t('missingEnv')}
              </StatusPill>
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-[var(--color-surface-container-lowest)] p-4">
            <p className="text-sm font-semibold">{t('realtimeChannel')}</p>
            <div className="mt-3">
              <StatusPill tone={hasAppwrite ? 'success' : 'neutral'}>
                {hasAppwrite ? t('readyToSubscribe') : t('standby')}
              </StatusPill>
            </div>
          </div>
        </div>
        <div>
          <Button variant="ghost" onClick={logout} disabled={logoutPending}>
            {logoutPending ? t('signingOut') : t('signOut')}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
