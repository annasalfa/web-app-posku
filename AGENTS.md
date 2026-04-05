# AGENTS.md - Developer Guidelines for POSKU Web App

## Project Overview

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Appwrite (cloud)
- **i18n**: next-intl (Indonesian/English)
- **Package Manager**: npm

---

## Commands

```bash
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server
npm run lint                   # Run ESLint (Next.js core-web-vitals)
npx tsc --noEmit               # Typecheck
npm test                       # Public smoke test (no auth required)
npm run e2e                    # Full Playwright suite (requires env + test account)
npm run appwrite:provision-db # Provision database collections
npm run appwrite:seed-db      # Seed initial data

# Single Playwright spec
npm run e2e -- e2e/auth-redirect.spec.ts
```

---

## Code Style

### Imports (use `@/` prefix)
```typescript
import 'server-only';
import {useState} from 'react';
import {createAdminClient} from '@/lib/server/appwrite';
import {requireCurrentUser} from '@/lib/server/auth';
import type {CheckoutInput} from '@/lib/server/pos-types';
import {SubmitButton} from './submit-button';
```

### Formatting
- 2 spaces indentation, semicolons, trailing commas
- Single quotes for strings, double for JSX
- Run `npm run lint` before committing

### TypeScript
- Explicit types, never use `any`
- Use `import type {TypeName}` for types only
- Use optional chaining `?.` and nullish coalescing `??`

### Naming
- Files: kebab-case (`checkout-button.tsx`)
- Components: PascalCase (`CheckoutButton`)
- Functions: camelCase (`submitCheckout`)
- Types: PascalCase with `Input`/`Output` suffix
- Constants: UPPER_SNAKE_CASE
- Booleans: prefix with `is`, `has`, `should`, `can`

### Server vs Client
- Server actions: `'use server';` at top
- Client components: `'use client';` for hooks
- Server-only files: `import 'server-only';`

### Error Handling
- Use try/catch with descriptive messages
- Return errors as structured objects in server actions
- Log errors server-side, never expose sensitive info

```typescript
export async function submitOrder(input: OrderInput) {
  try { /* ... */ } 
  catch (error) {
    console.error('Failed to submit order:', error);
    return {error: 'Failed to process order. Please try again.'};
  }
}
```

### React Patterns
- Functional components with explicit Props interfaces
- Use `cn()` utility from `@/lib/utils/cn` for conditional classes

---

## Architecture

```
src/
├── app/              # Next.js App Router pages & actions
│   └── actions/      # Server actions
├── components/       # React components
├── lib/
│   ├── server/       # Server-only (Appwrite, auth, business logic)
│   ├── appwrite/    # Client-side Appwrite
│   ├── constants/   # Static data
│   └── utils/        # Shared (cn, etc.)
└── i18n/             # Internationalization
```

---

## Notes for Agents

- Run `npm run lint` before committing
- Run `npx tsc --noEmit` for TypeScript verification
- Run `npm test` for the public smoke path
- Run `npm run e2e` only when Appwrite env vars, seeded data, and `USER_EMAIL` / `USER_PASS` are available locally
- Keep server/client code separate
- Use TypeScript - no `any`
- Use `.env.example` as the source of truth for required local env vars
- Never commit `.env`, `opencode.json`, API keys, or test credentials
- Test interactive UI changes with `npm run dev`
- Run `npm run appwrite:provision-db` after schema changes

---

## Test Account

Set locally and do not commit:

```bash
USER_EMAIL="<set-in-local-env>"
USER_PASS="<set-in-local-env>"
```
