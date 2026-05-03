import { Link } from 'react-router';
import { Receipt, ShoppingCart } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { useAuth } from '@/state/useAuth';
import { LANGUAGE_LABELS } from '@/i18n/dict';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CurrencyCode, LanguageCode } from '@/api/types';

interface TopBarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export function TopBar({ cartCount, onOpenCart }: TopBarProps) {
  const { language, currency, bootstrap, setLanguage, setCurrency, t } = useShop();
  const { isAuthenticated } = useAuth();

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
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as LanguageCode)}
          >
            <SelectTrigger aria-label={t('topbar.language')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lng) => (
                <SelectItem key={lng} value={lng}>
                  {LANGUAGE_LABELS[lng]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as CurrencyCode)}
          >
            <SelectTrigger aria-label={t('topbar.currency')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((cur) => (
                <SelectItem key={cur} value={cur}>
                  {cur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAuthenticated && (
            <Link
              to="/orders/me"
              aria-label={t('auth.myOrders')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--button-neutral-bg)] backdrop-blur-xl px-3.5 py-2 text-sm font-medium hover:bg-[var(--neutral-200)] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Receipt aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">{t('auth.myOrders')}</span>
            </Link>
          )}
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
