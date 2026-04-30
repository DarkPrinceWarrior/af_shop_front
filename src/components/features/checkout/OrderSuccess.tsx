import { useShop } from '@/state/useShop';
import type { OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';

interface Props {
  order: OrderResponse;
  onContinue: () => void;
}

export function OrderSuccess({ order, onContinue }: Props) {
  const { language, t } = useShop();
  return (
    <div className="mx-auto my-6 max-w-[480px] rounded-xl border border-border bg-card p-6 text-center shadow-md">
      <h2 className="m-0 mb-2 text-2xl font-semibold text-primary">
        {t('success.title')}
      </h2>
      <p className="m-0">
        <strong>{t('success.orderNumber')}</strong>
      </p>
      <div className="mt-2 inline-block break-all rounded-md bg-muted px-3 py-2 font-mono text-base">
        {order.order_number}
      </div>
      <div className="mt-3 text-lg font-bold">
        {t('success.total')}: {formatPrice(order.total, order.currency, language)}
      </div>
      <p className="my-3 text-muted-foreground">{t('success.note')}</p>
      <Button type="button" onClick={onContinue}>
        {t('success.continue')}
      </Button>
    </div>
  );
}
