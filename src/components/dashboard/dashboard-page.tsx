'use client';

import {useLocale, useTranslations} from 'next-intl';

import {EmptyState, MetricCard, Panel, SectionHeader, StatusPill} from '@/components/shared/ui';
import {formatCompactNumber, formatCurrency} from '@/lib/format';

type DashboardMetrics = {
  revenueToday: number;
  ordersToday: number;
  averageTicket: number;
  lowStockCount: number;
  topProducts: Array<{
    name: string;
    sold: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    category: string;
    stockQty: number;
  }>;
};

export function DashboardPage({initialMetrics}: {initialMetrics: DashboardMetrics}) {
  const t = useTranslations('dashboard');
  const locale = useLocale() as 'id' | 'en';

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t('revenue')} value={formatCurrency(initialMetrics.revenueToday, locale)} />
        <MetricCard label={t('orders')} value={formatCompactNumber(initialMetrics.ordersToday, locale)} />
        <MetricCard label={t('averageTicket')} value={formatCurrency(initialMetrics.averageTicket, locale)} />
        <MetricCard label={t('criticalStock')} value={String(initialMetrics.lowStockCount)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="space-y-6">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] md:text-4xl">{t('topProducts')}</h2>
          {initialMetrics.topProducts.length === 0 ? (
            <EmptyState title={t('topProducts')} description={t('noSales')} className="min-h-40" />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {initialMetrics.topProducts.map((product, index) => (
                <div key={product.name} className="rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">#{index + 1}</p>
                  <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.05em] md:text-3xl">{product.name}</p>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">{product.sold} {t('soldSuffix')}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="space-y-6 bg-[var(--color-surface-container-low)]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] md:text-4xl">{t('lowStock')}</h2>
          {initialMetrics.lowStockProducts.length === 0 ? (
            <EmptyState title={t('lowStock')} description={t('noCriticalStock')} className="min-h-40 bg-[var(--color-surface-container-lowest)]" />
          ) : (
            <div className="space-y-3">
              {initialMetrics.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] bg-[var(--color-surface-container-lowest)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">{product.category}</p>
                    </div>
                    <StatusPill tone="warning">{product.stockQty} {t('leftSuffix')}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
