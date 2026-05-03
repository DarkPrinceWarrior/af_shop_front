# Storefront Roadmap

Единый источник правды по статусу клиентского фронта Shop Meraj.
Шаги в порядке приоритета. Обновляется по мере выполнения.

---

## Текущий статус

| # | Этап | Статус | Где живёт |
|---|---|---|---|
| 0 | MVP storefront (Vite + React + TS, i18n, корзина, checkout, Docker) | ✅ done | `af_shop_front`, коммит `1c0c44b` |
| 0.5 | Phase 0.5: Tailwind 4 + shadcn + Router 7 + Vitest + lucide + alias + folder restructure | ✅ done | `af_shop_front`, коммиты `a97936f..c074753` |
| 1 | Единый Docker Compose в корне `shop_meraj/` | ✅ done | `af_shop`, коммит `9e41178` |
| 2 | Визуальная проверка end‑to‑end | ✅ done | покрыто Playwright‑прогоном из №5 (`e2e/checkout.spec.ts`, `e2e/rtl.spec.ts`, `e2e/stock-cap.spec.ts`) |
| 3 | Telegram‑уведомления при заказе | ✅ done | smoke‑order `SM-20260430194114-7EBAB0`, токены в root `.env` |
| 4 | Реальные изображения товаров и мест доставки | ✅ done | volume `shop_meraj_media_data`; 4 продукта (Unsplash/Pexels/Pixabay) + 10 camps (Picsum) |
| 5 | Тесты во фронте (Vitest + Playwright) | ✅ done | Vitest 16 passed; Playwright e2e 6 passed на chromium (после №6) |
| 6 | A11y / UX‑полировка drawer и форм | ✅ done | inv. зафиксированы в `e2e/a11y.spec.ts`; scroll‑to‑top + auto‑close в `Layout.tsx` |
| 7 | Re‑skin под Альма design system | ✅ done | `af_shop_front`, коммит `968c09d`; токены + Commissioner/Geist + chrome всех компонентов |
| 8 | Production deployment plan | ⚪ later | TBD |

---

## №2. Визуальная проверка end‑to‑end

**Цель**: убедиться, что весь путь покупателя работает в реальном браузере, и зафиксировать результат скриншотами.

**Сценарий** (один прогон):

1. `docker compose up -d` из `shop_meraj/`, дождаться `healthy` всех трёх контейнеров.
2. Открыть `http://localhost:5173`. Проверить, что первый экран — каталог, без landing.
3. Переключение языка: `en → ps → zh-CN`. На `ps` страница должна развернуться в RTL (`<html dir="rtl">`).
4. Переключение валюты: `AFN → CNY → USD`. Цены и delivery fee должны переформатироваться через `Intl.NumberFormat`.
5. Поиск по `oil` / `биsk` / `洗`. Сетка фильтруется клиентски.
6. Фильтр по категории. Кнопка `All categories` сбрасывает фильтр.
7. Корзина: добавить товар, увеличить количество до stock + 1 — кнопка `+` должна стать disabled. Удалить позицию.
8. Checkout: имя, телефон, Telegram, комментарий, выбор delivery card. `/orders/quote` должен дозапрашиваться при каждом изменении.
9. Submit заказа → success view с `order_number` и итоговой суммой.
10. Проверить, что новый заказ появился в Postgres (или в `/api/v1/admin/orders` при доступном токене).

**Инструменты**: Playwright MCP. Скриншоты — на каждом ключевом шаге, с явными именами `01_catalog_en.png`, `02_catalog_ps_rtl.png`, и т.д.

**Артефакты**: скриншоты складываются в `front/docs/screenshots/`. Коммитятся (по правилу «commit screenshots instead of full reports»).

**Verify**:
- HTTP 200 на `:5173` и `:8000/api/v1/utils/health-check/`.
- Console при загрузке без `error` и без CORS‑warning.
- В success view приходит непустой `order_number` формата `SM-YYYYMMDDHHMMSS-XXXXXX`.

---

## №3. Telegram‑уведомления

**Цель**: при создании заказа владельцу прилетает сообщение в Telegram.

**Шаги**:

1. Создать бота через `@BotFather`, получить `TELEGRAM_BOT_TOKEN`.
2. Узнать `TELEGRAM_OWNER_CHAT_ID` (написать боту, потом дёрнуть `getUpdates`).
3. В `shop_meraj/.env` положить:
   ```env
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_OWNER_CHAT_ID=...
   ```
4. `docker compose up -d` (rebuild не нужен, env применится при рестарте backend).
5. Оформить тестовый заказ с фронта.

**Verify**:
- Backend log: `INFO: Telegram notification sent for order SM-...`.
- В Telegram у владельца появилось сообщение с номером, суммой и составом заказа.
- При **отсутствии** токенов backend всё равно создаёт заказ корректно (тихий режим).

---

## №4. Реальные изображения

**Цель**: убрать placeholder’ы для основных товаров.

**Подварианты**:

- **Локально**: положить файлы в `back/media/products/` и `back/media/delivery-places/`. Volume `media_data` уже примонтирован в backend, и nginx/FastAPI отдаёт их по `/media/...`. Resolve URL уже сделан в `front/src/api/client.ts:resolveMediaUrl`.
- **Через admin API**: `POST /api/v1/admin/media/images` (требует Bearer‑токен), потом проставить `image_path` в `Product`/`DeliveryPlace`.

**Verify**:
- В DevTools → Network: запросы к `/media/products/*.jpg` возвращают 200 + `image/jpeg`.
- В UI placeholder `No image` пропадает на затронутых карточках.

---

## №5. Тесты во фронте

**Цель**: минимальная страховка для критичной логики.

### Vitest + React Testing Library

Юнит‑покрытие:

1. `src/utils/format.ts:formatPrice` — три валюты × три языка, edge‑case `NaN`.
2. `src/state/store.tsx` — `addToCart`, `setQuantity` против stock cap (через `renderHook`).
3. `src/api/client.ts` — `extractErrorMessage` на трёх формах FastAPI‑ошибки (`detail: string`, `detail: [{msg}]`, plain text), `ApiError.status` пробрасывается.
4. `src/i18n/dict.ts:translate` — `{var}`-интерполяция, fallback на `en`.

Команды:
```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm run test          # watch
npm run test:run      # CI
```

### Playwright E2E ✅

Файлы: `front/e2e/*.spec.ts`. Конфиг: `front/playwright.config.ts`
(`baseURL=http://localhost:5173`, проект `chromium`, последовательный запуск).
Стек должен быть запущен через `docker compose up -d` из `shop_meraj/` —
конфиг не поднимает свой dev‑сервер.

Сценарии:

1. `e2e/checkout.spec.ts` — Catalog → cart → checkout → success (en/AFN), создаёт реальный заказ в Postgres.
2. `e2e/stock-cap.spec.ts` — добавляем первый товар в корзину, кликаем `+` до `stock_quantity`, проверяем что кнопка disabled.
3. `e2e/rtl.spec.ts` — переключение языка на `ps` ставит `html[dir="rtl"]` и `lang="ps"`.

Команды:
```bash
npm run test:e2e        # === npx playwright test
npx playwright show-report
```

**Verify**:
- `npm run test:run` — все юниты зелёные (16/16).
- `npm run test:e2e` — три сценария зелёные на Chromium.
- Pre‑commit gate: `lint → typecheck → build → test:run` (e2e — отдельно, требует поднятого стека).

---

## №6. A11y / UX‑полировка ✅

**Цель**: убрать раздражающие шероховатости в drawer и форме.

Что фактически сделано:

1. **Focus trap** — приходит из Radix `Dialog.Content` (FocusScope) под `Sheet`.
   Tab крутится внутри drawer; Escape закрывает.
2. **Body scroll lock** — Radix `Dialog` через `react-remove-scroll`
   ставит `data-scroll-locked="1"` на `<body>` и `overflow:hidden`.
3. **Автозакрытие drawer + scroll‑to‑top** на смену маршрута — `Layout.tsx`
   слушает `useLocation().pathname` и делает `window.scrollTo` + `setCartOpen(false)`.
4. **`aria-live="polite"`** уже стоит на `Alert` в `Checkout.tsx` (и для quote, и для submit‑ошибок).
5. **Защита от повторного submit Enter‑ом** — `canSubmit` falsy пока `submitting=true`,
   плюс при успехе форма unmount‑ится при `navigate(...success)`.
6. **`focus-visible`** на `DeliveryPlaceCard` уже стоит (`focus-visible:ring-2 focus-visible:ring-ring`).

**Verify**:
- `e2e/a11y.spec.ts` (3 кейса): Escape закрывает drawer, Tab не сбегает наружу, body lock
  ставится/снимается синхронно с открытием.
- `npx playwright test` — 6/6 зелёных.

---

## №7. Re‑skin под Альма design system ✅

**Цель**: привести storefront к визуальному языку sister‑проекта `alma_servie`
(дашборд "Аномалии Альма") — общая система токенов, шрифтов и chrome для
всех продуктов DS Mind Lab.

**Источник**: Figma `rm2fZdmK0tuVHkocA3Fdfv` node `92:889` (главный экран Альма).

**Что сделано** (commit `968c09d`):

1. **Токены** — `src/styles/globals.css` переписан:
   - Нейтральная палитра `#f9f9f9 / #f3f3f3 / #e5e5e5 / #c1c1c1 / #797979 / #424247 / #222226`.
   - Primary `#4b4ce6` (фиолетово‑синий из Альма) + `--primary-soft` для backgrounds.
   - Семантика: `destructive #c43232` + `--destructive-soft`; `warning #d2a232` + `--warning-soft`.
   - Радиусы: `sm 8px / md 12px / lg 16px / xl 32px / full pill`.
   - Frosted chrome: `--card-tint` и `--button-neutral-bg` для backdrop‑blur поверхностей.
2. **Шрифты** — Commissioner (display) + Geist (body) через Google Fonts
   (`<link>` в `index.html`, токены `--font-display` / `--font-sans` в `@theme inline`).
3. **shadcn primitives** — `Button` (rounded‑lg, font‑medium, secondary frosted),
   `Input` / `Textarea` (rounded‑sm filled grey, focus → bg‑card).
4. **Feature‑компоненты**:
   - `TopBar` — pill controls (`rounded-full`, frosted), display title.
   - `ProductCard` — rounded‑xl, pill stock badge с tone‑aware фоном, rounded‑full quantity stepper.
   - `CategoryFilter` — soft pill для активного фильтра на mobile, primary‑soft на desktop.
   - `SearchBar` — заменён inline SVG на `lucide` `Search`.
   - `CartDrawer` — frosted line tile, pill checkout buttons.
   - `DeliveryPlaceCard` — primary‑soft halo для selected.
   - `Checkout` sections + `Alert` — rounded‑xl, semantic soft backgrounds.
   - `OrderSuccess` — rounded‑2xl, primary‑soft icon halo, display total.
5. **Иконки** — lucide остаётся единственным источником, без новых пакетов.

**Verify**:
- Pre‑commit gate: `lint → typecheck → build → test:run` — clean.
- `npm run test:e2e` — 6/6 на chromium.
- Скриншот: `front/docs/screenshots/01_catalog_redesign.png`.

**Заметка деплоя**: docker registry HEAD‑запросы на момент коммита падали,
поэтому live‑бандл вкатан через `docker cp dist/* shop-meraj-front:/usr/share/nginx/html/`.
При следующем `docker compose up --build -d frontend` (когда сеть пустит)
это станет частью образа.

---

## Что отложено / out of scope MVP

- SSR / SEO — сейчас полный SPA, индексация Google не критична для логистики.
- Аккаунты покупателей, history заказов — backend заказ создаёт без аккаунта by design.
- Платёжный шлюз — оплата по факту доставки.
- Push‑уведомления покупателю (Telegram‑бот покупателя).

---

## Конвенции работы по этому документу

- Один PR / коммит на каждый закрытый этап (`#2`, `#3`, …).
- Перед коммитом: `npm run lint && npm run build` (по стандарту проекта).
- Коммит‑сообщения: imperative, привязка к номеру этапа, например `Add Playwright e2e checkout smoke (#5)`.
- Скриншоты — в `front/docs/screenshots/`, имена с префиксом этапа: `02_*`, `04_*`.
