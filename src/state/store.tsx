import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  CatalogBootstrap,
  CatalogProduct,
  CurrencyCode,
  LanguageCode,
} from '@/api/types';
import { fetchBootstrap, ApiError } from '@/api/client';
import { RTL_LANGUAGES, translate } from '@/i18n/dict';
import { ShopContext, type CartLine, type ShopState } from './context';

const STORAGE_KEY = 'shop-meraj.preferences';

interface Preferences {
  language: LanguageCode;
  currency: CurrencyCode;
}

const DEFAULTS: Preferences = { language: 'en', currency: 'AFN' };

const VALID_LANGUAGES: ReadonlySet<LanguageCode> = new Set(['en', 'ps', 'zh-CN']);
const VALID_CURRENCIES: ReadonlySet<CurrencyCode> = new Set(['AFN', 'CNY', 'USD']);

function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      language:
        parsed.language && VALID_LANGUAGES.has(parsed.language)
          ? parsed.language
          : DEFAULTS.language,
      currency:
        parsed.currency && VALID_CURRENCIES.has(parsed.currency)
          ? parsed.currency
          : DEFAULTS.currency,
    };
  } catch {
    return DEFAULTS;
  }
}

function writePreferences(prefs: Preferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota errors */
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const initialPrefs = useRef(readPreferences()).current;
  const [language, setLanguageState] = useState<LanguageCode>(initialPrefs.language);
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialPrefs.currency);
  const [bootstrap, setBootstrap] = useState<CatalogBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    writePreferences({ language, currency });
  }, [language, currency]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchBootstrap(language, currency, controller.signal)
      .then((data) => {
        setBootstrap(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load catalog';
        setError(message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [language, currency, reloadKey]);

  const productMap = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    if (bootstrap) {
      for (const product of bootstrap.products) {
        map.set(product.id, product);
      }
    }
    return map;
  }, [bootstrap]);

  // Drop cart lines that no longer exist or that exceed available stock.
  useEffect(() => {
    if (!bootstrap) return;
    setCart((prev) => {
      let changed = false;
      const next: CartLine[] = [];
      for (const line of prev) {
        const product = productMap.get(line.productId);
        if (!product || !product.is_active || product.stock_quantity <= 0) {
          changed = true;
          continue;
        }
        const clamped = Math.min(line.quantity, product.stock_quantity);
        if (clamped !== line.quantity) changed = true;
        if (clamped > 0) next.push({ productId: line.productId, quantity: clamped });
      }
      return changed ? next : prev;
    });
  }, [bootstrap, productMap]);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
  }, []);
  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
  }, []);
  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      setCart((prev) => {
        const product = productMap.get(productId);
        const stock = product?.stock_quantity ?? 0;
        if (stock <= 0) return prev;
        const idx = prev.findIndex((l) => l.productId === productId);
        if (idx >= 0) {
          const nextQty = Math.min(prev[idx].quantity + quantity, stock);
          if (nextQty === prev[idx].quantity) return prev;
          const copy = prev.slice();
          copy[idx] = { ...copy[idx], quantity: nextQty };
          return copy;
        }
        const initialQty = Math.min(quantity, stock);
        if (initialQty <= 0) return prev;
        return [...prev, { productId, quantity: initialQty }];
      });
    },
    [productMap],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart((prev) => {
        const product = productMap.get(productId);
        const stock = product?.stock_quantity ?? 0;
        const clamped = Math.max(0, Math.min(quantity, stock));
        const idx = prev.findIndex((l) => l.productId === productId);
        if (idx < 0) {
          if (clamped <= 0) return prev;
          return [...prev, { productId, quantity: clamped }];
        }
        if (clamped <= 0) {
          return prev.filter((_, i) => i !== idx);
        }
        if (clamped === prev[idx].quantity) return prev;
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], quantity: clamped };
        return copy;
      });
    },
    [productMap],
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const t = useCallback<ShopState['t']>(
    (key, vars) => translate(language, key, vars),
    [language],
  );

  const value = useMemo<ShopState>(
    () => ({
      language,
      currency,
      bootstrap,
      loading,
      error,
      cart,
      productMap,
      setLanguage,
      setCurrency,
      reload,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      t,
    }),
    [
      language,
      currency,
      bootstrap,
      loading,
      error,
      cart,
      productMap,
      setLanguage,
      setCurrency,
      reload,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      t,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
