import type { CatalogProduct } from '../api/types';
import { ProductCard } from './ProductCard';
import { useShop } from '../state/useShop';

interface Props {
  products: CatalogProduct[];
}

export function ProductGrid({ products }: Props) {
  const { t } = useShop();

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('common.noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
