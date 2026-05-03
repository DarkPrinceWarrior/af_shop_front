import type {
  AuthToken,
  AuthUser,
  CatalogBootstrap,
  CurrencyCode,
  LanguageCode,
  OrderPayload,
  OrderQuote,
  OrderResponse,
  OrdersList,
  SignupPayload,
} from './types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').trim();
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');
const API_PREFIX = '/api/v1';

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const url = `${API_BASE_URL}${API_PREFIX}${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
      err,
    );
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text().catch(() => null);
    }
    const message = extractErrorMessage(detail) ?? response.statusText;
    throw new ApiError(message, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function extractErrorMessage(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object' && detail !== null) {
    const obj = detail as Record<string, unknown>;
    const d = obj.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length > 0) {
      const first = d[0] as Record<string, unknown>;
      if (typeof first?.msg === 'string') return first.msg;
    }
  }
  return null;
}

export function fetchBootstrap(
  language: LanguageCode,
  currency: CurrencyCode,
  signal?: AbortSignal,
): Promise<CatalogBootstrap> {
  const params = new URLSearchParams({ language, currency });
  return request<CatalogBootstrap>(`/catalog/bootstrap?${params.toString()}`, {
    signal,
  });
}

export function quoteOrder(
  payload: OrderPayload,
  token?: string | null,
): Promise<OrderQuote> {
  return request<OrderQuote>('/catalog/orders/quote', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function createOrder(
  payload: OrderPayload,
  token?: string | null,
): Promise<OrderResponse> {
  return request<OrderResponse>('/catalog/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function login(email: string, password: string): Promise<AuthToken> {
  const body = new URLSearchParams({ username: email, password });
  return request<AuthToken>('/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

export function signup(payload: SignupPayload): Promise<AuthUser> {
  return request<AuthUser>('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(token: string): Promise<AuthUser> {
  return request<AuthUser>('/users/me', { token });
}

export function fetchMyOrders(token: string): Promise<OrdersList> {
  return request<OrdersList>('/catalog/orders/me', { token });
}

export function fetchMyOrder(
  token: string,
  orderId: string,
): Promise<OrderResponse> {
  return request<OrderResponse>(`/catalog/orders/me/${orderId}`, { token });
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}
