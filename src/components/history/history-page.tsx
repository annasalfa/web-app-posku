'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState} from 'react';

import {
  DataCard,
  EmptyState,
    PageTransition,
    SearchField,
    SegmentedControl,
    Separator,
    StatusBadge,
    SurfaceNotice,
  } from '@/components/ui';
import {formatCurrency, formatDateLabel} from '@/lib/format';
import {cn} from '@/lib/utils/cn';

type FilterValue = 'all' | 'cash' | 'transfer' | 'qris';

type TransactionItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type Transaction = {
  id: string;
  createdAt: string;
  paymentMethod: Exclude<FilterValue, 'all'>;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  notes: string;
  items: TransactionItem[];
};

export function HistoryPage({
  initialTransactions,
  loadError = false,
}: {
  initialTransactions: Transaction[];
  loadError?: boolean;
}) {
  const t = useTranslations('history');
  const common = useTranslations('common');
  const cashier = useTranslations('cashier');
  const locale = useLocale() as 'id' | 'en';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedId, setSelectedId] = useState(initialTransactions[0]?.id ?? '');
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();

  const filtered = useMemo(() => {
    return initialTransactions.filter((transaction) => {
      const byPayment = filter === 'all' || transaction.paymentMethod === filter;
      const byQuery = `${transaction.id} ${transaction.notes}`.toLowerCase().includes(deferredQuery.toLowerCase());
      return byPayment && byQuery;
    });
  }, [deferredQuery, filter, initialTransactions]);

  const activeSelectedId = filtered.some((transaction) => transaction.id === selectedId) ? selectedId : (filtered[0]?.id ?? '');
  const selected = filtered.find((transaction) => transaction.id === activeSelectedId) ?? filtered[0];

  function paymentTone(method: Exclude<FilterValue, 'all'>) {
    return method === 'cash' ? 'cash' : method === 'transfer' ? 'transfer' : 'qris';
  }

  function paymentLabel(method: Exclude<FilterValue, 'all'>) {
    return method === 'cash' ? common('paymentCash') : method === 'transfer' ? common('paymentTransfer') : common('paymentQris');
  }

  return (
    <PageTransition className="space-y-6">
      {loadError ? (
        <SurfaceNotice
          title={common('dataUnavailableTitle')}
          description={common('dataUnavailableDescription')}
        />
      ) : null}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] xl:gap-4">
        <DataCard title={t('title')} description={t('searchPlaceholder')}>
          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:items-end">
              <SearchField
                id={searchId}
                label={t('searchPlaceholder')}
                value={query}
                placeholder={t('searchPlaceholder')}
                onChange={setQuery}
                inputClassName="h-12 text-[15px]"
              />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t('paymentFilter')}
                </p>
                <SegmentedControl
                  value={filter}
                  onChange={(value) => setFilter(value as FilterValue)}
                  ariaLabel={t('paymentFilter')}
                  size="sm"
                  itemClassName="md:min-w-[6.25rem]"
                  options={[
                    {label: t('allPayments'), value: 'all'},
                    {label: common('paymentCash'), value: 'cash'},
                    {label: common('paymentTransfer'), value: 'transfer'},
                    {label: common('paymentQris'), value: 'qris'},
                  ]}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState title={t('title')} description={t('empty')} className="min-h-56" />
            ) : (
              <div className="space-y-3">
                {filtered.map((transaction) => (
                  <button
                    key={transaction.id}
                    type="button"
                    aria-pressed={activeSelectedId === transaction.id}
                    onClick={() => setSelectedId(transaction.id)}
                    className={cn(
                      'w-full rounded-[var(--radius-large)] border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 md:p-4',
                      activeSelectedId === transaction.id
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-border bg-muted/35 hover:bg-muted/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <p className="break-all text-[15px] font-semibold leading-6 md:text-base">
                          {transaction.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateLabel(transaction.createdAt, locale)}
                        </p>
                      </div>
                      <StatusBadge tone={paymentTone(transaction.paymentMethod)}>
                        {paymentLabel(transaction.paymentMethod)}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {transaction.notes || '-'}
                      </p>
                      <p className="font-mono text-xl font-bold tracking-[-0.03em] md:text-[1.625rem] xl:text-2xl">
                        {formatCurrency(transaction.totalAmount, locale)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DataCard>

        <DataCard
          title={t('details')}
          description={selected ? formatDateLabel(selected.createdAt, locale) : t('selectReceipt')}
          className="min-w-0 lg:sticky lg:top-24 lg:h-fit"
        >
          {selected ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <h2 className="break-all text-xl font-bold tracking-[-0.03em] md:text-[1.65rem] xl:text-2xl">
                  {selected.id}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={paymentTone(selected.paymentMethod)}>
                    {paymentLabel(selected.paymentMethod)}
                  </StatusBadge>
                  <span className="text-sm text-muted-foreground">{selected.notes || '-'}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {selected.items.map((item) => (
                  <div
                    key={`${selected.id}-${item.productId}`}
                    className="rounded-[var(--radius-large)] border border-border bg-muted/35 p-3.5 md:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold break-words">{item.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice, locale)}
                        </p>
                      </div>
                      <p className="font-mono text-base font-semibold sm:text-lg">
                        {formatCurrency(item.subtotal, locale)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid gap-3">
                <DetailRow label={common('total')} value={formatCurrency(selected.totalAmount, locale)} strong />
                <DetailRow label={common('paid')} value={formatCurrency(selected.amountPaid, locale)} />
                <DetailRow label={cashier('change')} value={formatCurrency(selected.changeAmount, locale)} />
              </div>
            </div>
          ) : (
            <EmptyState title={t('details')} description={t('selectReceipt')} className="min-h-56" />
          )}
        </DataCard>
      </div>
    </PageTransition>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-standard)] border border-border bg-muted/20 px-3.5 py-2.5 md:px-4 md:py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('font-mono text-[15px] font-semibold md:text-base', strong && 'text-lg font-bold tracking-[-0.03em] md:text-xl')}>
        {value}
      </span>
    </div>
  );
}
