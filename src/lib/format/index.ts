const currencyId = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const currencyEn = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, locale: 'id' | 'en') {
  return locale === 'id' ? currencyId.format(value) : currencyEn.format(value);
}

export function formatCompactNumber(value: number, locale: 'id' | 'en') {
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateLabel(value: string, locale: 'id' | 'en') {
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
