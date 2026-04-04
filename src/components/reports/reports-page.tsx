'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useMemo, useState} from 'react';

import {Button, EmptyState, Input, MetricCard, Panel, SectionHeader, SegmentedControl} from '@/components/shared/ui';
import {formatCurrency} from '@/lib/format';

type Period = 'daily' | 'weekly' | 'monthly' | 'custom';

type Transaction = {
  id: string;
  createdAt: string;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  notes: string;
};

export function ReportsPage({initialTransactions}: {initialTransactions: Transaction[]}) {
  const t = useTranslations('reports');
  const common = useTranslations('common');
  const locale = useLocale() as 'id' | 'en';
  const [period, setPeriod] = useState<Period>('daily');
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = getStartOfDay(now);
    const weeklyStart = new Date(today);

    weeklyStart.setDate(today.getDate() - 6);

    return initialTransactions.filter((transaction) => {
      const createdAt = new Date(transaction.createdAt);

      if (period === 'daily') {
        return isSameDay(createdAt, now);
      }

      if (period === 'weekly') {
        return createdAt >= weeklyStart && createdAt <= now;
      }

      if (period === 'monthly') {
        return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
      }

      const start = customStart ? getStartOfDay(new Date(customStart)) : null;
      const end = customEnd ? getEndOfDay(new Date(customEnd)) : null;

      if (start && createdAt < start) {
        return false;
      }

      if (end && createdAt > end) {
        return false;
      }

      return true;
    });
  }, [customEnd, customStart, initialTransactions, period]);

  const summary = useMemo(() => {
    const revenue = filteredTransactions.reduce((sum, item) => sum + item.totalAmount, 0);
    const average = filteredTransactions.length === 0 ? 0 : revenue / filteredTransactions.length;

    return {
      revenue,
      orders: filteredTransactions.length,
      average,
    };
  }, [filteredTransactions]);

  async function exportCsv() {
    setExporting('csv');

    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredTransactions.map((transaction) => ({
          id: transaction.id,
          paymentMethod: transaction.paymentMethod,
          totalAmount: transaction.totalAmount,
          createdAt: transaction.createdAt,
          notes: transaction.notes,
        })),
      );
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `posku-${period}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  }

  async function exportXlsx() {
    setExporting('xlsx');

    try {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredTransactions.map((transaction) => ({
          id: transaction.id,
          paymentMethod: transaction.paymentMethod,
          totalAmount: transaction.totalAmount,
          amountPaid: transaction.amountPaid,
          changeAmount: transaction.changeAmount,
          createdAt: transaction.createdAt,
          notes: transaction.notes,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('sheetName'));
      XLSX.writeFile(workbook, `posku-${period}.xlsx`);
    } finally {
      setExporting(null);
    }
  }

  function paymentLabel(method: 'cash' | 'transfer' | 'qris') {
    return method === 'cash' ? common('paymentCash') : method === 'transfer' ? common('paymentTransfer') : common('paymentQris');
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} />

      <Panel className="space-y-4 bg-[var(--color-surface-container-low)]">
        <SegmentedControl
          ariaLabel={t('periodFilter')}
          options={[
            {label: t('daily'), value: 'daily'},
            {label: t('weekly'), value: 'weekly'},
            {label: t('monthly'), value: 'monthly'},
            {label: t('custom'), value: 'custom'},
          ]}
          value={period}
          onChange={(value) => setPeriod(value as Period)}
        />
        {period === 'custom' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]" htmlFor="reports-start-date">
                {t('from')}
              </label>
              <Input id="reports-start-date" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]" htmlFor="reports-end-date">
                {t('until')}
              </label>
              <Input id="reports-end-date" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportCsv} variant="secondary" disabled={exporting !== null || filteredTransactions.length === 0}>
            {exporting === 'csv' ? t('exporting') : t('csv')}
          </Button>
          <Button onClick={exportXlsx} disabled={exporting !== null || filteredTransactions.length === 0}>
            {exporting === 'xlsx' ? t('exporting') : t('xlsx')}
          </Button>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('summary')} value={formatCurrency(summary.revenue, locale)} detail={t(period)} />
        <MetricCard label={t('ordersLabel')} value={String(summary.orders)} />
        <MetricCard label={t('avgTicketLabel')} value={formatCurrency(summary.average, locale)} />
      </div>

      <Panel className="space-y-4">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{t(period)}</h2>
        {filteredTransactions.length === 0 ? (
          <EmptyState title={t('title')} description={t('empty')} className="min-h-40" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{paymentLabel(transaction.paymentMethod)}</p>
                <p className="mt-4 font-semibold">{transaction.id}</p>
                <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.05em] md:text-3xl">
                  {formatCurrency(transaction.totalAmount, locale)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function getStartOfDay(value: Date) {
  const next = new Date(value);

  next.setHours(0, 0, 0, 0);

  return next;
}

function getEndOfDay(value: Date) {
  const next = new Date(value);

  next.setHours(23, 59, 59, 999);

  return next;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
