import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchBootstrap } from './client';

describe('API client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('returns the parsed payload on a 2xx response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          language: 'en',
          currency: 'AFN',
          languages: ['en'],
          currencies: ['AFN'],
          categories: [],
          products: [],
          delivery_places: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await fetchBootstrap('en', 'AFN');
    expect(result.language).toBe('en');
    expect(fetchMock).toHaveBeenCalledOnce();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/api/v1/catalog/bootstrap?language=en&currency=AFN');
  });

  it('extracts FastAPI string detail on error response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(fetchBootstrap('en', 'AFN')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'not found',
    });
  });

  it('extracts the first .msg from FastAPI validation array', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          detail: [{ msg: 'value is invalid', loc: ['body', 'language'] }],
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const err = await fetchBootstrap('en', 'AFN').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe('value is invalid');
  });

  it('wraps network failures in ApiError with status 0', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const err = await fetchBootstrap('en', 'AFN').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
  });
});
