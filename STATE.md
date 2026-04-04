# STATE

## Current Status
- Frontend MVP is implemented in Next.js 15 with `next-intl`, `next-themes`, Tailwind CSS 4, and real Appwrite-backed flows.
- Auth stage 1 is complete and uses real Appwrite email/password sessions.
- Backend stage 2 is complete for `products`, `stock`, and `cashier/checkout`.
- Sales data integration is complete for `dashboard`, `history`, and `reports` using real Appwrite transaction data.
- Appwrite database schema has been provisioned and seed data has been inserted.
- Frontend UI/UX audit findings have been fixed, including accessibility/state issues, tablet navigation, and History overflow on long transaction IDs.
- Local quality gates are green: lint, typecheck, production build, and Playwright E2E.

## Workflow Stage
- Workflow reference: `PRD.md -> FrontEnd -> BackEnd -> DB Integrations -> Deployment -> Testing`
- Current stage: `Testing completed for local MVP verification`, ready to move into `Deployment`.
- Completed stages:
  - `PRD`
  - `FrontEnd`
  - `BackEnd`
  - `DB Integrations`
  - `Testing`
- In progress / next:
  - `Deployment`
- Not done yet:
  - production deployment setup/verification
  - manual UAT on deployed environment
  - optional cross-browser visual regression outside Chromium

## Auth
- Cookie name: `posku-session`
- Auth is server-side using `node-appwrite`
- Implemented files:
  - `src/lib/server/env.ts`
  - `src/lib/server/appwrite.ts`
  - `src/lib/server/session.ts`
  - `src/lib/server/auth.ts`
  - `src/app/actions/auth.ts`
- Login/logout UI already uses server actions.
- Demo `localStorage` auth has been removed.

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
  - `stock_logs`

## Seeded Data
- Categories: 5
- Products: 8
- Transactions: 0
- Transaction items: 0
- Stock logs: 0

## Stage 2 Backend
- Implemented files:
  - `src/lib/server/pos-types.ts`
  - `src/lib/server/products.ts`
  - `src/lib/server/stock.ts`
  - `src/lib/server/checkout.ts`
  - `src/lib/server/sales.ts`
  - `src/app/actions/products.ts`
  - `src/app/actions/stock.ts`
  - `src/app/actions/checkout.ts`
- Features supported:
  - list/save products
  - list stock overview
  - manual stock adjustment + stock log creation
  - checkout transaction creation
  - transaction item creation
  - stock deduction
  - stock log creation on sale
  - rollback on checkout failure
  - list transaction history with transaction items
  - compute dashboard metrics from real transactions
  - filter/export reports from real transactions

## UI Already Connected To Real Backend
- `dashboard`
  - `src/app/[locale]/page.tsx`
  - `src/components/dashboard/dashboard-page.tsx`
- `history`
  - `src/app/[locale]/history/page.tsx`
  - `src/components/history/history-page.tsx`
- `reports`
  - `src/app/[locale]/reports/page.tsx`
  - `src/components/reports/reports-page.tsx`
- `products`
  - `src/app/[locale]/products/page.tsx`
  - `src/components/products/products-page.tsx`
- `stock`
  - `src/app/[locale]/stock/page.tsx`
  - `src/components/stock/stock-page.tsx`
- `cashier`
  - `src/app/[locale]/cashier/page.tsx`
  - `src/components/cashier/cashier-page.tsx`

## UI Still Using Mock Data
- None

## Mock Data
- `src/lib/data/mock-data.ts` has been removed.
- Remaining backoffice pages no longer depend on demo transaction/dashboard data.

## Important Environment Variables
- Already in use:
  - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
  - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
  - `APPWRITE_API_KEY`
  - `APPWRITE_DATABASE_ID`
  - `APPWRITE_PRODUCTS_COLLECTION_ID`
  - `APPWRITE_CATEGORIES_COLLECTION_ID`
  - `APPWRITE_TRANSACTIONS_COLLECTION_ID`
  - `APPWRITE_TRANSACTION_ITEMS_COLLECTION_ID`
  - `APPWRITE_STOCK_LOGS_COLLECTION_ID`

## Verification Completed
- `npm run appwrite:provision-db` succeeds
- `npm run appwrite:seed-db` succeeds
- `npm run lint` succeeds
- `npx tsc --noEmit` succeeds
- `npm run build` succeeds
- `npx playwright test` succeeds

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
  - stock adjustment
  - cashier checkout for cash and QRIS
  - history detail rendering
  - reports filter and CSV export
  - theme and locale switch
  - modal interaction, out-of-stock states, insufficient cash, empty-report export state
  - mobile drawer and tablet navigation rail
  - long transaction ID containment in History detail panel

## Known Caveats
- Route output in Next build still shows `●` because of locale static params, but auth and server data are already used at runtime.
- No transaction/report seed data exists yet beyond products/categories.
- Transaction history item names are resolved from current product records because `transaction_items` does not yet persist a product-name snapshot.

## Recommended Next Step
- Deploy to staging/production and run manual UAT on real tablet devices.
- Add transaction/report seed data so `dashboard`, `history`, and `reports` have richer initial datasets.
- Consider extending `transaction_items` to store product name snapshots for historical accuracy.
