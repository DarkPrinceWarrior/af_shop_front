import { useLocation, useNavigate, useParams } from 'react-router';
import type { OrderResponse } from '@/api/types';
import { OrderSuccess } from '@/components/features/checkout/OrderSuccess';
import { useShop } from '@/state/useShop';
import { Button } from '@/components/ui/button';

interface LocationState {
  order?: OrderResponse;
}

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber } = useParams();
  const { t } = useShop();

  const order = (location.state as LocationState | null)?.order;

  if (!order) {
    return (
      <div className="md:col-span-2">
        <div className="mx-auto my-6 max-w-[480px] rounded-xl border border-border bg-card p-6 text-center shadow-md">
          <h2 className="m-0 mb-2 text-xl font-semibold">{t('success.title')}</h2>
          {orderNumber && (
            <div className="mt-2 inline-block break-all rounded-md bg-muted px-3 py-2 font-mono text-base">
              {orderNumber}
            </div>
          )}
          <p className="my-3 text-muted-foreground">{t('success.note')}</p>
          <Button type="button" onClick={() => navigate('/')}>
            {t('success.continue')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
      <OrderSuccess order={order} onContinue={() => navigate('/')} />
    </div>
  );
}
