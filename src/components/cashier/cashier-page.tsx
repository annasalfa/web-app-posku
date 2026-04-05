'use client';

import {AnimatePresence, LayoutGroup, motion, useReducedMotion} from 'motion/react';
import {Minus, Plus, Trash2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState, useTransition} from 'react';

import {checkoutAction} from '@/app/actions/checkout';
import {
  Button,
  DataCard,
  EmptyState,
  FieldGroup,
  Input,
  PageHeader,
  PageTransition,
  ScrollArea,
  SearchField,
  SegmentedControl,
  StatusBadge,
} from '@/components/ui';
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
  const reduceMotion = useReducedMotion();
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
      const matchesQuery = `${product.name} ${product.sku}`.toLowerCase().includes(deferredQuery.toLowerCase());
      return matchesCategory && matchesQuery && product.isActive;
    });
  }, [category, deferredQuery, menuItems]);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const amountReceived = Number(received || 0);
  const change = Math.max(amountReceived - total, 0);
  const canSubmit = isOnline && cart.length > 0 && (paymentMethod !== 'cash' || amountReceived >= total);

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
    if (!canSubmit) {
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

  function paymentTone(method: PaymentMethod) {
    return method === 'cash' ? 'cash' : method === 'transfer' ? 'transfer' : 'qris';
  }

  return (
    <PageTransition className="space-y-6">
      <PageHeader
        eyebrow="Checkout"
        title={t('title')}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <DataCard className="surface-grid">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,auto)]">
              <SearchField
                id={searchId}
                label={common('search')}
                value={query}
                placeholder={common('search')}
                onChange={setQuery}
              />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {t('categoryFilter')}
                </p>
                <SegmentedControl
                  value={category}
                  onChange={setCategory}
                  ariaLabel={t('categoryFilter')}
                  options={[{label: t('all'), value: 'all'}, ...initialCategories.map((item) => ({label: item, value: item}))]}
                />
              </div>
            </div>
          </DataCard>

          {filteredProducts.length === 0 ? (
            <EmptyState title={t('noResultsTitle')} description={t('noResults')} className="min-h-72" />
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
                      'group flex min-h-52 flex-col justify-between rounded-[var(--radius-large)] border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2',
                      isOutOfStock
                        ? 'cursor-not-allowed border-border bg-muted/35 opacity-70'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5',
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge tone="neutral">{product.categoryName}</StatusBadge>
                        {isOutOfStock ? <StatusBadge tone="danger">{common('outOfStock')}</StatusBadge> : null}
                        {!isOutOfStock && isLow ? <StatusBadge tone="warning">{product.stockQty} {t('stockUnit')}</StatusBadge> : null}
                      </div>
                      <div className="space-y-2">
                        <p className="line-clamp-2 text-xl font-bold tracking-[-0.03em]">{product.name}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          SKU {product.sku}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <p className="font-mono text-2xl font-bold tracking-[-0.03em]">
                        {formatCurrency(product.price, locale)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.stockQty} {t('stockUnit')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DataCard
          title={t('cart')}
          className="xl:sticky xl:top-24 xl:h-fit"
        >
          <div className="space-y-5">
            <div className="rounded-[var(--radius-large)] border border-border bg-muted/35 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {t('total')}
              </p>
              <p className="mt-2 font-mono text-[2rem] font-bold tracking-[-0.05em]">
                {formatCurrency(total, locale)}
              </p>
            </div>

            <LayoutGroup>
              <ScrollArea className="max-h-[24rem] pr-2">
                {cart.length === 0 ? (
                  <EmptyState title={t('emptyTitle')} description={t('empty')} className="min-h-56" />
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {cart.map((item) => (
                        <motion.div
                          key={item.productId}
                          layout={!reduceMotion}
                          initial={reduceMotion ? {opacity: 0} : {opacity: 0, y: 6}}
                          animate={{opacity: 1, y: 0}}
                          exit={{opacity: 0, y: reduceMotion ? 0 : -6}}
                          className="rounded-[var(--radius-large)] border border-border bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-semibold">{item.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {formatCurrency(item.unitPrice, locale)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`${common('remove')} ${item.name}`}
                              onClick={() => updateQuantity(item.productId, -item.quantity)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                aria-label={`${common('decreaseQuantity')} ${item.name}`}
                                onClick={() => updateQuantity(item.productId, -1)}
                              >
                                <Minus className="size-4" />
                              </Button>
                              <span className="min-w-8 text-center font-mono text-lg font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                aria-label={`${common('increaseQuantity')} ${item.name}`}
                                onClick={() => updateQuantity(item.productId, 1)}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                            <p className="font-mono text-lg font-semibold">
                              {formatCurrency(item.quantity * item.unitPrice, locale)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </LayoutGroup>

            <div className="space-y-4 rounded-[var(--radius-large)] border border-border bg-muted/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{t('payment')}</p>
                <StatusBadge tone={paymentTone(paymentMethod)}>
                  {paymentMethod === 'cash' ? t('cash') : paymentMethod === 'transfer' ? t('transfer') : t('qris')}
                </StatusBadge>
              </div>

              <SegmentedControl
                value={paymentMethod}
                onChange={(value) => setPaymentMethod(value as PaymentMethod)}
                ariaLabel={t('payment')}
                options={[
                  {label: t('cash'), value: 'cash'},
                  {label: t('transfer'), value: 'transfer'},
                  {label: t('qris'), value: 'qris'},
                ]}
              />

              {paymentMethod === 'cash' ? (
                <FieldGroup label={t('received')} htmlFor={receivedId}>
                  <Input
                    id={receivedId}
                    inputMode="numeric"
                    value={received}
                    onChange={(event) => setReceived(event.target.value)}
                  />
                  <div className="flex items-center justify-between rounded-[var(--radius-standard)] border border-border bg-card px-4 py-3">
                    <span className="text-sm text-muted-foreground">{t('change')}</span>
                    <span className="font-mono text-lg font-semibold">
                      {formatCurrency(change, locale)}
                    </span>
                  </div>
                </FieldGroup>
              ) : (
                <div className="rounded-[var(--radius-standard)] border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  {paymentMethod === 'transfer' ? t('transfer') : t('qris')}
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {message ? (
                <motion.p
                  key="message"
                  initial={{opacity: 0, y: reduceMotion ? 0 : 4}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0}}
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-destructive"
                >
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>

            {submitted ? <StatusBadge tone="success">{t('submitted')}</StatusBadge> : null}

            {!isOnline ? (
              <p className="text-sm text-destructive">{t('disabled')}</p>
            ) : null}

            <Button className="w-full" onClick={handleSubmit} loading={isPending} disabled={!canSubmit}>
              {t('send')}
            </Button>
          </div>
        </DataCard>
      </div>
    </PageTransition>
  );
}
