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
- [x] Refactor stock.
- [x] Refactor settings.
- [x] Lint, typecheck, build, dan verification final lokal.
- [x] Rapikan repo untuk deployment: `.env.example`, smoke test command, dan sanitasi secret repo.

## Checklist Implementasi
- [x] Semua layar utama pindah dari `@/components/shared/ui` ke `@/components/ui`.
- [x] Cashier memakai layout split dengan sticky cart.
- [x] Products memakai dialog dan select berbasis foundation baru.
- [x] Reports memakai table dan export actions tetap aktif.
- [x] Stock memakai dua-zona inventory + audit trail.
- [x] Settings memakai segmented controls untuk theme dan locale.
- [x] History memakai list/detail layout yang stabil.

## Validation Checklist
- [x] `npm run lint`
- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [x] `npm test`
- [x] `npm test -- --coverage` kompatibel dan tidak gagal walau browser coverage belum dikonfigurasi
- [x] `npx playwright test` sudah tervalidasi lokal pada environment Appwrite + akun uji yang lengkap
- [x] Verifikasi wrapping nama produk panjang dan transaction ID
- [x] Verifikasi breakpoint mobile/tablet/desktop
- [x] Verifikasi cashier: add item, qty, out of stock, cash, transfer, QRIS, total, change, submit
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
