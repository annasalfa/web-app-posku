'use client';

import {Minus, Plus, Trash2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState, useTransition} from 'react';

import {checkoutAction} from '@/app/actions/checkout';
import {Button, EmptyState, GlassPanel, Input, Panel, SectionHeader, SegmentedControl, StatusPill} from '@/components/shared/ui';
import {formatCurrency} from '@/lib/format';
import {cn} from '@/lib/utils/cn';
import {useOnlineStatus} from '@/lib/utils/use-online-status';

type PaymentMethod = 'cash' | 'transfer' | 'qris';

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

type CartItem = {productId: string; name: string; quantity: number; unitPrice: number; stockQty: number};

type CashierPageProps = {
  initialProducts: ProductItem[];
  initialCategories: string[];
};

export function CashierPage({initialProducts, initialCategories}: CashierPageProps) {
  const t = useTranslations('cashier');
  const common = useTranslations('common');
  const locale = useLocale() as 'id' | 'en';
  const isOnline = useOnlineStatus();
  const [menuItems, setMenuItems] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [received, setReceived] = useState('0');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();
  const receivedId = useId();

  const filteredProducts = useMemo(() => {
    return menuItems.filter((product) => {
      const matchesCategory = category === 'all' || product.categoryName === category;
      const matchesQuery = product.name.toLowerCase().includes(deferredQuery.toLowerCase());
      return matchesCategory && matchesQuery && product.isActive;
    });
  }, [category, deferredQuery, menuItems]);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const amountReceived = Number(received || 0);
  const change = Math.max(amountReceived - total, 0);

  function addToCart(productId: string) {
    const product = menuItems.find((entry) => entry.id === productId);
    if (!product || product.stockQty <= 0) return;

    setSubmitted(false);
    setMessage('');
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (!existing) {
        return [...current, {productId, name: product.name, quantity: 1, unitPrice: product.price, stockQty: product.stockQty}];
      }
      if (existing.quantity >= product.stockQty) {
        return current;
      }
      return current.map((item) =>
        item.productId === productId ? {...item, quantity: item.quantity + 1} : item,
      );
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setSubmitted(false);
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.max(0, Math.min(item.quantity + delta, item.stockQty)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function handleSubmit() {
    if (!isOnline || cart.length === 0) {
      return;
    }

    setMessage('');

    startTransition(async () => {
      try {
        await checkoutAction({
          items: cart.map((item) => ({productId: item.productId, quantity: item.quantity})),
          paymentMethod,
          amountPaid: paymentMethod === 'cash' ? amountReceived : undefined,
        });

        setMenuItems((current) =>
          current.map((product) => {
            const line = cart.find((item) => item.productId === product.id);
            return line ? {...product, stockQty: Math.max(product.stockQty - line.quantity, 0)} : product;
          }),
        );
        setSubmitted(true);
        setCart([]);
        setReceived('0');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to complete transaction.');
      }
    });
  }

  function paymentLabel(method: PaymentMethod) {
    return method === 'cash' ? t('cash') : method === 'transfer' ? t('transfer') : t('qris');
  }

  return (
    <div className="safe-page-bottom space-y-6">
      <SectionHeader title={t('title')} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-4">
          <Panel className="space-y-4 bg-[var(--color-surface-container-low)]">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <label htmlFor={searchId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {common('search')}
                </label>
                <Input
                  id={searchId}
                  aria-label={common('search')}
                  placeholder={common('search')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <SegmentedControl
              ariaLabel={t('categoryFilter')}
              options={[{label: t('all'), value: 'all'}, ...initialCategories.map((item) => ({label: item, value: item}))]}
              value={category}
              onChange={setCategory}
            />
          </Panel>

          {filteredProducts.length === 0 ? (
            <EmptyState title={t('noResultsTitle')} description={t('noResults')} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const isLow = product.stockQty <= 5;
                const isOutOfStock = product.stockQty <= 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isOutOfStock}
                    aria-disabled={isOutOfStock}
                    onClick={() => addToCart(product.id)}
                    className={cn(
                      'paper-panel flex min-h-44 flex-col justify-between rounded-[2rem] p-5 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]',
                      isOutOfStock
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:-translate-y-0.5',
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone="neutral">{product.categoryName}</StatusPill>
                        {isOutOfStock ? <StatusPill tone="danger">{common('outOfStock')}</StatusPill> : null}
                        {!isOutOfStock && isLow ? <StatusPill tone="warning">{product.stockQty} {t('stockUnit')}</StatusPill> : null}
                      </div>
                      <div>
                        <p className="font-display text-2xl font-semibold tracking-[-0.05em] md:text-3xl">{product.name}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">SKU {product.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-lg font-semibold">{formatCurrency(product.price, locale)}</p>
                      <p className="text-sm text-[var(--color-muted)]">{product.stockQty} {t('stockUnit')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Panel className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] md:text-4xl">{t('cart')}</h2>

          <div className="space-y-3">
            {cart.length === 0 ? (
              <EmptyState title={t('emptyTitle')} description={t('empty')} className="min-h-48 bg-[var(--color-surface-container-low)]" />
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="rounded-[1.5rem] bg-[var(--color-surface-container-low)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{formatCurrency(item.unitPrice, locale)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`${common('remove')} ${item.name}`}
                      className="cursor-pointer rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]"
                      onClick={() => updateQuantity(item.productId, -item.quantity)}
                    >
                      <Trash2 className="h-5 w-5 text-[var(--color-muted)]" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`${common('decreaseQuantity')} ${item.name}`}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]"
                        onClick={() => updateQuantity(item.productId, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`${common('increaseQuantity')} ${item.name}`}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]"
                        onClick={() => updateQuantity(item.productId, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.quantity * item.unitPrice, locale)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-3 rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('payment')}</p>
            <SegmentedControl
              ariaLabel={t('payment')}
              options={[
                {label: t('cash'), value: 'cash'},
                {label: t('transfer'), value: 'transfer'},
                {label: t('qris'), value: 'qris'},
              ]}
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(value as PaymentMethod)}
            />
            {paymentMethod === 'cash' ? (
              <div className="space-y-2">
                <label htmlFor={receivedId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {t('received')}
                </label>
                <Input id={receivedId} inputMode="numeric" value={received} onChange={(event) => setReceived(event.target.value)} />
                <p className="text-sm text-[var(--color-muted)]">
                  {t('change')}: <span className="font-semibold text-[var(--color-on-surface)]">{formatCurrency(change, locale)}</span>
                </p>
              </div>
            ) : null}
            {paymentMethod !== 'cash' ? (
              <p className="text-sm text-[var(--color-muted)]">{paymentLabel(paymentMethod)}</p>
            ) : null}
          </div>

          {message ? <p role="alert" aria-live="polite" className="text-sm text-[var(--color-error)]">{message}</p> : null}
          {submitted ? <StatusPill tone="success">{t('submitted')}</StatusPill> : null}
        </Panel>
      </div>

      <GlassPanel className="safe-bottom-bar fixed inset-x-4 z-30 md:right-6 md:left-32 xl:left-[calc(272px+2.5rem)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">{t('total')}</p>
            <p className="font-display text-4xl font-semibold tracking-[-0.05em] tabular-nums md:text-6xl">{formatCurrency(total, locale)}</p>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            {!isOnline ? <p className="text-sm text-[var(--color-error)]">{t('disabled')}</p> : null}
            <Button onClick={handleSubmit} disabled={isPending || !isOnline || cart.length === 0 || (paymentMethod === 'cash' && amountReceived < total)}>
              {t('send')}
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
