'use client';

import {startTransition, useTransition} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useTheme} from 'next-themes';

import {logoutAction} from '@/app/actions/auth';
import {Button, DataCard, PageTransition, SegmentedControl, StatusBadge} from '@/components/ui';
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
    <PageTransition className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <DataCard title={common('theme')} description={t('appearance')}>
          <SegmentedControl
            value={mounted ? theme ?? 'system' : 'system'}
            onChange={(value) => setTheme(value)}
            ariaLabel={common('theme')}
            options={[
              {label: common('light'), value: 'light'},
              {label: common('dark'), value: 'dark'},
              {label: common('system'), value: 'system'},
            ]}
          />
        </DataCard>

        <DataCard title={common('language')} description={t('locale')}>
          <SegmentedControl
            value={locale as 'id' | 'en'}
            onChange={(value) => switchLocale(value as 'id' | 'en')}
            ariaLabel={common('language')}
            options={[
              {label: 'Bahasa Indonesia', value: 'id'},
              {label: 'English', value: 'en'},
            ]}
          />
        </DataCard>
      </div>

      <DataCard title={t('frontendReadiness')} description={t('integration')}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[var(--radius-large)] border border-border bg-muted/35 p-4">
            <p className="text-sm font-semibold">{t('appwrite')}</p>
            <div className="mt-3">
              <StatusBadge tone={hasAppwrite ? 'success' : 'warning'}>
                {hasAppwrite ? t('configured') : t('missingEnv')}
              </StatusBadge>
            </div>
          </div>
          <div className="rounded-[var(--radius-large)] border border-border bg-muted/35 p-4">
            <p className="text-sm font-semibold">{t('realtimeChannel')}</p>
            <div className="mt-3">
              <StatusBadge tone={hasAppwrite ? 'success' : 'neutral'}>
                {hasAppwrite ? t('readyToSubscribe') : t('standby')}
              </StatusBadge>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Button variant="secondary" onClick={logout} loading={logoutPending}>
            {logoutPending ? t('signingOut') : t('signOut')}
          </Button>
        </div>
      </DataCard>
    </PageTransition>
  );
}
