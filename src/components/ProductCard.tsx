import { useShop } from '../state/useShop';
import type { CatalogProduct } from '../api/types';
import { formatPrice } from '../utils/format';
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

  const stockClass = outOfStock ? 'out' : lowStock ? 'low' : '';
  const stockLabel = outOfStock
    ? t('product.outOfStock')
    : t('product.stock', { count: stock });

  const canIncrement = inCart < stock;
  const canDecrement = inCart > 0;

  return (
    <article className="product-card">
      <ProductImage
        path={primaryImage?.image_path}
        alt={primaryImage?.alt || product.name}
        fallbackLabel={t('common.noImage')}
      />
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="product-price-row">
          <div className="product-price">
            {formatPrice(product.price, currency, language)}
          </div>
          <div className={`product-stock ${stockClass}`}>{stockLabel}</div>
        </div>
        <div className="product-actions">
          {inCart === 0 ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => addToCart(product.id, 1)}
              disabled={outOfStock}
            >
              {outOfStock ? t('product.outOfStock') : t('product.addToCart')}
            </button>
          ) : (
            <div
              className="qty-control"
              role="group"
              aria-label={t('cart.quantity')}
            >
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart - 1)}
                disabled={!canDecrement}
                aria-label="-"
              >
                −
              </button>
              <span className="qty-value">{inCart}</span>
              <button
                type="button"
                onClick={() => setQuantity(product.id, inCart + 1)}
                disabled={!canIncrement}
                aria-label="+"
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
