import { useNavigate } from 'react-router';
import type { OrderResponse } from '@/api/types';
import { Checkout } from '@/components/features/checkout/Checkout';

export default function CheckoutPage() {
  const navigate = useNavigate();

  const handleSuccess = (order: OrderResponse) => {
    navigate(`/orders/${order.order_number}/success`, {
      replace: true,
      state: { order },
    });
  };

  return (
    <div className="md:col-span-2">
      <Checkout onBack={() => navigate('/')} onSuccess={handleSuccess} />
    </div>
  );
}
