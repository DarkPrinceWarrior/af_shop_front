import { createContext } from 'react';
import type {
  CatalogBootstrap,
  CatalogProduct,
  CurrencyCode,
  LanguageCode,
} from '../api/types';
import type { TranslationKey } from '../i18n/dict';

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface ShopState {
  language: LanguageCode;
  currency: CurrencyCode;
  bootstrap: CatalogBootstrap | null;
  loading: boolean;
  error: string | null;
  cart: CartLine[];
  productMap: Map<string, CatalogProduct>;
  setLanguage: (language: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  reload: () => void;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

export const ShopContext = createContext<ShopState | null>(null);
