import { useEffect, useMemo, useState } from 'react';
import { useShop } from '@/state/useShop';
import { Button } from '@/components/ui/button';
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
    <div className="flex min-h-full flex-col">
      <TopBar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main className="mx-auto grid w-full max-w-[1200px] flex-1 gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        {view === 'shop' && (
          <>
            <CategoryFilter
              categories={bootstrap?.categories ?? []}
              activeCategoryId={activeCategory}
              onChange={setActiveCategory}
            />
            <div className="flex min-w-0 flex-col gap-4">
              <SearchBar value={search} onChange={setSearch} />
              {loading && (
                <div className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="inline-block size-5 animate-spin rounded-full border-2 border-border border-t-primary"
                  />
                  <span>{t('common.loading')}</span>
                </div>
              )}
              {error && !loading && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
                  <div className="flex-1">{error}</div>
                  <Button type="button" variant="outline" size="sm" onClick={reload}>
                    {t('common.retry')}
                  </Button>
                </div>
              )}
              {!loading && !error && bootstrap && (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </>
        )}

        {view === 'checkout' && (
          <div className="md:col-span-2">
            <Checkout onBack={() => setView('shop')} onSuccess={handleSuccess} />
          </div>
        )}

        {view === 'success' && completedOrder && (
          <div className="md:col-span-2">
            <OrderSuccess order={completedOrder} onContinue={handleContinue} />
          </div>
        )}
      </main>

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
