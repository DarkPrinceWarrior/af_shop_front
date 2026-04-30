import { useEffect, useMemo } from 'react';
import { useShop } from '../state/useShop';
import { formatPrice } from '../utils/format';
import { ProductImage } from './Image';

interface Props {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { cart, productMap, language, currency, setQuantity, removeFromCart, t } =
    useShop();

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const lines = useMemo(
    () =>
      cart
        .map((line) => ({ line, product: productMap.get(line.productId) }))
        .filter((entry): entry is { line: typeof entry.line; product: NonNullable<typeof entry.product> } => Boolean(entry.product)),
    [cart, productMap],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((acc, { product, line }) => acc + Number(product.price) * line.quantity, 0),
    [lines],
  );

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <div className="drawer-header">
          <h2>{t('cart.title')}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>
        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="empty-state">{t('cart.empty')}</div>
          ) : (
            lines.map(({ product, line }) => {
              const stock = product.stock_quantity;
              const canDecrement = line.quantity > 1;
              const canIncrement = line.quantity < stock;
              const primaryImage = product.images[0];
              return (
                <div key={product.id} className="cart-line">
                  <ProductImage
                    path={primaryImage?.image_path}
                    alt={primaryImage?.alt || product.name}
                    fallbackLabel={t('common.noImage')}
                    className="cart-line-image"
                  />
                  <div className="cart-line-info">
                    <h3 className="cart-line-name">{product.name}</h3>
                    <div className="totals-row">
                      <span>{formatPrice(product.price, currency, language)}</span>
                      <span>
                        {formatPrice(
                          (Number(product.price) * line.quantity).toFixed(2),
                          currency,
                          language,
                        )}
                      </span>
                    </div>
                    <div className="cart-line-meta">
                      <div className="qty-control" role="group" aria-label={t('cart.quantity')}>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity - 1)}
                          disabled={!canDecrement}
                          aria-label="-"
                        >
                          −
                        </button>
                        <span className="qty-value">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity + 1)}
                          disabled={!canIncrement}
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => removeFromCart(product.id)}
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                    {!canIncrement && (
                      <span className="field-hint">
                        {t('cart.maxStock', { count: stock })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="drawer-footer">
          <div className="totals-row total">
            <span>{t('cart.subtotal')}</span>
            <span>{formatPrice(subtotal.toFixed(2), currency, language)}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onCheckout}
            disabled={lines.length === 0}
          >
            {t('cart.checkout')}
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
            {t('cart.continueShopping')}
          </button>
        </div>
      </aside>
    </>
  );
}
