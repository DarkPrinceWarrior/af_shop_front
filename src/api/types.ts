export type LanguageCode = 'en' | 'ps' | 'zh-CN';
export type CurrencyCode = 'AFN' | 'CNY' | 'USD';

export interface CatalogCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface CatalogProductImage {
  id: string;
  image_path: string;
  alt: string | null;
  sort_order: number;
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: string;
  currency: CurrencyCode;
  stock_quantity: number;
  is_active: boolean;
  images: CatalogProductImage[];
}

export interface CatalogDeliveryPlace {
  id: string;
  name: string;
  description: string | null;
  image_path: string;
  delivery_fee: string;
  currency: CurrencyCode;
  sort_order: number;
  is_active: boolean;
}

export interface CatalogBootstrap {
  language: LanguageCode;
  currency: CurrencyCode;
  languages: LanguageCode[];
  currencies: CurrencyCode[];
  categories: CatalogCategory[];
  products: CatalogProduct[];
  delivery_places: CatalogDeliveryPlace[];
}

export interface OrderItemPayload {
  product_id: string;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_telegram?: string | null;
  customer_comment?: string | null;
  language: LanguageCode;
  currency: CurrencyCode;
  delivery_place_id: string;
  items: OrderItemPayload[];
}

export interface OrderQuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderQuote {
  currency: CurrencyCode;
  subtotal: string;
  delivery_fee: string;
  total: string;
  items: OrderQuoteItem[];
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_telegram: string | null;
  customer_comment: string | null;
  language: LanguageCode;
  currency: CurrencyCode;
  delivery_place_id: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  user_id: string | null;
  created_at: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface OrdersList {
  data: OrderResponse[];
  count: number;
}
