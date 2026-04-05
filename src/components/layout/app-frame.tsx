'use client';

import {Menu, WifiOff} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
import {useMemo, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet';
import {StatusBadge} from '@/components/ui/pos';
import {Link} from '@/i18n/navigation';
import {NAV_ITEMS} from '@/lib/constants/navigation';
import {cn} from '@/lib/utils/cn';
import {useOnlineStatus} from '@/lib/utils/use-online-status';

export function AppFrame({
  children,
  authenticated,
}: {
  children: ReactNode;
  authenticated: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const shell = useTranslations('shell');
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const [navOpen, setNavOpen] = useState(false);

  const isLoginRoute = useMemo(() => pathname?.endsWith('/login') ?? false, [pathname]);

  const currentNav = NAV_ITEMS.find(
    (item) => pathname === `/${locale}${item.href}` || (item.href === '/' && pathname === `/${locale}`),
  );

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="shell-highlight min-h-dvh bg-background">
      <a href="#main-content" className="skip-link">
        {shell('skipToContent')}
      </a>

      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] gap-4 px-3 py-3 md:px-4 md:py-4 xl:gap-5 xl:px-5">
        <aside className="hidden md:flex md:w-[14rem] xl:w-[18rem]">
          <DesktopRail locale={locale} pathname={pathname ?? ''} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 mb-4 rounded-[calc(var(--radius-card)+4px)] border border-border/80 bg-card/92 px-4 py-3 shadow-sm backdrop-blur md:px-5">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="md:hidden"
                aria-label={shell('openNavigation')}
                onClick={() => setNavOpen(true)}
              >
                <Menu className="size-5" />
              </Button>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t('common.appName')}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-xl font-bold tracking-[-0.03em] md:text-2xl">
                    {currentNav ? t(`nav.${currentNav.labelKey}`) : t('common.appName')}
                  </p>
                  <span className="hidden text-sm text-muted-foreground md:inline">
                    {t('common.ownerMode')}
                  </span>
                </div>
              </div>

              {authenticated ? (
                <div className="hidden items-center gap-2 md:flex">
                  <StatusBadge tone={isOnline ? 'success' : 'danger'}>
                    {isOnline ? t('common.onlineStatus') : t('common.offlineStatus')}
                  </StatusBadge>
                </div>
              ) : null}
            </div>

            {!isOnline && authenticated ? (
              <div className="mt-3 flex items-start gap-3 rounded-[var(--radius-large)] border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <WifiOff className="mt-0.5 size-4 shrink-0" />
                <span>{t('common.offline')}</span>
              </div>
            ) : null}
          </header>

          <main id="main-content" className="min-w-0 pb-4 focus:outline-none" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-[min(22rem,92vw)] bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="border-b border-sidebar-border px-6 py-5 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('common.appName')}
            </p>
            <SheetTitle className="text-2xl font-bold tracking-[-0.04em]">
              {shell('brandTitle')}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 py-4">
            <MobileRail locale={locale} pathname={pathname ?? ''} onNavigate={() => setNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DesktopRail({locale, pathname}: {locale: string; pathname: string}) {
  const t = useTranslations();
  const shell = useTranslations('shell');

  return (
    <div className="surface-grid sticky top-4 flex h-[calc(100dvh-2rem)] w-full flex-col rounded-[calc(var(--radius-card)+8px)] border border-sidebar-border bg-sidebar px-3 py-4 shadow-sm xl:px-4 xl:py-5">
      <div className="mb-8 rounded-[var(--radius-card)] border border-sidebar-border/80 bg-background/70 px-3 py-4 xl:px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t('common.appName')}
        </p>
        <div className="mt-2">
          <h1 className="text-[1.45rem] font-bold tracking-[-0.05em] xl:text-[1.8rem]">
            {shell('brandTitle')}
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t('common.ownerMode')}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === `/${locale}${item.href}` || (item.href === '/' && pathname === `/${locale}`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex min-h-14 items-center gap-3 rounded-[var(--radius-large)] border px-4 text-sm font-semibold transition-colors',
                active
                  ? 'border-primary/20 bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="truncate">{t(`nav.${item.labelKey}`)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function MobileRail({
  locale,
  pathname,
  onNavigate,
}: {
  locale: string;
  pathname: string;
  onNavigate: () => void;
}) {
  const t = useTranslations();

  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === `/${locale}${item.href}` || (item.href === '/' && pathname === `/${locale}`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-[var(--radius-large)] border px-4 text-sm font-semibold transition-colors',
              active
                ? 'border-primary/20 bg-sidebar-accent text-sidebar-accent-foreground'
                : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <item.icon className="size-5 shrink-0" />
            <span>{t(`nav.${item.labelKey}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
