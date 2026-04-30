import { useShop } from '@/state/useShop';
import type { CatalogProduct } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import { ProductImage } from './Image';

interface Props {
  product: CatalogProduct;
}

export function ProductCard({ product }: Props) {
  const { language, currency, cart, addToCart, setQuantity, t } = useShop();
  const inCart = cart.find((line) => line.productId === product.id)?.quantity ?? 0;
  const stock = product.stock_quantity;
  const outOfStock = stock <= 0;
  const lowStock = !outOfStock && stock <= 5;
  const primaryImage = product.images[0];

  const stockLabel = outOfStock
    ? t('product.outOfStock')
    : t('product.stock', { count: stock });

  const canIncrement = inCart < stock;
  const canDecrement = inCart > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <ProductImage
        path={primaryImage?.image_path}
        alt={primaryImage?.alt || product.name}
        fallbackLabel={t('common.noImage')}
      />
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="m-0 text-[15px] font-semibold leading-snug break-words">
          {product.name}
        </h3>
        {product.description && (
          <p className="m-0 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-1.5">
          <div className="text-base font-bold text-primary">
            {formatPrice(product.price, currency, language)}
          </div>
          <div
            className={cn(
              'text-xs',
              outOfStock
                ? 'text-destructive'
                : lowStock
                  ? 'text-warning'
                  : 'text-muted-foreground',
            )}
          >
            {stockLabel}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {inCart === 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product.id, 1)}
              disabled={outOfStock}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            >
              {outOfStock ? t('product.outOfStock') : t('product.addToCart')}
            </button>
          ) : (
            <div
              className="inline-flex items-center overflow-hidden rounded-md border border-input bg-card"
              role="group"
              aria-label={t('cart.quantity')}
            >
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart - 1)}
                disabled={!canDecrement}
                aria-label="-"
                className="px-2.5 py-1.5 text-base text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:text-input"
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">
                {inCart}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart + 1)}
                disabled={!canIncrement}
                aria-label="+"
                className="px-2.5 py-1.5 text-base text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:text-input"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
