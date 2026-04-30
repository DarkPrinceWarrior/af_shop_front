import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ShopProvider } from './store';
import { useShop } from './useShop';
import type { CatalogBootstrap } from '@/api/types';

function buildBootstrap(stock: number): CatalogBootstrap {
  return {
    language: 'en',
    currency: 'AFN',
    languages: ['en', 'ps', 'zh-CN'],
    currencies: ['AFN', 'CNY', 'USD'],
    categories: [
      { id: 'cat-1', name: 'Groceries', sort_order: 1, is_active: true },
    ],
    products: [
      {
        id: 'prod-1',
        category_id: 'cat-1',
        sku: 'OIL-1L',
        name: 'Oil',
        description: null,
        price: '120.00',
        currency: 'AFN',
        stock_quantity: stock,
        is_active: true,
        images: [],
      },
    ],
    delivery_places: [],
  };
}

describe('ShopProvider cart logic', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(buildBootstrap(3)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('clamps addToCart to stock_quantity', async () => {
    const { result } = renderHook(() => useShop(), { wrapper: ShopProvider });
    await waitFor(() => expect(result.current.bootstrap).not.toBeNull());

    act(() => {
      result.current.addToCart('prod-1', 10);
    });
    expect(result.current.cart).toEqual([{ productId: 'prod-1', quantity: 3 }]);
  });

  it('refuses setQuantity above stock and removes line at 0', async () => {
    const { result } = renderHook(() => useShop(), { wrapper: ShopProvider });
    await waitFor(() => expect(result.current.bootstrap).not.toBeNull());

    act(() => {
      result.current.addToCart('prod-1', 1);
    });
    expect(result.current.cart[0].quantity).toBe(1);

    act(() => {
      result.current.setQuantity('prod-1', 99);
    });
    expect(result.current.cart[0].quantity).toBe(3);

    act(() => {
      result.current.setQuantity('prod-1', 0);
    });
    expect(result.current.cart).toHaveLength(0);
  });

  it('ignores addToCart when stock is zero', async () => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(buildBootstrap(0)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const { result } = renderHook(() => useShop(), { wrapper: ShopProvider });
    await waitFor(() => expect(result.current.bootstrap).not.toBeNull());

    act(() => {
      result.current.addToCart('prod-1', 1);
    });
    expect(result.current.cart).toEqual([]);
  });
});
