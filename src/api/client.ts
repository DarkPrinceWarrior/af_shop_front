import type {
  CatalogBootstrap,
  CurrencyCode,
  LanguageCode,
  OrderPayload,
  OrderQuote,
  OrderResponse,
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${path}`;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

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

export function quoteOrder(payload: OrderPayload): Promise<OrderQuote> {
  return request<OrderQuote>('/catalog/orders/quote', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  return request<OrderResponse>('/catalog/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}
