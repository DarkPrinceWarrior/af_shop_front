import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useShop } from '@/state/useShop';
import { TopBar } from '@/components/features/layout/TopBar';
import { CartDrawer } from '@/components/features/cart/CartDrawer';

export default function Layout() {
  const { cart } = useShop();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    setCartOpen(false);
  }, [pathname]);

  const cartCount = useMemo(
    () => cart.reduce((acc, line) => acc + line.quantity, 0),
    [cart],
  );

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopBar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main className="mx-auto grid w-full max-w-[1200px] flex-1 gap-6 px-5 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
        <Outlet />
      </main>
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
