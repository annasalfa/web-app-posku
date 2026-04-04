'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState, useTransition} from 'react';

import {saveProductAction} from '@/app/actions/products';
import {Button, Input, LabelBlock, Modal, Panel, SectionHeader, StatusPill} from '@/components/shared/ui';
import {formatCurrency} from '@/lib/format';

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

type CategoryItem = {
  id: string;
  name: string;
};

type ProductDraft = {
  id?: string;
  name: string;
  price: number;
  stockQty: number;
  isActive: boolean;
  categoryId: string | null;
};

type ProductsPageProps = {
  initialProducts: ProductItem[];
  initialCategories: CategoryItem[];
};

export function ProductsPage({initialProducts, initialCategories}: ProductsPageProps) {
  const t = useTranslations('products');
  const common = useTranslations('common');
  const locale = useLocale() as 'id' | 'en';
  const [items, setItems] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(createEmptyDraft(initialCategories));
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();
  const nameId = useId();
  const categoryId = useId();
  const priceId = useId();
  const stockId = useId();

  const filtered = useMemo(
    () => items.filter((item) => `${item.name} ${item.categoryName}`.toLowerCase().includes(deferredQuery.toLowerCase())),
    [deferredQuery, items],
  );

  function openCreate() {
    setDraft(createEmptyDraft(categories));
    setMessage('');
    setOpen(true);
  }

  function openEdit(product: ProductItem) {
    setDraft({
      id: product.id,
      name: product.name,
      price: product.price,
      stockQty: product.stockQty,
      isActive: product.isActive,
      categoryId: product.categoryId,
    });
    setMessage('');
    setOpen(true);
  }

  function saveDraft() {
    setMessage('');

    startTransition(async () => {
      try {
        const saved = await saveProductAction({
          id: draft.id,
          name: draft.name,
          price: draft.price,
          stockQty: draft.stockQty,
          categoryId: draft.categoryId,
          isActive: draft.isActive,
        });

        setItems((current) => {
          const exists = current.some((item) => item.id === saved.id);
          return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
        });
        setOpen(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to save product.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t('title')} action={<Button onClick={openCreate}>{t('new')}</Button>} />

      <Panel className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={searchId} className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {common('search')}
          </label>
          <Input id={searchId} aria-label={common('search')} placeholder={common('search')} value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => openEdit(product)}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.75rem] bg-[var(--color-surface-container-low)] p-4 text-left transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{product.name}</p>
                  <StatusPill tone={product.isActive ? 'success' : 'neutral'}>
                    {product.isActive ? common('active') : common('inactive')}
                  </StatusPill>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">{product.categoryName}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(product.price, locale)}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{product.stockQty} {t('stockCount')}</p>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={draft.name || t('new')}
        closeLabel={common('closeDialog')}
        closeOnBackdropClick={false}
      >
        <div className="grid gap-4">
          <LabelBlock
            label={t('name')}
            htmlFor={nameId}
            value={<Input id={nameId} value={draft.name} onChange={(event) => setDraft({...draft, name: event.target.value})} />}
          />
          <LabelBlock
            label={t('category')}
            htmlFor={categoryId}
            value={
              <select
                id={categoryId}
                className="min-h-14 w-full rounded-[1.25rem] bg-[var(--color-surface-container-highest)] px-4 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(0_109_67/18%)]"
                value={draft.categoryId ?? ''}
                onChange={(event) => setDraft({...draft, categoryId: event.target.value || null})}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <LabelBlock
              label={t('price')}
              htmlFor={priceId}
              value={
                <Input
                  id={priceId}
                  inputMode="numeric"
                  value={String(draft.price)}
                  onChange={(event) => setDraft({...draft, price: Number(event.target.value || 0)})}
                />
              }
            />
            <LabelBlock
              label={t('stock')}
              htmlFor={stockId}
              value={
                <Input
                  id={stockId}
                  inputMode="numeric"
                  value={String(draft.stockQty)}
                  onChange={(event) => setDraft({...draft, stockQty: Number(event.target.value || 0)})}
                />
              }
            />
          </div>
          {message ? <p role="alert" aria-live="polite" className="text-sm text-[var(--color-error)]">{message}</p> : null}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {common('cancel')}
            </Button>
            <Button onClick={saveDraft} disabled={isPending}>
              {common('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function createEmptyDraft(categories: CategoryItem[]): ProductDraft {
  return {
    name: '',
    price: 0,
    stockQty: 0,
    isActive: true,
    categoryId: categories[0]?.id ?? null,
  };
}
