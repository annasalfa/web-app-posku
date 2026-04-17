'use client';

import {useLocale, useTranslations} from 'next-intl';

import {
  DataCard,
  EmptyState,
  MetricCard,
  PageTransition,
  SurfaceNotice,
} from '@/components/ui';
import {formatCompactNumber, formatCurrency} from '@/lib/format';

type DashboardMetrics = {
  revenueToday: number;
  ordersToday: number;
  averageTicket: number;
  topProducts: Array<{
    name: string;
    sold: number;
  }>;
};

export function DashboardPage({
  initialMetrics,
  loadError = false,
}: {
  initialMetrics: DashboardMetrics;
  loadError?: boolean;
}) {
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const locale = useLocale() as 'id' | 'en';

  return (
    <PageTransition className="space-y-6">
      {loadError ? (
        <SurfaceNotice
          title={common('dataUnavailableTitle')}
          description={common('dataUnavailableDescription')}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('revenue')} value={formatCurrency(initialMetrics.revenueToday, locale)} tone="info" />
        <MetricCard label={t('orders')} value={formatCompactNumber(initialMetrics.ordersToday, locale)} />
        <MetricCard label={t('averageTicket')} value={formatCurrency(initialMetrics.averageTicket, locale)} />
      </div>

      <DataCard title={t('topProducts')}>
        {initialMetrics.topProducts.length === 0 ? (
          <EmptyState title={t('topProducts')} description={t('noSales')} className="min-h-52" />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {initialMetrics.topProducts.map((product, index) => (
              <div
                key={product.name}
                className="rounded-[var(--radius-large)] border border-border bg-muted/40 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  #{index + 1}
                </p>
                <p className="mt-4 line-clamp-2 text-xl font-bold tracking-[-0.03em]">
                  {product.name}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {product.sold} {t('soldSuffix')}
                </p>
              </div>
            ))}
          </div>
        )}
      </DataCard>
    </PageTransition>
  );
}
