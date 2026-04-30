# Shop Meraj — Customer Storefront

Vite + React + TypeScript single-page customer storefront for the Shop Meraj
backend (FastAPI in `../back`). The first screen is the catalog, not a
landing page.

## Features

- Catalog loaded from `GET /api/v1/catalog/bootstrap`.
- Languages: English, پښتو (RTL), 简体中文.
- Currencies: AFN, CNY, USD.
- Search by product name / description / SKU.
- Filter by category.
- Cart with per-product stock cap.
- Checkout without account: name, phone, Telegram, comment.
- Delivery address picked from image cards.
- Live `POST /orders/quote` for subtotal + delivery + total.
- `POST /orders` returns the order number; backend then sends Telegram.

## Configuration

Copy and adjust the env file:

```bash
cp .env.example .env
```

```text
VITE_API_BASE_URL=http://localhost:8000
```

Vite reads `VITE_API_BASE_URL` at build time. The same variable is passed as a
build arg to Docker, so the production bundle points at the right backend.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview  # serves the production bundle
```

The backend must be running and reachable at `VITE_API_BASE_URL`. Start it from
`../back`:

```bash
cd ../back && docker compose up -d
```

The backend `compose.yaml` already allows `http://localhost:5173` in CORS.

## Docker

Build and run the storefront on its own:

```bash
docker compose up --build -d
# open http://localhost:5173
```

To target a different backend host:

```bash
VITE_API_BASE_URL=http://192.168.1.10:8000 docker compose up --build -d
```

To stop:

```bash
docker compose down
```

## Project layout

```text
front/
  Dockerfile
  compose.yaml
  nginx.conf
  index.html
  vite.config.ts
  src/
    main.tsx
    App.tsx
    api/        # fetch client + types
    components/ # TopBar, ProductGrid, CartDrawer, Checkout, ...
    i18n/       # translation dictionaries (en, ps, zh-CN)
    state/      # ShopProvider context (bootstrap, cart, prefs)
    styles/     # globals.css
    utils/      # currency formatter
```
