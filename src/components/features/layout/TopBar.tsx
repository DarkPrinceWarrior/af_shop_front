import { ShoppingCart } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { LANGUAGE_LABELS } from '@/i18n/dict';
import type { CurrencyCode, LanguageCode } from '@/api/types';

interface TopBarProps {
  cartCount: number;
  onOpenCart: () => void;
}

const SELECT_PILL =
  'appearance-none rounded-full bg-[var(--button-neutral-bg)] backdrop-blur-xl py-2 pe-7 ps-3 text-sm font-medium cursor-pointer ' +
  'hover:bg-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-ring';

export function TopBar({ cartCount, onOpenCart }: TopBarProps) {
  const { language, currency, bootstrap, setLanguage, setCurrency, t } = useShop();

  const languages: LanguageCode[] = bootstrap?.languages ?? ['en', 'ps', 'zh-CN'];
  const currencies: CurrencyCode[] = bootstrap?.currencies ?? ['AFN', 'CNY', 'USD'];

  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl"
      role="banner"
    >
      <div className="mx-auto flex min-h-16 max-w-[1200px] items-center gap-3 px-5 py-3">
        <div
          className="font-display text-xl font-medium tracking-tighter whitespace-nowrap"
          style={{ letterSpacing: '-0.025em' }}
        >
          {t('app.title')}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <select
            className={SELECT_PILL}
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            aria-label={t('topbar.language')}
          >
            {languages.map((lng) => (
              <option key={lng} value={lng}>
                {LANGUAGE_LABELS[lng]}
              </option>
            ))}
          </select>
          <select
            className={SELECT_PILL}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            aria-label={t('topbar.currency')}
          >
            {currencies.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={t('topbar.cart')}
            className="relative inline-flex items-center gap-1.5 rounded-full bg-[var(--button-neutral-bg)] backdrop-blur-xl px-3.5 py-2 text-sm font-medium hover:bg-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <ShoppingCart aria-hidden="true" className="size-4" />
            <span>{t('topbar.cart')}</span>
            {cartCount > 0 && (
              <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
