'use client';

import {Download} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useMemo, useState} from 'react';

import {
  Button,
  DataCard,
  EmptyState,
  FieldGroup,
  Input,
  MetricCard,
    PageTransition,
    SegmentedControl,
    StatusBadge,
    SurfaceNotice,
    Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
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

export function ReportsPage({
  initialTransactions,
  loadError = false,
}: {
  initialTransactions: Transaction[];
  loadError?: boolean;
}) {
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

  function paymentTone(method: 'cash' | 'transfer' | 'qris') {
    return method === 'cash' ? 'cash' : method === 'transfer' ? 'transfer' : 'qris';
  }

  function paymentLabel(method: 'cash' | 'transfer' | 'qris') {
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
      <DataCard>
        <div className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('periodFilter')}
              </p>
              <SegmentedControl
                value={period}
                onChange={(value) => setPeriod(value as Period)}
                ariaLabel={t('periodFilter')}
                options={[
                  {label: t('daily'), value: 'daily'},
                  {label: t('weekly'), value: 'weekly'},
                  {label: t('monthly'), value: 'monthly'},
                  {label: t('custom'), value: 'custom'},
                ]}
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <Button
                onClick={exportCsv}
                variant="secondary"
                loading={exporting === 'csv'}
                disabled={exporting !== null || filteredTransactions.length === 0}
              >
                <Download className="size-4" />
                {exporting === 'csv' ? t('exporting') : t('csv')}
              </Button>
              <Button
                onClick={exportXlsx}
                loading={exporting === 'xlsx'}
                disabled={exporting !== null || filteredTransactions.length === 0}
              >
                <Download className="size-4" />
                {exporting === 'xlsx' ? t('exporting') : t('xlsx')}
              </Button>
            </div>
          </div>

          {period === 'custom' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <FieldGroup label={t('from')} htmlFor="reports-start-date">
                <Input id="reports-start-date" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
              </FieldGroup>
              <FieldGroup label={t('until')} htmlFor="reports-end-date">
                <Input id="reports-end-date" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
              </FieldGroup>
            </div>
          ) : null}
        </div>
      </DataCard>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('summary')} value={formatCurrency(summary.revenue, locale)} tone="info" detail={t(period)} />
        <MetricCard label={t('ordersLabel')} value={String(summary.orders)} />
        <MetricCard label={t('avgTicketLabel')} value={formatCurrency(summary.average, locale)} />
      </div>

      <DataCard title={t(period)} description={t('summary')}>
        {filteredTransactions.length === 0 ? (
          <EmptyState title={t('title')} description={t('empty')} className="min-h-56" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{common('payment')}</TableHead>
                  <TableHead>{common('total')}</TableHead>
                  <TableHead>{common('date')}</TableHead>
                  <TableHead>{common('notes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="max-w-[18rem] break-all font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={paymentTone(transaction.paymentMethod)}>
                        {paymentLabel(transaction.paymentMethod)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(transaction.totalAmount, locale)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DataCard>
    </PageTransition>
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
