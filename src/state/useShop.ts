import { useContext } from 'react';
import { ShopContext, type ShopState } from './context';

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used inside ShopProvider');
  }
  return ctx;
}
