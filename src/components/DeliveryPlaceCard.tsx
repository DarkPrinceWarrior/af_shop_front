import { useShop } from '@/state/useShop';
import type { CatalogDeliveryPlace } from '@/api/types';
import { formatPrice } from '@/utils/format';
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
      className={`delivery-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(place.id)}
      aria-pressed={selected}
    >
      <ProductImage
        path={place.image_path}
        alt={place.name}
        fallbackLabel={t('common.noImage')}
        className="delivery-card-image"
      />
      <div className="delivery-card-body">
        <span className="delivery-card-name">{place.name}</span>
        {place.description && (
          <span className="delivery-card-desc">{place.description}</span>
        )}
        <span className="delivery-card-fee">
          {t('checkout.deliveryFee')}: {formatPrice(place.delivery_fee, currency, language)}
        </span>
      </div>
    </button>
  );
}
