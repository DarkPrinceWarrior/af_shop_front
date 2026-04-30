import type { CatalogProduct } from '@/api/types';
import { useShop } from '@/state/useShop';
import { ProductCard } from './ProductCard';

interface Props {
  products: CatalogProduct[];
}

export function ProductGrid({ products }: Props) {
  const { t } = useShop();

  if (products.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground">
        <p>{t('common.noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
