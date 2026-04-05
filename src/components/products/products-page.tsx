'use client';

import {PackagePlus} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {useDeferredValue, useId, useMemo, useState, useTransition} from 'react';

import {saveProductAction} from '@/app/actions/products';
import {
  Button,
  DataCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  FieldGroup,
  Input,
  PageHeader,
  PageTransition,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
} from '@/components/ui';
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
    () => items.filter((item) => `${item.name} ${item.categoryName} ${item.sku}`.toLowerCase().includes(deferredQuery.toLowerCase())),
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
    <PageTransition className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={t('title')}
        action={
          <Button onClick={openCreate}>
            <PackagePlus className="size-4" />
            {t('new')}
          </Button>
        }
      />

      <DataCard>
        <div className="space-y-4">
          <SearchField
            id={searchId}
            label={common('search')}
            value={query}
            placeholder={common('search')}
            onChange={setQuery}
          />

          {filtered.length === 0 ? (
            <EmptyState title={t('title')} description={t('empty')} className="min-h-52" />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openEdit(product)}
                  className="rounded-[var(--radius-large)] border border-border bg-card p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 hover:border-primary/25 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{product.name}</p>
                        <StatusBadge tone={product.isActive ? 'success' : 'neutral'}>
                          {product.isActive ? common('active') : common('inactive')}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold">
                        {formatCurrency(product.price, locale)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.stockQty} {t('stockCount')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DataCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          <DialogHeader>
            <DialogTitle>{draft.name || t('new')}</DialogTitle>
            <DialogDescription>{t('category')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-6 pb-6">
            <FieldGroup label={t('name')} htmlFor={nameId}>
              <Input id={nameId} value={draft.name} onChange={(event) => setDraft({...draft, name: event.target.value})} />
            </FieldGroup>

            <FieldGroup label={t('category')} htmlFor={categoryId}>
              <Select value={draft.categoryId ?? ''} onValueChange={(value) => setDraft({...draft, categoryId: value || null})}>
                <SelectTrigger id={categoryId}>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldGroup label={t('price')} htmlFor={priceId}>
                <Input
                  id={priceId}
                  inputMode="numeric"
                  value={String(draft.price)}
                  onChange={(event) => setDraft({...draft, price: Number(event.target.value || 0)})}
                />
              </FieldGroup>
              <FieldGroup label={t('stock')} htmlFor={stockId}>
                <Input
                  id={stockId}
                  inputMode="numeric"
                  value={String(draft.stockQty)}
                  onChange={(event) => setDraft({...draft, stockQty: Number(event.target.value || 0)})}
                />
              </FieldGroup>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {common('status')}
              </p>
              <SegmentedControl
                value={draft.isActive ? 'active' : 'inactive'}
                onChange={(value) => setDraft({...draft, isActive: value === 'active'})}
                ariaLabel={common('status')}
                options={[
                  {label: common('active'), value: 'active'},
                  {label: common('inactive'), value: 'inactive'},
                ]}
              />
            </div>

            {message ? <p role="alert" aria-live="polite" className="text-sm text-destructive">{message}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {common('cancel')}
            </Button>
            <Button onClick={saveDraft} loading={isPending}>
              {common('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
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
