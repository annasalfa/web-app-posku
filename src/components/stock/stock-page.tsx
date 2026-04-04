'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useId, useMemo, useState, useTransition} from 'react';

import {adjustStockAction} from '@/app/actions/stock';
import {Button, Input, Panel, SectionHeader, StatusPill} from '@/components/shared/ui';
import {formatDateLabel} from '@/lib/format';
import {cn} from '@/lib/utils/cn';

type ProductItem = {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string;
  sku: string;
};

type StockLogItem = {
  id: string;
  productId: string;
  productName: string;
  changeQty: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdAt: string;
  transactionId: string | null;
};

type StockPageProps = {
  initialProducts: ProductItem[];
  initialLogs: StockLogItem[];
};

export function StockPage({initialProducts, initialLogs}: StockPageProps) {
  const t = useTranslations('stock');
  const locale = useLocale() as 'id' | 'en';
  const [items, setItems] = useState(initialProducts);
  const [logs, setLogs] = useState(initialLogs);
  const [selectedId, setSelectedId] = useState(initialProducts[0]?.id ?? '');
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('restock');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const deltaId = useId();
  const reasonId = useId();

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);

  function applyAdjustment() {
    if (!selected) {
      return;
    }

    setMessage('');

    startTransition(async () => {
      try {
        const result = await adjustStockAction({
          productId: selected.id,
          delta: Number(delta || 0),
          reason,
        });

        setItems((current) =>
          current.map((item) =>
            item.id === selected.id ? {...item, stockQty: result.product.stockQty} : item,
          ),
        );
        setLogs((current) => [result.stockLog, ...current]);
        setDelta('0');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to adjust stock.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-4 bg-[var(--color-surface-container-low)]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{t('products')}</h2>
          <div className="space-y-3">
            {items.map((product) => (
              <button
                key={product.id}
                type="button"
                aria-pressed={selected?.id === product.id}
                onClick={() => setSelectedId(product.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[1.5rem] p-4 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]',
                  selected?.id === product.id
                    ? 'bg-[var(--color-surface-container-high)] shadow-[var(--shadow-soft)]'
                    : 'bg-[var(--color-surface-container-lowest)]',
                )}
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{product.categoryName}</p>
                </div>
                <StatusPill tone={product.stockQty <= 5 ? 'warning' : 'neutral'}>{product.stockQty}</StatusPill>
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="space-y-4">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{selected?.name}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={deltaId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t('delta')}
                </label>
                <Input id={deltaId} inputMode="numeric" value={delta} onChange={(event) => setDelta(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor={reasonId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t('reason')}
                </label>
                <Input id={reasonId} value={reason} onChange={(event) => setReason(event.target.value)} />
              </div>
            </div>
            {message ? <p role="alert" aria-live="polite" className="text-sm text-[var(--color-error)]">{message}</p> : null}
            <Button onClick={applyAdjustment} disabled={isPending}>{t('adjust')}</Button>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{t('auditTrail')}</h2>
            <div className="space-y-3">
              {logs.map((entry) => (
                <div key={entry.id} className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{entry.productName}</p>
                    <StatusPill tone={entry.changeQty >= 0 ? 'success' : 'warning'}>
                      {entry.changeQty >= 0 ? `+${entry.changeQty}` : entry.changeQty}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {entry.stockBefore} to {entry.stockAfter} / {entry.reason}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                    {formatDateLabel(entry.createdAt, locale)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
