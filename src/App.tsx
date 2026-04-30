import { useEffect, useMemo, useState } from 'react';
import { useShop } from '@/state/useShop';
import { TopBar } from '@/components/TopBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { ProductGrid } from '@/components/ProductGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { Checkout } from '@/components/Checkout';
import { OrderSuccess } from '@/components/OrderSuccess';
import type { OrderResponse } from '@/api/types';

type View = 'shop' | 'checkout' | 'success';

export default function App() {
  const { bootstrap, loading, error, cart, reload, t } = useShop();
  const [view, setView] = useState<View>('shop');
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(null);

  const cartCount = useMemo(
    () => cart.reduce((acc, line) => acc + line.quantity, 0),
    [cart],
  );

  // Reset state when language/currency reloads bootstrap and category disappears.
  useEffect(() => {
    if (!bootstrap) return;
    if (
      activeCategory &&
      !bootstrap.categories.some((cat) => cat.id === activeCategory)
    ) {
      setActiveCategory(null);
    }
  }, [bootstrap, activeCategory]);

  const filteredProducts = useMemo(() => {
    if (!bootstrap) return [];
    const term = search.trim().toLowerCase();
    return bootstrap.products.filter((product) => {
      if (!product.is_active) return false;
      if (activeCategory && product.category_id !== activeCategory) return false;
      if (!term) return true;
      const haystack = [product.name, product.description, product.sku]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [bootstrap, activeCategory, search]);

  const handleCheckout = () => {
    setCartOpen(false);
    setView('checkout');
  };

  const handleSuccess = (order: OrderResponse) => {
    setCompletedOrder(order);
    setView('success');
  };

  const handleContinue = () => {
    setCompletedOrder(null);
    setView('shop');
  };

  return (
    <div className="app-shell">
      <TopBar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main className="main">
        {view === 'shop' && (
          <>
            <CategoryFilter
              categories={bootstrap?.categories ?? []}
              activeCategoryId={activeCategory}
              onChange={setActiveCategory}
            />
            <div className="content">
              <SearchBar value={search} onChange={setSearch} />
              {loading && (
                <div className="loader-row">
                  <span className="spinner" aria-hidden="true" />
                  <span>{t('common.loading')}</span>
                </div>
              )}
              {error && !loading && (
                <div className="alert alert-error">
                  <div style={{ flex: 1 }}>{error}</div>
                  <button type="button" className="btn btn-ghost" onClick={reload}>
                    {t('common.retry')}
                  </button>
                </div>
              )}
              {!loading && !error && bootstrap && (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </>
        )}

        {view === 'checkout' && (
          <div className="content" style={{ gridColumn: '1 / -1' }}>
            <Checkout onBack={() => setView('shop')} onSuccess={handleSuccess} />
          </div>
        )}

        {view === 'success' && completedOrder && (
          <div style={{ gridColumn: '1 / -1' }}>
            <OrderSuccess order={completedOrder} onContinue={handleContinue} />
          </div>
        )}
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
