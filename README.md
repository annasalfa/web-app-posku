# POSKU

Tablet-first web POS untuk bisnis F&B skala kecil dengan fokus pada single outlet dan solo operator.

Repo ini berisi aplikasi `Next.js 15` yang terhubung ke `Appwrite` untuk:
- autentikasi email/password
- checkout kasir
- history transaksi
- laporan dan export CSV/Excel
- manajemen produk
- manajemen stok dengan audit trail
- dashboard penjualan

## Status

MVP sudah diimplementasikan dan diverifikasi lokal.

Quality gate lokal terakhir:
- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` ✅
- `npx playwright test` ✅

## Fitur Utama

- Kasir dengan flow tunai, transfer bank, dan QRIS
- History transaksi dengan pencarian, filter pembayaran, dan detail item
- Laporan harian, mingguan, bulanan, dan kustom
- Export CSV dan Excel
- CRUD produk
- Penyesuaian stok manual dan log stok
- Dashboard revenue, produk terlaris, dan stok kritis
- Bilingual UI: Bahasa Indonesia dan English
- Theme switch: light, dark, system
- Layout touch-friendly untuk tablet

## Tech Stack

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `next-intl`
- `next-themes`
- `Appwrite`
- `node-appwrite`
- `Playwright`
- `SheetJS`

## Menjalankan Secara Lokal

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan environment variables

Buat file `.env` dan isi minimal variable berikut:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=
APPWRITE_PRODUCTS_COLLECTION_ID=
APPWRITE_CATEGORIES_COLLECTION_ID=
APPWRITE_TRANSACTIONS_COLLECTION_ID=
APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID=
APPWRITE_STOCK_LOGS_COLLECTION_ID=
```

### 3. Provision dan seed database

```bash
npm run appwrite:provision-db
npm run appwrite:seed-db
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka:

```bash
http://localhost:3000/id/login
```

## Scripts

```bash
npm test
npm run dev
npm run build
npm run start
npm run lint
npm run e2e
npm run e2e:ui
npm run e2e:headed
npm run appwrite:provision-db
npm run appwrite:seed-db
```

## Testing

### Lint

```bash
npm run lint
```

### Typecheck

```bash
npx tsc --noEmit
```

### Production build

```bash
npm run build
```

### Smoke test

Menjalankan smoke test publik yang tidak membutuhkan kredensial login:

```bash
npm test
```

Catatan:
- `npm test -- --coverage` tetap jalan, tetapi flag coverage diabaikan karena coverage browser belum dikonfigurasi untuk Playwright di repo ini.

### End-to-end tests

Playwright membutuhkan kredensial akun uji:

```bash
USER_EMAIL='your-test-email'
USER_PASS='your-test-password'
npm run e2e
```

Coverage E2E saat ini mencakup:
- login dan redirect auth
- dashboard
- checkout kasir
- CRUD produk
- penyesuaian stok
- history transaksi
- laporan dan export CSV
- theme dan locale switch
- edge case UI utama

## Struktur Direktori

```bash
src/
├── app/              # App Router pages dan server actions
├── components/       # UI components per feature
├── i18n/             # Routing dan request config next-intl
└── lib/
    ├── appwrite/     # Browser-side Appwrite helpers
    ├── constants/    # Static constants
    ├── format/       # Formatter helpers
    ├── server/       # Appwrite server/auth/business logic
    └── utils/        # Shared utilities
```

## Deployment

Lihat panduan lengkap di:

- [DEPLOYMENT.md](./DEPLOYMENT.md)

Ringkasan:
- target deploy yang direkomendasikan: `Vercel`
- `Cloudflare Pages` tidak cocok untuk arsitektur repo ini dalam bentuk sekarang
- jika ingin tetap di Cloudflare, gunakan `Cloudflare Workers + OpenNext`

## Dokumen Lain

- [PRD.md](./PRD.md) — product requirements dan arsitektur
- [STATE.md](./STATE.md) — status implementasi dan verifikasi
- [DESIGN.md](./DESIGN.md) — catatan desain
- [AGENTS.md](./AGENTS.md) — guideline pengembangan repo

## Catatan Keamanan

- Jangan commit `.env`
- Jangan expose `APPWRITE_API_KEY`
- Jika secret pernah ter-push ke repo publik, segera rotate secret tersebut di Appwrite

## License

MIT
