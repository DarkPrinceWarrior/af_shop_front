import { CheckCircle2 } from 'lucide-react';
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
    <div className="mx-auto my-6 max-w-[480px] rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--primary-soft)]">
        <CheckCircle2 aria-hidden="true" className="size-8 text-primary" />
      </div>
      <h2 className="m-0 mb-2 font-display text-2xl font-medium tracking-tighter">
        {t('success.title')}
      </h2>
      <p className="m-0 text-sm text-muted-foreground">
        {t('success.orderNumber')}
      </p>
      <div className="mt-2 inline-block break-all rounded-full bg-[var(--button-neutral-bg)] px-4 py-2 font-mono text-base">
        {order.order_number}
      </div>
      <div className="mt-4 font-display text-3xl font-medium tracking-tighter">
        {formatPrice(order.total, order.currency, language)}
      </div>
      {order.user_id && (
        <p className="mt-3 inline-block rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-medium text-primary">
          {t('success.savedToAccount')}
        </p>
      )}
      <p className="my-4 text-sm text-muted-foreground">{t('success.note')}</p>
      <Button
        type="button"
        onClick={onContinue}
        size="lg"
        className="rounded-full px-8"
      >
        {t('success.continue')}
      </Button>
    </div>
  );
}
