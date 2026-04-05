'use client';

import {ArrowRight} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useActionState, useId} from 'react';

import {loginAction} from '@/app/actions/auth';
import {Button, Card, CardContent, Input, Label, PageTransition} from '@/components/ui';

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
    <PageTransition className="grid min-h-screen gap-5 px-4 py-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:px-5 lg:py-5">
      <section className="surface-grid relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-8 shadow-sm md:px-8 md:py-10 lg:min-h-[calc(100vh-2.5rem)] lg:px-10 lg:py-12">
        <div className="shell-highlight absolute inset-0 opacity-80" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('heroEyebrow')}
            </p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.05em] text-foreground md:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              {t('heroDescription')}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <HeroStat label="Checkout" value="< 30s" />
            <HeroStat label="Mode" value="Tablet" />
            <HeroStat label="Shell" value="Stable" />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-xl rounded-[2rem] border-border/80 shadow-[var(--shadow-md)]">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t('accessEyebrow')}
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] md:text-4xl">
                {t('title')}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">{t('subtitle')}</p>
            </div>

            <form className="mt-8 space-y-5" action={formAction}>
              <input type="hidden" name="locale" value={locale} />

              <div className="space-y-2">
                <Label htmlFor={emailId}>{t('email')}</Label>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={passwordId}>{t('password')}</Label>
                <Input
                  id={passwordId}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              {state.message ? (
                <p role="alert" aria-live="polite" className="text-sm text-destructive">
                  {state.message}
                </p>
              ) : null}

              <Button className="w-full justify-between" type="submit" loading={pending}>
                <span>{pending ? t('signingIn') : t('submit')}</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="mt-5 text-sm leading-6 text-muted-foreground">{t('hint')}</p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

function HeroStat({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-[var(--radius-large)] border border-border/80 bg-background/80 p-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold tracking-[-0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}
