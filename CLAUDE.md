# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`shop-meraj-front` — Vite 6 + React 19 + TypeScript 5.6 customer storefront SPA
for the Shop Meraj FastAPI backend in `../back`. The first screen is always the
catalog (no landing page). Uses npm (not pnpm).

The backend API contract for this front is documented in `../back/docs/api_frontend.md`.

## Commands

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173 (HMR)
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production bundle on :5173
npm run lint         # eslint --max-warnings 0  (treats warnings as errors)
npm run typecheck    # tsc -b --noEmit
npm run test         # vitest (watch)
npm run test:run     # vitest run (CI / pre-commit)
npm run test:e2e     # playwright test (requires docker stack on :5173)

# Docker (multi-stage: node build → nginx runtime)
# Prefer the unified compose at ../shop_meraj/compose.yaml.
docker compose up --build -d        # standalone front-only via ./compose.yaml
docker compose down

# Build with a non-default backend URL (baked at build time)
VITE_API_BASE_URL=http://192.168.1.10:8000 docker compose up --build -d
```

Pre-commit gate: `lint → typecheck → build → test:run`. All four must be clean
before `git commit`.

## Architecture

- **React Router 7** drives the views. Routes in `src/main.tsx`:
  - `/` → `pages/CatalogPage`
  - `/checkout` → `pages/CheckoutPage`
  - `/orders/:orderNumber/success` → `pages/SuccessPage`
  Layout (`src/Layout.tsx`) renders `TopBar` + `<Outlet>` + `CartDrawer` and is
  the parent for all routes. Order data is passed across the success redirect
  via `navigate(..., { state: { order } })`; `SuccessPage` falls back to a
  minimal view when state is lost (e.g. on refresh).
- **`ShopProvider`** in `src/state/store.tsx` is the only state seam: language,
  currency, bootstrap data, and cart. Preferences persist in `localStorage`; the
  provider also flips `<html dir>` for Pashto. Consumers use `useShop` from
  `src/state/useShop.ts` — the hook lives in its own file so React Refresh
  doesn't break (`react-refresh/only-export-components`).
- **`ShopState` and `CartLine` types live in `src/state/context.ts`** alongside
  the `createContext` call, separate from the provider component.
- **Bootstrap-once data flow**: `GET /api/v1/catalog/bootstrap?language=&currency=`
  returns categories + products + delivery places in one shot. It is re-fetched
  only when language/currency change or `reload()` is called. Search and
  category filtering happen client-side over `bootstrap.products`.
- **Cart invariant**: cart lines are auto-clamped to the current `stock_quantity`
  every time bootstrap data refreshes, and `addToCart` / `setQuantity` refuse
  values above stock. UI components rely on this — they don't re-validate. This
  is verified by `src/state/store.test.tsx`.
- **API layer** (`src/api/client.ts`): thin `fetch` wrapper that throws
  `ApiError(message, status, detail)`. `extractErrorMessage` knows the FastAPI
  shape (`detail` is a string or `[{ msg }]`). `resolveMediaUrl` rewrites
  backend-relative paths (e.g. `/media/products/...`) to absolute URLs against
  `VITE_API_BASE_URL` so images load straight from the FastAPI media mount.
- **Quote/order flow** (`src/components/features/checkout/Checkout.tsx`): every
  relevant change refires `POST /orders/quote`; the latest request wins via a
  sequence-counter ref (`requestSeq`). Submit calls `POST /orders` and surfaces
  backend errors (404 missing item, 409 insufficient stock, etc.) inline.
- **i18n** (`src/i18n/dict.ts`): typed `TranslationKey` union →
  `Record<LanguageCode, Dict>` lookup with `{var}` interpolation. Adding a key
  requires updating the union *and* all three dictionaries (`en`, `ps`,
  `zh-CN`) — the TS build fails otherwise. RTL is driven by `RTL_LANGUAGES`.
- **Styling**: Tailwind 4 with `@theme inline` design tokens in
  `src/styles/globals.css` (oklch color space). Tokens follow the shadcn naming:
  `--color-background`, `--color-card`, `--color-primary`, `--color-muted`,
  `--color-destructive`, etc. `tw-animate-css` is loaded for Sheet/Dialog
  animations. No `tailwind.config.js` — Tailwind 4 reads tokens from CSS.

## Component layout

```
src/components/
├── ui/                  # shadcn primitives (button, input, textarea, label, sheet)
└── features/
    ├── catalog/         # ProductCard, ProductGrid, CategoryFilter, SearchBar
    ├── cart/            # CartDrawer (built on Sheet)
    ├── checkout/        # Checkout, DeliveryPlaceCard, OrderSuccess
    └── layout/          # TopBar, Image (with placeholder fallback)
```

- New shared/low-level UI → `src/components/ui/`. Generated via shadcn CLI when
  possible (`npx shadcn@latest add <component>`); otherwise hand-roll using the
  same pattern (cva variants, forwardRef, `cn()` from `@/lib/utils`).
- New feature-specific UI → `src/components/features/<feature>/`.
- The eslint config relaxes `react-refresh/only-export-components` for files
  under `src/components/ui/` because shadcn co-locates `cva` variants with
  components.

## Routing & icons

- Path alias `@/*` maps to `./src/*` (configured in `tsconfig.app.json` +
  `vite-tsconfig-paths`). Cross-folder imports use `@/...`; same-folder imports
  stay relative.
- Icons come from `lucide-react`. Tree-shaken — import only what you use.
  Examples: `ShoppingCart`, `Search`, `X`, `Plus`, `Minus`, `Loader2`,
  `ArrowLeft`, `CheckCircle2`.

## Testing

`vitest` + `@testing-library/react` + `jsdom`. Config in `vitest.config.ts`,
setup in `src/test/setup.ts` (loads `@testing-library/jest-dom/vitest`).

Existing baseline tests:
- `src/utils/format.test.ts` — currency formatting per locale.
- `src/i18n/dict.test.ts` — translate + RTL_LANGUAGES + variable interpolation.
- `src/api/client.test.ts` — `ApiError` wrapping + FastAPI detail extraction.
- `src/state/store.test.tsx` — `addToCart` / `setQuantity` stock-cap invariants.

Add new tests next to the file under test (`*.test.ts(x)`).

### Playwright E2E

`@playwright/test` runs against the live docker stack — `playwright.config.ts`
points at `http://localhost:5173` (override with `E2E_BASE_URL`) and does NOT
spin up its own dev server. Bring the stack up first via `docker compose up -d`
from `../`. Specs live in `e2e/` (excluded from Vitest via `vitest.config.ts`).

Existing specs:
- `e2e/checkout.spec.ts` — full happy path; creates a real order in Postgres.
- `e2e/stock-cap.spec.ts` — `+` button disables once the cart hits `stock_quantity`.
- `e2e/rtl.spec.ts` — switching language to `ps` flips `html[dir="rtl"]`.

## Configuration

`VITE_API_BASE_URL` (default `http://localhost:8000`) is read at build time. The
Dockerfile passes it as `ARG VITE_API_BASE_URL`, so production bundles bake the
backend URL — rebuild to retarget.

Backend CORS in `../back/compose.yaml` already allows `http://localhost:5173`.

## Conventions

- Money values arrive as strings (Decimal) from the backend. Pass them straight
  to `formatPrice(amount, currency, language)` in `src/utils/format.ts`; do not
  pre-parse them.
- Currency and language enums are duplicated by name in `src/api/types.ts` to
  match the backend `CurrencyCode` / `LanguageCode` (`'AFN' | 'CNY' | 'USD'`,
  `'en' | 'ps' | 'zh-CN'`). Keep them in sync with `../back/app/models.py` if
  the backend adds values.
- New backend endpoints: add types to `src/api/types.ts`, add the call to
  `src/api/client.ts`, then consume from a component. Errors thrown as
  `ApiError` already carry a user-readable `message`.
- Never edit the backend from this directory. Backend lives in `../back` with
  its own git repo and `AGENTS.md`.
- Roadmap of pending work and conventions is tracked in `docs/roadmap.md`.

## Validation

After meaningful changes, run in this order:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:run`
5. Manual smoke with the backend running: load `:5173`, switch language to
   `ps` to confirm RTL, add a product, place an order, verify the success view
   shows an `order_number`.

When changing the Docker image, rebuild explicitly: `docker compose up --build -d frontend`
from the unified compose at `../`. The Vite bundle bakes `VITE_API_BASE_URL`,
so any backend URL change requires a rebuild.
