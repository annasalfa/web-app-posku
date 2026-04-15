# PROGRES_TRACK

## Tujuan Redesign
- Migrasi POSKU dari komponen UI custom lama ke foundation `shadcn/ui` + `motion`.
- Menyatukan shell, tokens, dan pola layout agar sesuai `POS_DESIGN.md`.
- Menjaga kontrak data, server actions, dan flow Appwrite tetap stabil selama redesign.

## Keputusan Arsitektur
- Foundation UI resmi berada di `src/components/ui/*`.
- Theme memakai CSS variables di `src/app/globals.css` dengan light/dark tokens berbasis `POS_DESIGN.md`.
- Animasi memakai `motion/react` dengan gaya subtle operational dan dukungan reduced motion.
- Navigation mobile memakai `Sheet`; dialog form memakai `Dialog`; form/input memakai primitives `shadcn`.
- `src/components/shared/ui.tsx` dihapus; semua layar dipindah ke foundation baru.

## Milestone
- [x] Tambah dependency UI dan motion.
- [x] Tambah `components.json`.
- [x] Redesign global tokens, radius, shadow, typography, dan dark mode.
- [x] Tambah primitives `button`, `input`, `label`, `card`, `badge`, `dialog`, `sheet`, `select`, `dropdown-menu`, `toggle-group`, `separator`, `scroll-area`, `table`, `textarea`.
- [x] Refactor app shell / navigation rail / mobile sheet.
- [x] Refactor login.
- [x] Refactor dashboard.
- [x] Refactor cashier.
- [x] Refactor history.
- [x] Refactor reports.
- [x] Refactor products.
- [x] Refactor settings.
- [x] Lint, typecheck, build, dan verification final lokal.
- [x] Rapikan repo untuk deployment: `.env.example`, smoke test command, dan sanitasi secret repo.
- [x] Sinkronkan `PRD.md`, `STATE.md`, dan `PROGRES_TRACK.md` dengan struktur codebase aktual.

## Checklist Implementasi
- [x] Semua layar utama pindah dari `@/components/shared/ui` ke `@/components/ui`.
- [x] Cashier memakai layout split dengan sticky cart.
- [x] Products memakai dialog dan select berbasis foundation baru.
- [x] Reports memakai table dan export actions tetap aktif.
- [x] Settings memakai segmented controls untuk theme dan locale.
- [x] History memakai list/detail layout yang stabil.
- [x] Compact tablet pass diterapkan pada shell, history, dan segmented controls agar aman di breakpoint tablet sempit.
- [x] Sidebar shell kini auto-hide di bawah `xl`, sehingga tablet dan mobile memakai drawer navigation yang sama.
- [x] Drawer navigation shell kini punya title dan description tersembunyi untuk memenuhi aksesibilitas Radix dialog tanpa mengubah tampilan visual.
- [x] Drawer navigation shell kini punya spacer atas khusus agar tombol close tidak overlap dengan item navigasi pertama.
- [x] Layout `Kasir` kini memunculkan `Pesanan aktif` sebagai kolom kanan lebih cepat pada breakpoint tablet landscape.
- [x] Bagian `Metode bayar` di `Kasir` kini memakai grid 3 tombol khusus agar label metode bayar lebih rapi pada kolom cart yang sempit.
- [x] Fitur manajemen stok dihapus end-to-end; produk kini hanya memakai status aktif/nonaktif dan route `/stock` sudah dihapus.
- [x] Dokumen status dan PRD menampilkan route map, struktur `src/`, scripts, i18n, dan suite test yang benar-benar ada di repo.
- [x] Catatan struktur sekarang mengakui folder legacy kosong: `src/components/shared/` dan `src/lib/data/`, serta asset runtime di `public/`.

## Validation Checklist
- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] `npm test`
- [x] `npm test -- --coverage` kompatibel dan tidak gagal walau browser coverage belum dikonfigurasi
- [x] `npx playwright test` sudah tervalidasi lokal pada environment Appwrite + akun uji yang lengkap
- [x] `TestSprite` frontend run selesai dan menghasilkan artefak `testsprite_tests/`
- [x] Verifikasi wrapping nama produk panjang dan transaction ID
- [x] Verifikasi breakpoint mobile/tablet/desktop
- [x] Verifikasi cashier: add item, qty, produk nonaktif tersembunyi, cash, transfer, QRIS, total, change, submit
- [x] Verifikasi snapshot struktur repo terhadap file aktual dengan `src/app`, `src/components`, `src/lib`, `messages`, `scripts`, dan `e2e`
- [x] Triage failure TestSprite prioritas tinggi: checkout submit, product save/create, dan sinkronisasi flow prioritas tinggi
- [x] Manual browser smoke pass lokal tervalidasi untuk login, shell drawer, cashier, products, history, reports, dan settings
- [ ] Verifikasi manual light/dark di device target produksi
- [ ] Verifikasi manual locale `id/en` di device target produksi
- [ ] Verifikasi manual offline state di device target produksi

## Deployment Readiness
- [x] Build production Next.js lolos.
- [x] Typecheck dan lint hijau.
- [x] Public smoke test tersedia via `npm test`.
- [x] `.env.example` tersedia sebagai source of truth env lokal/deploy.
- [x] `opencode.json` tidak lagi di-track dan diganti template `opencode.example.json`.
- [x] Hardcoded Appwrite key dan kredensial akun uji dibersihkan dari repo saat ini.
- [x] Provisioning Appwrite pada environment target sudah berhasil menurut konfirmasi operator (`2026-04-09`).
- [x] Deploy Vercel sudah live menurut konfirmasi operator (`2026-04-09`).
- [ ] Rotate Appwrite API key yang pernah terpapar di history git.
- [ ] Rotate/reset kredensial akun uji yang pernah terpapar di history git.
- [ ] Verifikasi env vars pada target deploy aktual (mis. Vercel).
- [ ] UAT setelah deploy pada tablet nyata.

## Progress Log / Commit Recommendation
- Batch 1: `feat(ui): add shadcn foundation and theme tokens`
- Batch 2: `feat(shell): redesign navigation rail and app frame`
- Batch 3: `feat(cashier): rebuild cashier workflow with new tablet layout`
- Batch 4: `feat(data-pages): redesign dashboard history reports products stock settings`
- Batch 5: `docs(ui): add progress tracking for redesign rollout`
- Batch 6: `chore(verification): add smoke test flow and deployment hygiene fixes`
- Batch 7: `docs(state): sync project docs with current repository structure`
- Batch 8: `fix(appwrite): add transactional writes, read fallbacks, and history snapshots`
- Batch 9: `fix(products): guard empty-name saves and sync post-deploy status`
- Batch 10: `fix(ui): compact tablet layout for history and shared controls`
- Batch 11: `fix(shell): auto-hide sidebar on tablet and mobile`
- Batch 12: `fix(a11y): add hidden title for shell drawer`
- Batch 13: `fix(shell): prevent drawer close overlap`
- Batch 14: `fix(cashier): promote cart panel for tablet layout`
- Batch 15: `fix(cashier): refine payment method selector`
- Batch 16: `refactor(domain): remove stock management end-to-end`
- Batch 17: `fix(testing): restore full suite after stock-removal regressions`
- Batch 18: `fix(ui): resolve drawer a11y and favicon runtime issues`

## Latest Hardening Work
- [x] Tambah helper Appwrite server untuk pagination internal, retry transient read, dan transaksi database native.
- [x] Dashboard/cashier/history/products/reports kini punya fallback state saat read Appwrite gagal, bukan crash route.
- [x] `settings` kini memverifikasi auth valid di server dan tidak lagi bergantung hanya pada cookie presence di middleware.
- [x] Checkout kini memakai Appwrite database transaction untuk menjaga konsistensi multi-dokumen.
- [x] `transaction_items` kini menyimpan `productNameSnapshot` untuk menjaga akurasi histori saat nama produk berubah.
- [x] Provisioning database diperketat: permission koleksi bisnis tidak lagi memberi CRUD langsung ke user session browser.
- [x] Tambah script migrasi/backfill: `npm run appwrite:migrate-db`.
- [x] Tambah regression E2E untuk stale-session redirect dan histori snapshot setelah rename produk.
- [x] `npm run lint`, `npm run build`, dan `npx tsc --noEmit` lolos setelah perubahan hardening ini.
- [x] `npm run appwrite:migrate-db` sudah dijalankan pada environment Appwrite target (`Backfilled productNameSnapshot on 0 transaction items.`).
- [x] Rerun targeted Playwright production suites untuk flow prioritas tinggi TestSprite (`backoffice-interactions` dan `ui-edge-cases`).
- [x] Verifikasi pasca-refactor stok kini kembali hijau untuk lint, build, typecheck, public smoke (`npm test`), dan full Playwright suite.
- [x] Verifikasi browser interaktif lokal via MCP fallback (`playwright`) selesai setelah `chrome-devtools` MCP gagal attach ke X server sesi ini.
- [x] Tambahkan `SheetDescription` pada drawer shell untuk menghilangkan warning Radix `DialogContent`.
- [x] Tambahkan favicon agar console dev tidak lagi menghasilkan `GET /favicon.ico 404`.

## Latest TestSprite Run
- [x] Build production lokal dijalankan sebelum TestSprite.
- [x] TestSprite frontend plan dan generated cases berhasil dibuat di `testsprite_tests/`.
- [x] TestSprite frontend execution selesai dengan hasil `15` pass / `8` fail (`65.22%`).
- [x] Ringkasan hasil ditulis ke `testsprite_tests/testsprite-mcp-test-report.md`.
- [x] Korelasikan failure TestSprite dengan suite Playwright yang sudah ada untuk memisahkan bug aplikasi vs false negative generator.
- [x] Debug log produksi yang paling relevan dari sesi ini:
  - `UNAUTHENTICATED` muncul pada sebagian route render saat run berakhir
  - `PRODUCT_NAME_REQUIRED` muncul pada salah satu alur simpan produk
- [x] Tambah guard client-side untuk nama produk kosong agar tidak lagi memunculkan generic Server Components production error pada path validasi.

## Snapshot Struktur Saat Ini
- App Router localized ada di `src/app/[locale]` dengan route: `login`, `dashboard`, `cashier`, `history`, `products`, `reports`, dan `settings`.
- Server actions aktif ada di `src/app/actions/{auth,checkout,products}.ts`.
- UI foundation aktif ada di `src/components/ui/*` dengan `pos.tsx` dan `index.ts` sebagai komposisi helper.
- Domain server aktif ada di `src/lib/server/{appwrite,auth,checkout,database,env,pos-types,products,sales,session}.ts`.
- Dukungan i18n aktif ada di `src/i18n/*` dan `messages/{id,en}.json`.
- Verification/runtime support aktif ada di `scripts/*`, `playwright.config.ts`, dan `e2e/*`.
- Tidak ada `src/app/api/*` pada snapshot repo saat ini; mutasi server memakai Server Actions.
