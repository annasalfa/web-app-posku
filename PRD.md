# PRD — F&B POS Web App

> **Version:** 2.3.0
> **Date:** 2026-04-09
> **Status:** MVP implemented, verified locally, and synced to current repository structure

---

## 1. Overview

### Problem Statement
Operasional kasir di bisnis F&B skala kecil sering masih dilakukan manual (tulis tangan / kalkulator), menyebabkan rawan kesalahan hitung, tidak ada history transaksi terstruktur, dan laporan penjualan sulit dibuat.

### Goals
| # | Goal | Prioritas |
|---|------|-----------|
| 1 | Menggantikan proses kasir manual dengan sistem digital | Critical |
| 2 | Menyediakan history transaksi yang akurat dan dapat dicari | Critical |
| 3 | Generate laporan penjualan yang bisa di-export ke Excel/CSV | High |
| 4 | Deploy mudah ke Vercel tanpa infrastruktur tambahan | High |

### Target User
Owner bisnis F&B yang sekaligus berperan sebagai kasir — **solo operator**, 1 outlet, akses via **tablet (Android/iPad)**.

### Out of Scope (MVP)
- Payment gateway terintegrasi (Midtrans, Xendit, dll)
- Printer struk/receipt thermal
- Multi-user / role management
- Multi-outlet
- Offline mode penuh

---

## 2. Requirements

### Functional Requirements
- **Kasir:** Proses transaksi — pilih menu → qty → hitung kembalian → pilih metode bayar (Tunai / Transfer Bank / QRIS print)
- **History Transaksi:** Tampilkan semua transaksi dengan pencarian transaksi/catatan, filter metode bayar, dan detail per transaksi
- **Laporan:** Ringkasan penjualan harian/mingguan/bulanan/kustom, exportable ke Excel/CSV
- **Manajemen Produk:** CRUD produk dengan nama, harga, kategori opsional, dan status aktif/nonaktif
- **Dashboard:** Ringkasan revenue hari ini, jumlah pesanan, rata-rata tiket, dan produk terlaris
- **Auth:** Login dengan email + password via Appwrite Auth

### Non-Functional Requirements
- **Koneksi:** Requires internet — data tersimpan di Appwrite Cloud
- **Responsif & touch-friendly:** Optimized untuk tablet, tombol kasir besar dan mudah di-tap
- **Performa:** Transaksi harus dapat diselesaikan dalam < 5 detik end-to-end
- **Keamanan:** Auth dan session ditangani penuh oleh Appwrite; HTTPS via Vercel (otomatis)
- **Bahasa:** Bilingual UI — Bahasa Indonesia & English (toggle)
- **Tema:** Modern minimalis dengan dukungan dark mode
- **Free tier:** Appwrite Free — 500K read ops + 250K write ops/bulan (lebih dari cukup untuk 1 outlet)

---

## 3. Core Features

| # | Fitur | Priority | Status MVP |
|---|-------|----------|------------|
| 1 | **Kasir / Checkout** — pilih produk, qty, hitung kembalian, pilih metode bayar | Must-have | ✅ MVP |
| 2 | **History Transaksi** — list semua transaksi, pencarian, filter pembayaran, detail per transaksi | Must-have | ✅ MVP |
| 3 | **Laporan & Export CSV** — ringkasan penjualan per periode, download Excel/CSV | Must-have | ✅ MVP |
| 4 | **Manajemen Produk** — CRUD produk (nama, harga, kategori opsional, aktif/nonaktif) | Must-have | ✅ MVP |
| 5 | **Dashboard** — revenue hari ini, produk terlaris, dan performa transaksi | Should-have | ✅ MVP |
| 6 | **Autentikasi** — login email + password via Appwrite Auth | Must-have | ✅ MVP |
| 7 | **Diskon / Voucher** | Nice-to-have | 🔜 Future |
| 8 | **Printer struk** | Nice-to-have | 🔜 Future |
| 9 | **Multi-user / role management** | Nice-to-have | 🔜 Future |

---

## 4. User Flow

### Flow 1 — Login
```
1. Buka URL app di browser tablet
2. Halaman login → input email + password
3. Appwrite Auth memvalidasi session
4. Redirect ke Dashboard
```

### Flow 2 — Transaksi Kasir (Primary Flow)
```
1. Owner buka halaman Kasir
2. Tap produk dari grid menu → masuk ke keranjang
3. Adjust qty di keranjang jika perlu
4. Sistem hitung total otomatis
5. Pilih metode bayar: Tunai / Transfer Bank / QRIS
   └── Jika Tunai: input nominal diterima → sistem hitung kembalian
6. Tap "Selesaikan Transaksi"
7. Sistem (sequential Appwrite writes):
   a. createDocument → collection transactions
   b. createDocument (per item) → collection transaction_items
8. Tampilkan konfirmasi transaksi berhasil
9. Keranjang di-reset, siap transaksi berikutnya
```

### Flow 3 — Manajemen Produk
```
1. Buka halaman Produk
2. Pilih produk
3. Ubah nama, harga, kategori, atau status aktif/nonaktif
4. Simpan → updateDocument products
```

### Flow 4 — Export Laporan
```
1. Buka halaman Laporan
2. Pilih rentang tanggal (harian / mingguan / custom)
3. App query Appwrite → listDocuments transactions (filter by date)
4. SheetJS generate CSV/Excel di browser
5. File didownload ke device
```

---

## 5. Architecture

### Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | **Next.js 15** (App Router, React 19, typed routes) | Full-stack, SSR + Server Actions |
| Backend / BaaS | **Appwrite Cloud** | Auth + Database built-in, free tier cukup untuk 1 outlet |
| Auth | **Appwrite Auth** (email + password) | Built-in, session di-manage otomatis |
| Database | **Appwrite Databases** (document-based) | Collections + query filter + realtime subscription |
| Styling | **Tailwind CSS 4** + **shadcn/ui foundation** + Radix primitives | Sistem UI konsisten untuk tablet, dark mode, dan form/dialog modern |
| i18n | **next-intl** | Bilingual ID/EN |
| Motion | **motion** | Subtle interaction and screen transitions |
| Export | **SheetJS** (client-side) | Generate CSV/Excel di browser, tidak perlu API route khusus |
| Deployment | **Vercel** | Push → deploy otomatis, TLS, zero config |

### System Architecture

```mermaid
flowchart TD
    subgraph Client["Tablet Browser"]
        UI["Next.js App\n(App Router + React)"]
        XLSX["SheetJS\n(CSV/Excel export)"]
    end

    subgraph Vercel["Vercel (Serverless)"]
        SA["Server Actions\n(node-appwrite)"]
    end

    subgraph Appwrite["Appwrite Cloud"]
        AUTH["Appwrite Auth"]
        DB["Appwrite Databases"]
    end

    UI -->|"Server Actions"| SA
    SA -->|"node-appwrite SDK"| AUTH
    SA -->|"node-appwrite SDK"| DB
    UI --> XLSX
```

### Appwrite Collections Map

| Collection | Setara Tabel Relasional | Keterangan |
|------------|------------------------|------------|
| `products` | products | Katalog menu aktif/nonaktif |
| `categories` | categories | Kategori produk (opsional di MVP) |
| `transactions` | transactions | Header setiap transaksi |
| `transaction_items` | transaction_items | Line item per transaksi |

> Appwrite Auth menangani `users` secara built-in — tidak perlu collection terpisah.

### Current Route Map

| Route | Implementasi |
|-------|--------------|
| `/[locale]/login` | Login page |
| `/[locale]` | Dashboard |
| `/[locale]/cashier` | Cashier / checkout |
| `/[locale]/history` | Transaction history |
| `/[locale]/products` | Product management |
| `/[locale]/reports` | Sales reports + CSV export |
| `/[locale]/settings` | Theme + locale settings |

### Current Repository Structure Snapshot

```text
.
├── src/app/
│   ├── [locale]/
│   │   ├── cashier/page.tsx
│   │   ├── history/page.tsx
│   │   ├── login/page.tsx
│   │   ├── products/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── checkout.ts
│   │   └── products.ts
│   └── globals.css
├── src/components/
│   ├── auth/login-page.tsx
│   ├── cashier/cashier-page.tsx
│   ├── dashboard/dashboard-page.tsx
│   ├── history/history-page.tsx
│   ├── layout/{app-frame,providers}.tsx
│   ├── products/products-page.tsx
│   ├── reports/reports-page.tsx
│   ├── settings/settings-page.tsx
│   └── ui/
│       ├── index.ts
│       ├── pos.tsx
│       └── shadcn-style primitives
├── src/lib/
│   ├── appwrite/{client,realtime}.ts
│   ├── constants/navigation.ts
│   ├── format/index.ts
│   ├── server/
│   │   ├── appwrite.ts
│   │   ├── auth.ts
│   │   ├── checkout.ts
│   │   ├── env.ts
│   │   ├── pos-types.ts
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   └── session.ts
│   └── utils/{cn,use-online-status}.ts
├── src/i18n/{navigation,request,routing}.ts
├── messages/{en,id}.json
├── scripts/
│   ├── provision-appwrite-database.mjs
│   ├── run-tests.mjs
│   └── seed-appwrite-data.mjs
├── e2e/
│   ├── auth.setup.ts
│   ├── auth-redirect.spec.ts
│   ├── app.spec.ts
│   ├── backoffice-interactions.spec.ts
│   ├── ui-edge-cases.spec.ts
│   └── support/appwrite-admin.ts
└── config/docs root files
```

Catatan struktur:
- `src/components/shared/` dan `src/lib/data/` masih ada sebagai folder legacy kosong.
- Folder `public/` berisi asset favicon runtime untuk browser dan metadata icon support.
- Tidak ada `src/app/api/*`; seluruh mutasi data saat ini lewat Server Actions.

---

## 6. Database Schema

```mermaid
erDiagram
    USERS {
        string userId PK
        string email
        string name
    }

    CATEGORIES {
        string id PK
        string name
        datetime createdAt
    }

    PRODUCTS {
        string id PK
        string name
        float price
        string categoryId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    TRANSACTIONS {
        string id PK
        float totalAmount
        float amountPaid
        float changeAmount
        string paymentMethod
        string notes
        datetime createdAt
    }

    TRANSACTION_ITEMS {
        string id PK
        string transactionId FK
        string productId FK
        integer quantity
        float unitPrice
        float subtotal
    }

    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    PRODUCTS ||--o{ TRANSACTION_ITEMS : "included in"
    TRANSACTIONS ||--o{ TRANSACTION_ITEMS : "contains"
```

### Collection Details

| Collection | Field Kritis | Index |
|------------|-------------|-------|
| `products` | `isActive` (soft delete) | `categoryId`, `isActive` |
| `transactions` | `paymentMethod` (cash/transfer/qris), `createdAt` | `createdAt` |
| `transaction_items` | `unitPrice` snapshot saat transaksi | `transactionId`, `productId` |

---

## 7. Design & Technical Constraints

### UI / UX Constraints
1. **Touch-first:** Semua elemen interaktif minimum 48×48px (touch target WCAG)
2. **Grid produk kasir:** Card-based, 2 kolom portrait, 3–4 kolom landscape
3. **Tombol aksi utama:** Tinggi minimum 56px, font 18px+, contrast ratio > 4.5:1
4. **Dark mode:** Tailwind `dark:` classes + `next-themes`
5. **Bahasa:** next-intl, locale default `id`, toggle ke `en` via settings
6. **Tablet navigation:** Drawer navigation on mobile/tablet, persistent navigation rail on desktop besar
7. **Long-content safety:** ID transaksi, nama produk, dan teks dinamis harus wrap tanpa overflow pada viewport tablet

### Technical Constraints
1. **Appwrite SDK split:** `node-appwrite` dipakai untuk auth dan database di Server Actions; browser client hanya opsional untuk capability client-side
2. **Auth session:** Session secret Appwrite disimpan dalam cookie `httpOnly` `posku-session` — tidak perlu implementasi JWT manual
3. **Atomic checkout:** Checkout menyimpan `transactions` dan `transaction_items` lewat transaksi database Appwrite agar write multi-dokumen tetap konsisten
4. **Export client-side:** SheetJS generate file di browser — fetch data dari Appwrite dulu, lalu generate tanpa server involvement
5. **Free tier estimate:** ~100 transaksi/hari × 30 hari = ~3.000 transaksi/bulan → ~15K writes, ~50K reads — jauh di bawah limit 250K writes + 500K reads
6. **Environment variables Vercel:** `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`
7. **Offline handling:** Tidak didukung — tampilkan banner "Tidak ada koneksi internet" saat offline, disable tombol checkout

### Performance Targets
| Metrik | Target |
|--------|--------|
| Halaman kasir (initial load) | < 2 detik |
| Proses transaksi (submit → konfirmasi) | < 3 detik |
| Export CSV 1.000 transaksi | < 5 detik |
| Appwrite query response | < 500ms |

### Current Verification Snapshot
- Local quality gate saat ini: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`, dan `npx playwright test`
- E2E browser coverage mencakup:
  - auth setup, auth redirect, logout
  - dashboard dan navigasi utama
  - CRUD produk
  - checkout kasir untuk tunai dan QRIS
  - histori transaksi
  - laporan dan export CSV
  - theme toggle, locale switch, responsive nav mobile/tablet
  - edge case UI seperti produk nonaktif, nominal tunai kurang, modal backdrop, dan overflow ID transaksi di History

---

## Appendix — Tech Docs References

| Library | Catatan Implementasi |
|---------|----------------------|
| **Next.js 15** | App Router + Server Actions untuk semua Appwrite Node SDK calls |
| **appwrite** (Web SDK) | Browser-side capability checks / future realtime hooks |
| **node-appwrite** (Node SDK) | Server Actions: auth session, createDocument, listDocuments, updateDocument dengan API key |
| **SheetJS (xlsx)** | Client-side CSV/Excel generation dari array data transaksi |
| **Tailwind CSS 4** | Utility-first styling untuk tokens global dan foundation UI |
| **shadcn/ui + Radix** | Primitive components untuk dialog, sheet, select, table, toggle, dan input |
| **motion** | Subtle animation layer untuk transisi dan interaction states |
| **next-intl** | i18n bilingual ID/EN |
| **next-themes** | Dark mode toggle |
