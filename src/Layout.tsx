import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useShop } from '@/state/useShop';
import { TopBar } from '@/components/features/layout/TopBar';
import { CartDrawer } from '@/components/features/cart/CartDrawer';

export default function Layout() {
  const { cart } = useShop();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

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
      <main className="mx-auto grid w-full max-w-[1200px] flex-1 gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
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
