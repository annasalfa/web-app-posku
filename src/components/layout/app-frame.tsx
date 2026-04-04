'use client';

import {Menu, WifiOff, X} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';

import {Link} from '@/i18n/navigation';
import {NAV_ITEMS} from '@/lib/constants/navigation';
import {cn} from '@/lib/utils/cn';
import {useOnlineStatus} from '@/lib/utils/use-online-status';

export function AppFrame({
  children,
  authenticated,
}: {
  children: React.ReactNode;
  authenticated: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations();
  const shell = useTranslations('shell');
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const [navOpen, setNavOpen] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const wasNavOpenRef = useRef(false);

  const isLoginRoute = useMemo(() => pathname?.endsWith('/login') ?? false, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (navOpen) {
      document.body.style.overflow = 'hidden';
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;

      window.requestAnimationFrame(() => {
        const focusables = getFocusableElements(drawerRef.current);
        (focusables[0] ?? drawerRef.current)?.focus();
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setNavOpen(false);
          return;
        }

        if (event.key !== 'Tab') {
          return;
        }

        const focusables = getFocusableElements(drawerRef.current);

        if (focusables.length === 0) {
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    document.body.style.overflow = previousOverflow;

    if (wasNavOpenRef.current) {
      (lastFocusedElementRef.current ?? menuButtonRef.current)?.focus();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  useEffect(() => {
    wasNavOpenRef.current = navOpen;
  }, [navOpen]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh px-4 py-4 md:px-6 md:py-6">
      <a href="#main-content" className="skip-link">
        {shell('skipToContent')}
      </a>

      {!isOnline ? (
        <div className="mb-4 flex min-h-14 items-center gap-3 rounded-[1.5rem] bg-[rgb(186_26_26/10%)] px-4 text-sm text-[var(--color-error)]">
          <WifiOff className="h-5 w-5" />
          <span>{t('common.offline')}</span>
        </div>
      ) : null}

      {navOpen ? (
        <>
          <button
            type="button"
            aria-label={shell('closeNavigation')}
            className="fixed inset-0 z-40 bg-[rgb(28_27_27/28%)] md:hidden"
            onClick={() => setNavOpen(false)}
          />
          <aside
            ref={drawerRef}
            tabIndex={-1}
            className="paper-panel fixed inset-y-4 left-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col rounded-[2rem] p-5 md:hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <BrandBlock />
              <button
                type="button"
                aria-label={shell('closeNavigation')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-container-low)]"
                onClick={() => setNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === `/${locale}${item.href}` || (item.href === '/' && pathname === `/${locale}`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-[1.5rem] px-4 text-sm font-semibold transition',
                      active
                        ? 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]'
                        : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-container-low)]',
                    )}
                    onClick={() => setNavOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(`nav.${item.labelKey}`)}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      ) : null}

      <div className="md:grid md:grid-cols-[5.5rem_minmax(0,1fr)] md:gap-4 xl:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="paper-panel fixed inset-y-6 left-6 z-30 hidden w-[5.5rem] flex-col rounded-[2rem] p-4 md:flex xl:w-[272px] xl:p-5">
          <div className="flex justify-center xl:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-[var(--color-surface-container-low)]">
              <span className="font-display text-2xl font-semibold tracking-[-0.08em]">{shell('brandTitle').charAt(0)}</span>
            </div>
          </div>
          <div className="hidden xl:block">
            <BrandBlock />
          </div>
          <nav className="mt-8 space-y-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === `/${locale}${item.href}` || (item.href === '/' && pathname === `/${locale}`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  aria-label={t(`nav.${item.labelKey}`)}
                  className={cn(
                    'flex min-h-14 items-center justify-center rounded-[1.5rem] px-0 text-sm font-semibold transition xl:justify-start xl:gap-3 xl:px-4',
                    active
                      ? 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]'
                      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-container-low)]',
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden xl:inline">{t(`nav.${item.labelKey}`)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="hidden md:block" />

        <main id="main-content" className="min-w-0 scroll-mt-24 focus:outline-none" tabIndex={-1}>
          <header className="glass-panel mb-4 flex min-h-20 items-center justify-between rounded-[2rem] px-4 py-3 md:px-5">
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] md:text-3xl">{t('common.appName')}</p>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-[var(--color-surface-container-lowest)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] md:inline-flex">
                {isOnline ? t('common.onlineStatus') : t('common.offlineStatus')}
              </span>
              <button
                ref={menuButtonRef}
                type="button"
                aria-label={shell('openNavigation')}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] md:hidden"
                onClick={() => setNavOpen((current) => !current)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

function BrandBlock({compact = false}: {compact?: boolean}) {
  const t = useTranslations('shell');

  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-0')}>
      <h1 className="font-display text-4xl font-semibold tracking-[-0.08em]">{t('brandTitle')}</h1>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
