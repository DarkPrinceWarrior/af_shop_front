import { useShop } from '@/state/useShop';
import type { CatalogDeliveryPlace } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import { ProductImage } from './Image';

interface Props {
  place: CatalogDeliveryPlace;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function DeliveryPlaceCard({ place, selected, onSelect }: Props) {
  const { language, currency, t } = useShop();
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      aria-pressed={selected}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border-2 bg-card text-start transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary shadow-[0_0_0_3px_oklch(0.475_0.13_152_/_0.18)]'
          : 'border-border hover:border-input',
      )}
    >
      <ProductImage
        path={place.image_path}
        alt={place.name}
        fallbackLabel={t('common.noImage')}
        className="aspect-video w-full bg-muted"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-sm font-semibold">{place.name}</span>
        {place.description && (
          <span className="text-[13px] leading-snug text-muted-foreground">
            {place.description}
          </span>
        )}
        <span className="mt-auto pt-2 text-[13px] font-semibold text-primary">
          {t('checkout.deliveryFee')}: {formatPrice(place.delivery_fee, currency, language)}
        </span>
      </div>
    </button>
  );
}
