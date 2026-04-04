'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState} from 'react';

import {EmptyState, Input, Panel, SectionHeader, SegmentedControl, StatusPill} from '@/components/shared/ui';
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

export function HistoryPage({initialTransactions}: {initialTransactions: Transaction[]}) {
  const t = useTranslations('history');
  const common = useTranslations('common');
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

  function paymentLabel(method: Exclude<FilterValue, 'all'>) {
    return method === 'cash' ? common('paymentCash') : method === 'transfer' ? common('paymentTransfer') : common('paymentQris');
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Panel className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <label htmlFor={searchId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {common('search')}
              </label>
              <Input
                id={searchId}
                aria-label={t('searchPlaceholder')}
                value={query}
                placeholder={t('searchPlaceholder')}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <SegmentedControl
              ariaLabel={t('paymentFilter')}
              options={[
                {label: t('allPayments'), value: 'all'},
                {label: common('paymentCash'), value: 'cash'},
                {label: common('paymentTransfer'), value: 'transfer'},
                {label: common('paymentQris'), value: 'qris'},
              ]}
              value={filter}
              onChange={(value) => setFilter(value as FilterValue)}
            />
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <EmptyState title={t('title')} description={t('empty')} />
            ) : (
              filtered.map((transaction) => (
                <button
                  key={transaction.id}
                  type="button"
                  aria-pressed={activeSelectedId === transaction.id}
                  onClick={() => setSelectedId(transaction.id)}
                  className={cn(
                    'flex w-full cursor-pointer flex-col gap-3 rounded-[1.75rem] p-4 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]',
                    activeSelectedId === transaction.id
                      ? 'bg-[var(--color-surface-container-high)] shadow-[var(--shadow-soft)]'
                      : 'bg-[var(--color-surface-container-low)]',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-all font-semibold leading-tight">{transaction.id}</p>
                    <StatusPill tone="neutral">{paymentLabel(transaction.paymentMethod)}</StatusPill>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm text-[var(--color-muted)]">{formatDateLabel(transaction.createdAt, locale)}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{transaction.notes}</p>
                    </div>
                    <p className="font-display text-2xl font-semibold tracking-[-0.05em] md:text-3xl">
                      {formatCurrency(transaction.totalAmount, locale)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel className="min-w-0 space-y-5 overflow-hidden lg:sticky lg:top-6 lg:h-fit">
          {selected ? (
            <>
              <div className="min-w-0 space-y-2">
                <h2 className="break-all font-display text-3xl font-semibold leading-none tracking-[-0.05em] md:text-4xl">
                  {selected.id}
                </h2>
                <p className="text-sm text-[var(--color-muted)]">{formatDateLabel(selected.createdAt, locale)}</p>
              </div>
              <div className="space-y-3">
                {selected.items.map((item) => (
                  <div key={`${selected.id}-${item.productId}`} className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          {item.quantity} x {formatCurrency(item.unitPrice, locale)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.subtotal, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--color-muted)]">{common('total')}</span>
                  <span className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">
                    {formatCurrency(selected.totalAmount, locale)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title={t('details')} description={t('selectReceipt')} />
          )}
        </Panel>
      </div>
    </div>
  );
}
