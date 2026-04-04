# Deployment Guide

Dokumen ini menjelaskan cara deploy proyek POSKU ke:
- Vercel
- Cloudflare Pages

Untuk konteks repo ini:
- Framework: `Next.js 15` App Router
- Auth: `Appwrite` dengan cookie session `httpOnly`
- Backend calls: `node-appwrite` di server
- Fitur server-side yang dipakai:
  - `middleware`
  - `Server Actions`
  - auth/session berbasis cookie
  - dynamic server rendering

Karena itu, target deploy yang paling aman untuk aplikasi ini saat ini adalah `Vercel`.

## 1. Status Kompatibilitas

### Vercel
- `Recommended`
- Cocok penuh untuk arsitektur repo ini
- Tidak perlu adapter tambahan

### Cloudflare Pages
- `Tidak direkomendasikan untuk repo ini dalam bentuk sekarang`
- Alasan:
  - Cloudflare Pages untuk Next.js diarahkan ke static Pages flow
  - dokumentasi resmi Cloudflare menyarankan aplikasi Next.js full-stack SSR memakai `Cloudflare Workers + OpenNext`
  - repo ini memakai `middleware`, `Server Actions`, dan `node-appwrite`, jadi bukan static-only app

Kesimpulan praktis:
- Jika ingin deploy sekarang tanpa ubahan arsitektur: pakai `Vercel`
- Jika ingin tetap di Cloudflare: gunakan `Cloudflare Workers`, bukan Pages static flow

## 2. Environment Variables

Set environment variables berikut di platform deploy:

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

Catatan:
- Semua variable di atas wajib untuk build dan runtime aplikasi saat ini.
- `APPWRITE_API_KEY` adalah secret server. Jangan expose ke browser selain melalui server runtime platform.
- Untuk Appwrite Cloud, pastikan endpoint dan project ID sesuai environment production.

## 3. Pre-Deploy Checklist

Sebelum deploy, pastikan semua ini hijau:

```bash
npm run lint
npx tsc --noEmit
npm run build
USER_EMAIL='...' USER_PASS='...' npx playwright test
```

Status lokal terakhir repo ini:
- `lint` pass
- `typecheck` pass
- `build` pass
- `Playwright E2E` pass

## 4. Push ke GitHub

Bagian ini dipakai jika repo lokal ini belum terhubung ke GitHub.

### 4.1 Buat Repository di GitHub

1. Buka GitHub.
2. Klik `New repository`.
3. Isi nama repository, misalnya `web-app-posku`.
4. Pilih visibility:
   - `Private` jika project internal
   - `Public` jika ingin repo terbuka
5. Jangan centang:
   - `Add a README file`
   - `Add .gitignore`
   - `Choose a license`

Alasannya: repo lokal ini sudah punya isi sendiri, jadi hindari konflik commit awal.

### 4.2 Inisialisasi Git Lokal Jika Belum Ada

Cek dulu:

```bash
git status
```

Jika muncul error bahwa folder ini belum menjadi git repository, jalankan:

```bash
git init
```

### 4.3 Commit Perubahan Lokal

Cek file yang akan di-commit:

```bash
git status
```

Tambahkan semua file:

```bash
git add .
```

Buat commit awal atau commit terbaru:

```bash
git commit -m "Prepare app for deployment"
```

### 4.4 Connect Repo Lokal ke GitHub

Set branch utama:

```bash
git branch -M main
```

Tambahkan remote GitHub:

```bash
git remote add origin https://github.com/<username>/<repo-name>.git
```

Contoh:

```bash
git remote add origin https://github.com/nama-user/web-app-posku.git
```

Jika remote `origin` sudah ada, cek dulu:

```bash
git remote -v
```

Kalau perlu ganti URL:

```bash
git remote set-url origin https://github.com/<username>/<repo-name>.git
```

### 4.5 Push ke GitHub

Push branch `main`:

```bash
git push -u origin main
```

Setelah itu, commit berikutnya cukup:

```bash
git push
```

### 4.6 Verifikasi

Pastikan di GitHub:
- semua file repo muncul
- branch default adalah `main`
- file penting seperti `.env` tidak ikut ter-push jika memang ada di `.gitignore`

## 5. Deploy ke Vercel

### Opsi A: via Dashboard

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Buka Vercel dashboard.
3. Klik `Add New Project`.
4. Import repository ini.
5. Pastikan Vercel mendeteksi framework `Next.js`.
6. Isi environment variables di project settings.
7. Deploy.

### Opsi B: via CLI

Install CLI:

```bash
npm i -g vercel
```

Login:

```bash
vercel login
```

Deploy preview:

```bash
vercel
```

Deploy production:

```bash
vercel --prod
```

### Vercel Project Settings

Nilai yang dipakai:

```bash
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: auto-detect
Node Version: gunakan versi default Vercel yang kompatibel dengan Next.js 15
```

### Domain dan Redirect

Setelah deploy:
- tambahkan custom domain di Vercel jika perlu
- pastikan HTTPS aktif
- cek route berikut:
  - `/id/login`
  - `/en/login`
  - `/id`
  - `/id/cashier`
  - `/id/history`

### Post-Deploy Smoke Test di Vercel

Uji minimal:
- login berhasil
- route privat redirect ke login saat belum auth
- cashier bisa submit transaksi
- history menampilkan transaksi baru
- reports bisa export CSV
- settings bisa logout dan switch locale

## 6. Deploy ke Cloudflare Pages

### Ringkasan

`Cloudflare Pages` static deployment tidak cocok untuk repo ini saat ini.

Alasan teknis:
- aplikasi ini bukan static export
- aplikasi memakai `Server Actions`
- aplikasi memakai `middleware`
- aplikasi memakai `node-appwrite`
- aplikasi memerlukan runtime server, bukan hanya asset statis

### Jika tetap dipaksa ke Pages

Agar bisa jalan di Pages static, Anda harus mengubah arsitektur secara signifikan, misalnya:
- menghapus server-side auth saat ini
- menghapus `middleware` auth guard
- menghapus `Server Actions`
- memindahkan seluruh logic backend ke API eksternal/worker lain
- mengejar output `static export`

Itu berarti bukan sekadar deploy config, tetapi refactor arsitektur.

### Kesimpulan untuk Pages

Untuk repo ini:
- `Cloudflare Pages: not supported as-is`
- `Cloudflare Workers + OpenNext: jalur Cloudflare yang benar`

## 7. Jika Ingin Deploy di Cloudflare

Gunakan `Cloudflare Workers` dengan adapter `OpenNext`.

Langkah umumnya:

1. Install adapter:

```bash
npm i @opennextjs/cloudflare@latest
npm i -D wrangler@latest
```

2. Tambahkan config OpenNext:

```ts
import {defineCloudflareConfig} from '@opennextjs/cloudflare';

export default defineCloudflareConfig();
```

3. Tambahkan config Wrangler, misalnya:

```toml
name = "web-app-posku"
main = ".open-next/worker.js"
compatibility_date = "2025-03-25"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"
```

4. Tambahkan scripts:

```json
{
  "scripts": {
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  }
}
```

5. Set semua environment variables juga di Cloudflare build/runtime.
6. Jalankan preview dulu:

```bash
npm run preview
```

7. Deploy:

```bash
npm run deploy
```

Catatan penting:
- Ini belum dikonfigurasi di repo saat ini.
- Jika memilih jalur ini, perlu tambahan setup dan verifikasi ulang penuh.

## 8. Rekomendasi Final

Untuk kondisi repo sekarang:

1. Deploy production di `Vercel`
2. Gunakan `Cloudflare Pages` hanya jika nanti ada static site terpisah
3. Jika harus tetap di ekosistem Cloudflare untuk app ini, pilih `Cloudflare Workers + OpenNext`

## 9. Referensi Resmi

- Next.js deployment docs: https://nextjs.org/docs/app/getting-started/deploying
- Vercel Next.js docs: https://vercel.com/docs/frameworks/nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Cloudflare Next.js on Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Pages Next.js note: https://developers.cloudflare.com/pages/framework-guides/nextjs/
