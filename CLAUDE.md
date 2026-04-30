# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`shop-meraj-front` — Vite 6 + React 19 + TypeScript 5.6 customer storefront SPA
for the Shop Meraj FastAPI backend in `../back`. MVP single-page experience:
catalog → cart → checkout without an account. The first screen is always the
catalog (no landing page). Uses npm (not pnpm).

The backend API contract for this front is documented in `../back/docs/api_frontend.md`.

## Commands

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve the production bundle on :5173
npm run lint         # eslint --max-warnings 0  (treats warnings as errors)
npm run typecheck    # tsc -b --noEmit

# Docker (multi-stage: node build → nginx runtime)
docker compose up --build -d        # http://localhost:5173
docker compose down

# Build with a non-default backend URL (baked at build time)
VITE_API_BASE_URL=http://192.168.1.10:8000 docker compose up --build -d
```

There are no unit or e2e tests in the MVP. If adding them later, prefer Vitest +
React Testing Library; do not pull in Storybook unless asked.

## Architecture

- **Single SPA, three views** (`shop` | `checkout` | `success`) switched by local
  state in `src/App.tsx`. No router by design — keeps the MVP surface small.
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
  values above stock. UI components rely on this — they don't re-validate.
- **API layer** (`src/api/client.ts`): thin `fetch` wrapper that throws
  `ApiError(message, status, detail)`. `extractErrorMessage` knows the FastAPI
  shape (`detail` is a string or `[{ msg }]`). `resolveMediaUrl` rewrites
  backend-relative paths (e.g. `/media/products/...`) to absolute URLs against
  `VITE_API_BASE_URL` so images load straight from the FastAPI media mount.
- **Quote/order flow** (`src/components/Checkout.tsx`): every relevant change
  refires `POST /orders/quote`; the latest request wins via a sequence-counter
  ref (`requestSeq`). Submit calls `POST /orders` and surfaces backend errors
  (404 missing item, 409 insufficient stock, etc.) inline.
- **i18n** (`src/i18n/dict.ts`): typed `TranslationKey` union →
  `Record<LanguageCode, Dict>` lookup with `{var}` interpolation. Adding a key
  requires updating the union *and* all three dictionaries (`en`, `ps`,
  `zh-CN`) — the TS build fails otherwise. RTL is driven by `RTL_LANGUAGES`.
- **Styling**: hand-written CSS in `src/styles/globals.css`. Mobile-first, CSS
  variables for design tokens, `[dir='rtl']` overrides where layout is
  asymmetric. No Tailwind, no UI framework — keep it that way unless explicitly
  asked.

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
- Storefront components are flat under `src/components/`; no feature folders for
  now — the surface is small and grouping would just add noise.
- New backend endpoints: add types to `src/api/types.ts`, add the call to
  `src/api/client.ts`, then consume from a component. Errors thrown as
  `ApiError` already carry a user-readable `message`.
- Never edit the backend from this directory. Backend lives in `../back` with
  its own git repo and `AGENTS.md`.

## Validation

After meaningful changes, run in this order:

1. `npm run lint`
2. `npm run build` (covers typecheck via `tsc -b`)
3. Manual smoke with the backend running: load `:5173`, switch language to
   `ps` to confirm RTL, add a product, place an order, verify the success view
   shows an `order_number`.
