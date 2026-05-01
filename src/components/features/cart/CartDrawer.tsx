import { useMemo } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ProductImage } from '@/components/features/layout/Image';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onOpenChange, onCheckout }: Props) {
  const { cart, productMap, language, currency, setQuantity, removeFromCart, t } =
    useShop();

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" aria-label={t('cart.title')}>
        <SheetHeader>
          <SheetTitle className="font-display tracking-tight">
            {t('cart.title')}
          </SheetTitle>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('common.close')}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>

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
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl bg-[var(--button-neutral-bg)] p-3"
                >
                  <ProductImage
                    path={primaryImage?.image_path}
                    alt={primaryImage?.alt || product.name}
                    fallbackLabel={t('common.noImage')}
                    className="aspect-square h-16 w-16 overflow-hidden rounded-lg bg-muted"
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
                        className="inline-flex items-center overflow-hidden rounded-full bg-card"
                        role="group"
                        aria-label={t('cart.quantity')}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity - 1)}
                          disabled={!canDecrement}
                          aria-label={t('cart.quantity')}
                          className="flex size-8 items-center justify-center hover:bg-muted disabled:cursor-not-allowed disabled:text-[var(--neutral-300)]"
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-semibold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, line.quantity + 1)}
                          disabled={!canIncrement}
                          aria-label={t('cart.quantity')}
                          className="flex size-8 items-center justify-center hover:bg-muted disabled:cursor-not-allowed disabled:text-[var(--neutral-300)]"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => removeFromCart(product.id)}
                      >
                        {t('cart.remove')}
                      </Button>
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

        <SheetFooter>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{t('cart.subtotal')}</span>
            <span className="font-display text-xl font-medium tracking-tight">
              {formatPrice(subtotal.toFixed(2), currency, language)}
            </span>
          </div>
          <Button
            type="button"
            onClick={onCheckout}
            disabled={lines.length === 0}
            size="lg"
            className="w-full rounded-full"
          >
            {t('cart.checkout')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-full"
          >
            {t('cart.continueShopping')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
