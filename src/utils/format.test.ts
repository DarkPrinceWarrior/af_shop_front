import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats AFN in English with currency code', () => {
    const result = formatPrice('120.00', 'AFN', 'en');
    expect(result).toMatch(/AFN/);
    expect(result).toContain('120');
  });

  it('formats CNY in Simplified Chinese with the ¥ symbol', () => {
    const result = formatPrice('10', 'CNY', 'zh-CN');
    expect(result).toMatch(/¥|CN¥/);
    expect(result).toContain('10');
  });

  it('formats USD in English with two decimals', () => {
    expect(formatPrice('1.5', 'USD', 'en')).toBe('$1.50');
  });

  it('falls back gracefully when amount is not numeric', () => {
    expect(formatPrice('not-a-number', 'USD', 'en')).toBe('not-a-number');
  });

  it('accepts numeric input', () => {
    expect(formatPrice(2, 'USD', 'en')).toBe('$2.00');
  });
});
