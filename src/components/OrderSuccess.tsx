import { useShop } from '@/state/useShop';
import type { OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';

interface Props {
  order: OrderResponse;
  onContinue: () => void;
}

export function OrderSuccess({ order, onContinue }: Props) {
  const { language, t } = useShop();
  return (
    <div className="success-card">
      <h2>{t('success.title')}</h2>
      <p>
        <strong>{t('success.orderNumber')}</strong>
      </p>
      <div className="order-number">{order.order_number}</div>
      <div className="total">
        {t('success.total')}: {formatPrice(order.total, order.currency, language)}
      </div>
      <p>{t('success.note')}</p>
      <button type="button" className="btn btn-primary" onClick={onContinue}>
        {t('success.continue')}
      </button>
    </div>
  );
}
