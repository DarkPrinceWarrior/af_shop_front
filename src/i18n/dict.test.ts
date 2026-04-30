import { describe, it, expect } from 'vitest';
import { translate, RTL_LANGUAGES } from './dict';

describe('translate', () => {
  it('returns the localized template for a known key', () => {
    expect(translate('en', 'cart.subtotal')).toBe('Subtotal');
    expect(translate('zh-CN', 'cart.subtotal')).toBe('小计');
  });

  it('substitutes named variables in the template', () => {
    expect(translate('en', 'product.stock', { count: 7 })).toBe('In stock: 7');
    expect(translate('zh-CN', 'product.stock', { count: 7 })).toBe('库存：7');
  });

  it('falls back to the English template when a translation is missing', () => {
    // Force-cast to bypass the typed dictionary check.
    const missing = 'common.loading' as const;
    expect(translate('ps', missing)).toBeTruthy();
    expect(translate('en', missing)).toBe('Loading…');
  });
});

describe('RTL_LANGUAGES', () => {
  it('includes Pashto and excludes the rest', () => {
    expect(RTL_LANGUAGES.has('ps')).toBe(true);
    expect(RTL_LANGUAGES.has('en')).toBe(false);
    expect(RTL_LANGUAGES.has('zh-CN')).toBe(false);
  });
});
