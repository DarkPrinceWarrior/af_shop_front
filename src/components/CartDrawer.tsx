import { useEffect, useMemo } from 'react';
import { useShop } from '@/state/useShop';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
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
      <div
        className="fixed inset-0 z-40 bg-black/45 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed bottom-0 top-0 end-0 z-50 flex w-[min(440px,100%)] flex-col bg-card shadow-xl',
          'animate-in slide-in-from-end duration-200',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="m-0 text-lg font-semibold">{t('cart.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {lines.length === 0 ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              {t('cart.empty')}
            </div>
          ) : (
            lines.map(({ product, line }) => {
              const stock = product.stock_quantity;
              const canDecrement = line.quantity > 1;
              const canIncrement = line.quantity < stock;
              const primaryImage = product.images[0];
              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-card p-2"
                >
                  <ProductImage
                    path={primaryImage?.image_path}
                    alt={primaryImage?.alt || product.name}
                    fallbackLabel={t('common.noImage')}
                    className="aspect-square h-16 w-16 overflow-hidden rounded-md bg-muted"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="m-0 break-words text-sm font-semibold">
                      {product.name}
                    </h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatPrice(product.price, currency, language)}</span>
                      <span>
                        {formatPrice(
                          (Number(product.price) * line.quantity).toFixed(2),
                          currency,
                          language,
                        )}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div
                        className="inline-flex items-center overflow-hidden rounded-md border border-input bg-card"
                        role="group"
                        aria-label={t('cart.quantity')}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity - 1)}
                          disabled={!canDecrement}
                          aria-label="-"
                          className="px-2.5 py-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:text-input"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity + 1)}
                          disabled={!canIncrement}
                          aria-label="+"
                          className="px-2.5 py-1.5 hover:bg-muted disabled:cursor-not-allowed disabled:text-input"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-sm text-primary underline-offset-2 hover:underline"
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                    {!canIncrement && (
                      <span className="text-xs text-muted-foreground">
                        {t('cart.maxStock', { count: stock })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-card p-4">
          <div className="flex justify-between text-base font-bold">
            <span>{t('cart.subtotal')}</span>
            <span>{formatPrice(subtotal.toFixed(2), currency, language)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={lines.length === 0}
            className="w-full rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {t('cart.checkout')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            {t('cart.continueShopping')}
          </button>
        </div>
      </aside>
    </>
  );
}
