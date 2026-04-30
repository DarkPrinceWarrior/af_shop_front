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
| 2 | Визуальная проверка end‑to‑end | 🟡 pending | через браузер вручную или Playwright |
| 3 | Telegram‑уведомления при заказе | ✅ done | smoke‑order `SM-20260430194114-7EBAB0`, токены в root `.env` |
| 4 | Реальные изображения товаров и мест доставки | ✅ done | volume `shop_meraj_media_data`; 4 продукта (Unsplash/Pexels/Pixabay) + 10 camps (Picsum) |
| 5 | Тесты во фронте (Vitest + Playwright) | 🟢 partial | Vitest baseline есть; Playwright e2e — нет |
| 6 | A11y / UX‑полировка drawer и форм | 🟡 pending | `front/src/components/` |
| 7 | Production deployment plan | ⚪ later | TBD |

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

### Playwright E2E

Сценарии:

1. Catalog → cart → delivery → checkout → success (en/AFN).
2. Stock cap: `+` блокируется, корзина не превышает `stock_quantity`.
3. RTL: `html[dir="rtl"]` устанавливается на `ps`.

Команды:
```bash
npm i -D @playwright/test
npx playwright install chromium
npx playwright test
```

**Verify**:
- `npm run test:run` — все юниты зелёные.
- `npx playwright test` — три сценария зелёные на Chromium.
- В CI gate (если будет): `lint → typecheck → test:run → build`.

---

## №6. A11y / UX‑полировка

**Цель**: убрать раздражающие шероховатости в drawer и форме.

Список:

1. Focus trap в `CartDrawer` (Tab не должен «убегать» на фон).
2. `body { overflow: hidden }` при открытом drawer.
3. Автозакрытие drawer и сброс прокрутки при переходе `view='checkout'` / `view='success'`.
4. `aria-live="polite"` на блок ошибок quote/checkout.
5. Submit‑кнопка должна автоматически терять фокус после успеха, чтобы Enter не отправлял повторно.
6. Hover/focus‑state у `delivery-card` — сейчас только `:hover`, добавить `:focus-visible`.

**Verify**:
- Tab‑навигация в drawer крутится по элементам внутри панели.
- Скролл основного документа заблокирован при открытом drawer.
- Lighthouse (mobile): a11y ≥ 95.

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
