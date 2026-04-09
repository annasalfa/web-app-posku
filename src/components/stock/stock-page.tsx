'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useId, useMemo, useState, useTransition} from 'react';

import {adjustStockAction} from '@/app/actions/stock';
import {
  Button,
  DataCard,
    FieldGroup,
    Input,
    PageTransition,
    StatusBadge,
    SurfaceNotice,
  } from '@/components/ui';
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

export function StockPage({
  initialProducts,
  initialLogs,
  loadError = false,
}: StockPageProps & {loadError?: boolean}) {
  const t = useTranslations('stock');
  const common = useTranslations('common');
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
    <PageTransition className="space-y-6">
      {loadError ? (
        <SurfaceNotice
          title={common('dataUnavailableTitle')}
          description={common('dataUnavailableDescription')}
        />
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <DataCard title={t('products')} description={t('lowStock')}>
          <div className="space-y-3">
            {items.map((product) => (
              <button
                key={product.id}
                type="button"
                aria-pressed={selected?.id === product.id}
                onClick={() => setSelectedId(product.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-[var(--radius-large)] border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2',
                  selected?.id === product.id
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/45',
                )}
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{product.categoryName}</p>
                </div>
                <StatusBadge tone={product.stockQty <= 5 ? 'warning' : 'neutral'}>
                  {product.stockQty}
                </StatusBadge>
              </button>
            ))}
          </div>
        </DataCard>

        <div className="space-y-4">
          <DataCard description={selected?.categoryName}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">
                {selected?.name ?? t('title')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldGroup label={t('delta')} htmlFor={deltaId}>
                  <Input id={deltaId} inputMode="numeric" value={delta} onChange={(event) => setDelta(event.target.value)} />
                </FieldGroup>
                <FieldGroup label={t('reason')} htmlFor={reasonId}>
                  <Input id={reasonId} value={reason} onChange={(event) => setReason(event.target.value)} />
                </FieldGroup>
              </div>
              {message ? <p role="alert" aria-live="polite" className="text-sm text-destructive">{message}</p> : null}
              <Button onClick={applyAdjustment} loading={isPending}>{t('adjust')}</Button>
            </div>
          </DataCard>

          <DataCard title={t('auditTrail')}>
            <div className="space-y-3">
              {logs.map((entry) => (
                <div key={entry.id} className="rounded-[var(--radius-large)] border border-border bg-muted/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{entry.productName}</p>
                    <StatusBadge tone={entry.changeQty >= 0 ? 'success' : 'warning'}>
                      {entry.changeQty >= 0 ? `+${entry.changeQty}` : entry.changeQty}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {entry.stockBefore} to {entry.stockAfter} / {entry.reason}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {formatDateLabel(entry.createdAt, locale)}
                  </p>
                </div>
              ))}
            </div>
          </DataCard>
        </div>
      </div>
    </PageTransition>
  );
}
