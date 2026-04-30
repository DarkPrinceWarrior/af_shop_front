import type { CurrencyCode, LanguageCode } from '../api/types';

const LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-US',
  ps: 'ps-AF',
  'zh-CN': 'zh-CN',
};

export function formatPrice(
  amount: string | number,
  currency: CurrencyCode,
  language: LanguageCode,
): string {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return String(amount);
  const locale = LOCALE_MAP[language] ?? 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${currency}`;
  }
}
