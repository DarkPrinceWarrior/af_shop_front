import { Minus, Plus } from 'lucide-react';
import { useShop } from '@/state/useShop';
import type { CatalogProduct } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/features/layout/Image';

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

  const stockTone = outOfStock
    ? 'bg-destructive-soft text-destructive'
    : lowStock
      ? 'bg-warning-soft text-warning'
      : 'bg-[var(--button-neutral-bg)] text-muted-foreground';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-card border border-border transition-colors hover:border-[var(--neutral-300)]">
      <div className="overflow-hidden rounded-xl">
        <ProductImage
          path={primaryImage?.image_path}
          alt={primaryImage?.alt || product.name}
          fallbackLabel={t('common.noImage')}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 font-display text-[19px] font-medium leading-tight tracking-tight break-words">
            {product.name}
          </h3>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium',
              stockTone,
            )}
          >
            {stockLabel}
          </span>
        </div>
        {product.description && (
          <p className="m-0 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="font-display text-[26px] font-medium leading-none tracking-tighter">
            {formatPrice(product.price, currency, language)}
          </div>
          {inCart === 0 ? (
            <Button
              type="button"
              onClick={() => addToCart(product.id, 1)}
              disabled={outOfStock}
              size="sm"
              className="rounded-full px-4"
            >
              {outOfStock ? t('product.outOfStock') : t('product.addToCart')}
            </Button>
          ) : (
            <div
              className="inline-flex items-center gap-0.5 overflow-hidden rounded-full bg-[var(--button-neutral-bg)] backdrop-blur-xl"
              role="group"
              aria-label={t('cart.quantity')}
            >
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart - 1)}
                disabled={!canDecrement}
                aria-label={t('cart.quantity')}
                className="flex size-9 items-center justify-center text-foreground hover:bg-[var(--neutral-200)] disabled:cursor-not-allowed disabled:text-[var(--neutral-300)]"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="min-w-7 text-center text-sm font-semibold">
                {inCart}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart + 1)}
                disabled={!canIncrement}
                aria-label={t('cart.quantity')}
                className="flex size-9 items-center justify-center text-foreground hover:bg-[var(--neutral-200)] disabled:cursor-not-allowed disabled:text-[var(--neutral-300)]"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
