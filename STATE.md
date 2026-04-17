# STATE

## Current Status
- MVP frontend and backend integration are implemented in Next.js 15 App Router with real Appwrite-backed flows.
- UI foundation has been migrated to `src/components/ui/*` with Tailwind CSS 4, Radix-based primitives, and `motion`.
- Auth, dashboard, cashier, history, reports, products, and settings routes are present in the localized App Router tree.
- Sidebar branding copy on the navigation rail and mobile navigation drawer has been removed to keep the shell cleaner.
- Dashboard content header has been simplified by removing the `Overview` eyebrow and large `Dashboard` page title.
- Top header copy has been reduced to the active page title only, without the app name and owner-mode subtitle.
- All authenticated pages now rely on the top header as the only page title, with duplicated in-content `PageHeader` blocks removed across desktop, tablet, and mobile layouts.
- Playwright authenticated-shell assertions have been updated to target the top header title and the absence of sidebar/mobile branding copy.
- Playwright now uses a dedicated configurable port for its local web server so `baseURL` and `webServer` stay aligned during test runs.
- Local verification has passed for lint, typecheck, production build, smoke test, and Playwright E2E.
- Per operator confirmation on `2026-04-09`, Appwrite provisioning has already succeeded and the Vercel deployment is already live.
- A TestSprite frontend run was completed on `2026-04-06` against a local production server on port `3200`; artifacts were generated under `testsprite_tests/` with `23` generated cases, `15` passes, and `8` failures pending triage.
- The highest-priority TestSprite mutation regressions have now been rechecked against the current tree on `2026-04-09` with local production Playwright coverage and are passing again.
- Documentation snapshot in `PRD.md`, `STATE.md`, and `PROGRES_TRACK.md` has been realigned with the current repository and deployment status on `2026-04-09`.
- A tablet compact pass was applied on `2026-04-09` after manual UAT feedback identified oversized controls and overlap risk in the history screen; the shared shell rail, segmented controls, and related data-page density were tightened for tablet widths.
- The authenticated shell now auto-hides the persistent sidebar below `xl`, so tablet and mobile use the existing drawer navigation while desktop large keeps the fixed rail.
- The shell drawer now includes an accessible hidden title and description so Radix dialog accessibility checks no longer throw runtime errors or description warnings when tablet/mobile navigation opens.
- The shell drawer reserves top spacing for the close button, preventing the floating dismiss control from overlapping the first navigation item on tablet/mobile.
- The cashier layout now switches to a two-column product/cart arrangement from tablet landscape widths, keeping `Pesanan aktif` closer to the product list instead of dropping far below it.
- The cashier payment selector now uses a dedicated three-button grid in the cart panel, replacing the wrapped segmented control so `Tunai`, `Transfer bank`, and `QRIS` render more cleanly in narrow cart widths.
- Stock management has been removed end-to-end on `2026-04-09`; products now use only `isActive` / `isInactive`, the `/stock` route is gone, checkout no longer mutates inventory, and Appwrite provisioning no longer requires `stock_logs`.
- Product writes now include a server-only legacy `stockQty: 0` compatibility payload so the live Appwrite schema stays writable while stock remains removed from the app's public domain and UI.
- A local manual browser smoke pass was completed on `2026-04-09` using MCP browser automation against `next dev` on port `3000`; login, dashboard, cashier, products, history, reports, settings, and tablet/mobile drawer navigation all rendered and behaved correctly.
- The requested `chrome-devtools` MCP path could not be executed in this session because its headful browser launcher could not attach to an X server; the browser pass was completed with the Playwright MCP fallback instead.
- The prior shell drawer Radix description warning and local `/favicon.ico` 404 follow-ups have been addressed with hidden drawer description copy and runtime favicon assets.

## Workflow Stage
- Workflow reference: `PRD.md -> FrontEnd -> BackEnd -> DB Integrations -> Testing -> Deployment`
- Current stage: `Post-deploy verification and stabilization`
- Completed stages:
  - `PRD`
  - `FrontEnd`
  - `BackEnd`
  - `DB Integrations`
  - `Testing`
  - `Deployment`
- In progress / next:
  - deployed-environment verification
  - production stabilization
- Not done yet:
  - manual UAT on deployed tablet devices
  - live-environment smoke test log for the public Vercel deployment
  - key rotation for previously exposed Appwrite/test credentials in git history

## Repository Snapshot

### Top-Level Files
- `.env.example`
- `AGENTS.md`
- `DEPLOYMENT.md`
- `DESIGN.md`
- `POS_DESIGN.md`
- `PRD.md`
- `PROGRES_TRACK.md`
- `README.md`
- `STATE.md`
- `components.json`
- `eslint.config.mjs`
- `next.config.ts`
- `package.json`
- `playwright.config.ts`
- `tsconfig.json`

### App Router Structure
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/loading.tsx`
- `src/app/[locale]/login/page.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/cashier/page.tsx`
- `src/app/[locale]/history/page.tsx`
- `src/app/[locale]/products/page.tsx`
- `src/app/[locale]/reports/page.tsx`
- `src/app/[locale]/settings/page.tsx`
- `src/app/actions/auth.ts`
- `src/app/actions/checkout.ts`
- `src/app/actions/products.ts`
- `src/app/globals.css`

### Component Structure
- `src/components/auth/login-page.tsx`
- `src/components/cashier/cashier-page.tsx`
- `src/components/dashboard/dashboard-page.tsx`
- `src/components/history/history-page.tsx`
- `src/components/layout/app-frame.tsx`
- `src/components/layout/providers.tsx`
- `src/components/products/products-page.tsx`
- `src/components/reports/reports-page.tsx`
- `src/components/settings/settings-page.tsx`
- `src/components/ui/index.ts`
- `src/components/ui/pos.tsx`
- `src/components/ui/{badge,button,card,dialog,dropdown-menu,input,label,scroll-area,select,separator,sheet,table,textarea,toggle-group}.tsx`

### Library / Domain Structure
- `src/lib/appwrite/client.ts`
- `src/lib/appwrite/realtime.ts`
- `src/lib/constants/navigation.ts`
- `src/lib/format/index.ts`
- `src/lib/server/appwrite.ts`
- `src/lib/server/auth.ts`
- `src/lib/server/checkout.ts`
- `src/lib/server/database.ts`
- `src/lib/server/env.ts`
- `src/lib/server/pos-types.ts`
- `src/lib/server/products.ts`
- `src/lib/server/sales.ts`
- `src/lib/server/session.ts`
- `src/lib/utils/cn.ts`
- `src/lib/utils/use-online-status.ts`

### Supporting Folders
- `src/i18n/{navigation,request,routing}.ts`
- `messages/en.json`
- `messages/id.json`
- `scripts/provision-appwrite-database.mjs`
- `scripts/run-tests.mjs`
- `scripts/seed-appwrite-data.mjs`
- `e2e/auth.setup.ts`
- `e2e/auth-redirect.spec.ts`
- `e2e/app.spec.ts`
- `e2e/backoffice-interactions.spec.ts`
- `e2e/ui-edge-cases.spec.ts`
- `e2e/support/appwrite-admin.ts`

### Structural Notes
- `src/components/shared/` still exists as an empty legacy directory.
- `src/lib/data/` still exists as an empty legacy directory.
- `public/` contains runtime favicon assets (`favicon.ico`, PNG sizes) for browser and metadata icon support.
- There is no `src/app/api/*`; server mutations currently go through Server Actions.
- `src/middleware.ts` is present in the current working tree.

## Route Coverage
- `/[locale]/login` -> login
- `/[locale]` -> dashboard
- `/[locale]/cashier` -> cashier / checkout
- `/[locale]/history` -> transaction history
- `/[locale]/products` -> product management
- `/[locale]/reports` -> sales reports + export
- `/[locale]/settings` -> theme and locale settings

## Auth
- Cookie name: `posku-session`
- Auth is server-side using `node-appwrite`
- Implemented files:
  - `src/lib/server/env.ts`
  - `src/lib/server/appwrite.ts`
  - `src/lib/server/session.ts`
  - `src/lib/server/auth.ts`
  - `src/app/actions/auth.ts`
- Login/logout UI uses server actions.

## Appwrite Database
- Provisioning script: `scripts/provision-appwrite-database.mjs`
- Seed script: `scripts/seed-appwrite-data.mjs`
- NPM scripts:
  - `npm run appwrite:provision-db`
  - `npm run appwrite:seed-db`
- Collections created:
  - `categories`
  - `products`
  - `transactions`
  - `transaction_items`

## Seeded Data
- Categories: 5
- Products: 8
- Transactions: 0
- Transaction items: 0

## Backend Coverage
- Implemented files:
  - `src/lib/server/pos-types.ts`
  - `src/lib/server/products.ts`
  - `src/lib/server/checkout.ts`
  - `src/lib/server/sales.ts`
  - `src/app/actions/products.ts`
  - `src/app/actions/checkout.ts`
- Features supported:
  - list/save products
  - checkout transaction creation
  - transaction item creation
  - list transaction history with transaction items
  - compute dashboard metrics from real transactions
  - filter/export reports from real transactions

## UI Connected To Real Backend
- `dashboard` -> `src/app/[locale]/page.tsx`, `src/components/dashboard/dashboard-page.tsx`
- `history` -> `src/app/[locale]/history/page.tsx`, `src/components/history/history-page.tsx`
- `reports` -> `src/app/[locale]/reports/page.tsx`, `src/components/reports/reports-page.tsx`
- `products` -> `src/app/[locale]/products/page.tsx`, `src/components/products/products-page.tsx`
- `cashier` -> `src/app/[locale]/cashier/page.tsx`, `src/components/cashier/cashier-page.tsx`
- `settings` -> `src/app/[locale]/settings/page.tsx`, `src/components/settings/settings-page.tsx`

## Mock Data Status
- `src/lib/data/mock-data.ts` has been removed.
- No current feature pages depend on mock dashboard/history/report data.

## Important Environment Variables
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_PRODUCTS_COLLECTION_ID`
- `APPWRITE_CATEGORIES_COLLECTION_ID`
- `APPWRITE_TRANSACTIONS_COLLECTION_ID`
- `APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID`
- `USER_EMAIL`
- `USER_PASS`

## Verification Completed
- `npm run appwrite:provision-db` succeeds
- `npm run appwrite:seed-db` succeeds
- `npm run lint` succeeds
- `npx tsc --noEmit` succeeds
- `npm run build` succeeds
- `npm test` succeeds
- `npx playwright test` succeeds
- `TestSprite` frontend execution completed with artifacts in `testsprite_tests/` (`15` passed, `8` failed, triage pending)
- Local manual browser smoke pass succeeds for login, dashboard, cashier, products validation, history, reports, settings, and mobile/tablet drawer navigation

## E2E Coverage
- Implemented files:
  - `playwright.config.ts`
  - `e2e/auth.setup.ts`
  - `e2e/auth-redirect.spec.ts`
  - `e2e/app.spec.ts`
  - `e2e/backoffice-interactions.spec.ts`
  - `e2e/ui-edge-cases.spec.ts`
  - `e2e/support/appwrite-admin.ts`
- Current local result:
  - 16 Playwright tests passing
- Covered flows:
  - authenticated dashboard access
  - unauthenticated redirect to login
  - logout
  - product create/edit
  - cashier checkout for cash and QRIS
  - history detail rendering
  - reports filter and CSV export
  - theme and locale switch
  - modal interaction, inactive-product visibility, insufficient cash, empty-report export state
  - mobile drawer and tablet navigation rail
  - long transaction ID containment in History detail panel

## Known Caveats
- Route output in Next build still shows `●` because of locale static params, but auth and server data are already used at runtime.
- No transaction/report seed data exists yet beyond products/categories.
- TestSprite generated cases can produce low-confidence false negatives because it relies on brittle DOM paths and coarse assertions in some flows.
- `DEPLOYMENT.md` may need a small refresh so its wording reflects the current presence of `src/middleware.ts`.

## Recommended Next Step
- Run a focused smoke pass on the already-live Vercel deployment:
  - login and protected-route redirect
  - product create/edit validation and save
  - cash and QRIS checkout success
  - history and report export after a fresh sale
- Run manual UAT on real tablet devices.
- Rotate Appwrite API key and test account credentials that were previously exposed in git history.
- Add transaction/report seed data so `dashboard`, `history`, and `reports` have richer initial datasets.

## TestSprite Session Handoff
- TestSprite artifacts live under:
  - `testsprite_tests/testsprite-mcp-test-report.md`
  - `testsprite_tests/tmp/raw_report.md`
  - `testsprite_tests/tmp/test_results.json`
  - `testsprite_tests/testsprite_frontend_test_plan.json`
- Session setup notes:
  - local production server was started on port `3200`
  - TestSprite bootstrap MCP timed out twice, so the run was completed by seeding the expected `testsprite_tests/tmp/*` inputs and then invoking `generateCodeAndExecute`
  - `.testsprite/` and `testsprite_tests/` are now ignored in git to avoid committing local credentials or generated artifacts
- Highest-confidence failures from this run:
  - checkout success path surfaced a production server render error instead of success confirmation
  - product save/create path surfaced a production server render error
- Lower-confidence failures to verify against existing Playwright coverage before treating as product regressions:
  - history search input visibility
  - locale persistence after switching to English
  - export buttons default disabled-state expectation

## Latest Session Update
- Added `src/lib/server/database.ts` as shared infrastructure for:
  - paginated Appwrite reads without fixed silent caps
  - native Appwrite database transactions for multi-document writes
  - retry + fallback handling for transient server reads
- Hardened authenticated route rendering:
  - `dashboard`, `cashier`, `history`, `products`, and `reports` now render fallback state instead of crashing route output when Appwrite reads fail transiently
  - `settings` now enforces server-side auth redirect and no longer relies only on middleware cookie presence
- Reduced auth duplication cost by caching `getCurrentUser()` per request in `src/lib/server/auth.ts`
- Fixed write integrity:
  - `src/lib/server/checkout.ts` now stages checkout through Appwrite database transactions and stores `productNameSnapshot` on transaction items
  - `src/app/actions/checkout.ts` now revalidates `/products` so cashier and product management stay in sync after each sale
- Fixed historical receipt drift:
  - `src/lib/server/pos-types.ts` and `src/lib/server/sales.ts` now prefer `productNameSnapshot` for history/report rendering
- Tightened Appwrite provisioning:
  - `scripts/provision-appwrite-database.mjs` now adds `productNameSnapshot`, additional indexes, and resets collection permissions away from broad user CRUD
  - added `scripts/migrate-appwrite-data.mjs` and npm script `appwrite:migrate-db` for snapshot backfill on existing data
- Added degraded-state UI notice via `SurfaceNotice` in `src/components/ui/pos.tsx` and wired it into the major authenticated pages
- Added regression coverage:
  - `e2e/auth-redirect.spec.ts` now checks stale-session redirect on `settings`
  - `e2e/backoffice-interactions.spec.ts` now verifies receipt snapshots stay on the sold product name even after the product is renamed later
- On `2026-04-09`, product-form validation was hardened in `src/components/products/products-page.tsx` so an empty product name is handled inline on the client instead of surfacing a generic production Server Components error message.
- On `2026-04-09`, `e2e/backoffice-interactions.spec.ts` gained a dedicated regression test for the empty-name product-save path that previously aligned with the `PRODUCT_NAME_REQUIRED` TestSprite/server log.
- On `2026-04-09`, stock management was removed end-to-end:
  - `/[locale]/stock`, `src/app/actions/stock.ts`, `src/components/stock/stock-page.tsx`, and `src/lib/server/stock.ts` were deleted
  - `products` now model only `name`, `price`, `categoryId`, and `isActive`
  - checkout no longer validates or mutates inventory quantities
  - provisioning and seed scripts no longer require `stock_logs` or `stockQty`
  - Playwright edge cases now verify inactive-product behavior instead of out-of-stock flows
- On `2026-04-09`, post-removal verification regressions were fixed:
  - cashier Playwright assertions now target the current `radiogroup` payment selector
  - product writes and E2E Appwrite seed helpers now send a legacy `stockQty: 0` compatibility field only at the raw Appwrite boundary
  - `scripts/run-tests.mjs` now boots a local dev server on port `3200` and disables Playwright `webServer` for the public smoke project to avoid the nested `next start` chunk-resolution failure seen under `npm test`

## Verification This Session
- On `2026-04-15`, drawer description and favicon runtime follow-ups were verified with lint, typecheck, production build, public smoke, targeted Playwright specs, and the full Playwright suite.
- `npm run lint` succeeds
- `npm run build` succeeds
- `npx tsc --noEmit` succeeds after `.next/types` is regenerated by build
- `npm test` succeeds again (`2` public smoke tests passing) after the smoke helper switches to a dedicated local dev server
- `PLAYWRIGHT_PORT=3300 npm run e2e` succeeds on the current production build (`19` passing tests)

## Updated Known Caveats
- `transaction_items` snapshot backfill requires running:
  - `npm run appwrite:provision-db`
  - `npm run appwrite:migrate-db`
- Per operator confirmation on `2026-04-09`, provisioning has succeeded already and `npm run appwrite:migrate-db` has also completed with `Backfilled productNameSnapshot on 0 transaction items.`
- Route fallback states now prevent hard crashes, but manual UAT is still needed on slow/unstable Appwrite environments to tune copy and retry behavior
- History/reports/products no longer silently drop records because of the old fixed hard caps, but larger real datasets should still be UAT-checked for perceived performance
- Provisioning script now uses shortened Appwrite index key `tx_items_tx_product_key` because the previous composite index key exceeded Appwrite's 36-char limit
- Playwright auth setup now accepts either real dashboard metrics or the dashboard fallback notice after login, because route-level read fallback is now a valid success path during transient Appwrite outages
- During the TestSprite production run, server logs showed `UNAUTHENTICATED` on some route renders and `PRODUCT_NAME_REQUIRED` on one product-save path; the product-name path is now covered by a dedicated regression test, while stale-session behavior should still be monitored on the live deployment
