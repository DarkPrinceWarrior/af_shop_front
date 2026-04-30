import { useShop } from '../state/useShop';
import { LANGUAGE_LABELS } from '../i18n/dict';
import type { CurrencyCode, LanguageCode } from '../api/types';

interface TopBarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function TopBar({ cartCount, onOpenCart }: TopBarProps) {
  const { language, currency, bootstrap, setLanguage, setCurrency, t } = useShop();

  const languages: LanguageCode[] = bootstrap?.languages ?? ['en', 'ps', 'zh-CN'];
  const currencies: CurrencyCode[] = bootstrap?.currencies ?? ['AFN', 'CNY', 'USD'];

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <div className="brand">{t('app.title')}</div>
        <div className="topbar-spacer" />
        <div className="topbar-controls">
          <select
            className="select-pill"
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
            className="select-pill"
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
            className="cart-button"
            onClick={onOpenCart}
            aria-label={t('topbar.cart')}
          >
            <span aria-hidden="true">🛒</span>
            <span>{t('topbar.cart')}</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
