import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { useAuth } from '@/state/useAuth';
import { ApiError, createOrder, quoteOrder } from '@/api/client';
import type { OrderPayload, OrderQuote, OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AuthPanel } from '@/components/features/auth/AuthPanel';
import { DeliveryPlaceCard } from './DeliveryPlaceCard';

interface Props {
  onBack: () => void;
  onSuccess: (order: OrderResponse) => void;
}

interface FormState {
  customer_name: string;
  customer_phone: string;
  customer_telegram: string;
  customer_comment: string;
  delivery_place_id: string | null;
}

const INITIAL_FORM: FormState = {
  customer_name: '',
  customer_phone: '',
  customer_telegram: '',
  customer_comment: '',
  delivery_place_id: null,
};

const SECTION = 'rounded-xl border border-border bg-card p-5';

export function Checkout({ onBack, onSuccess }: Props) {
  const {
    cart,
    productMap,
    bootstrap,
    language,
    currency,
    clearCart,
    t,
  } = useShop();
  const { token, user } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [quote, setQuote] = useState<OrderQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const deliveryPlaces = useMemo(
    () => bootstrap?.delivery_places ?? [],
    [bootstrap],
  );

  useEffect(() => {
    if (form.delivery_place_id) return;
    const first = deliveryPlaces[0];
    if (first) {
      setForm((prev) => ({ ...prev, delivery_place_id: first.id }));
    }
  }, [deliveryPlaces, form.delivery_place_id]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) =>
      prev.customer_name.trim()
        ? prev
        : { ...prev, customer_name: user.full_name ?? '' },
    );
  }, [user]);

  const itemsPayload = useMemo(
    () =>
      cart
        .filter((line) => productMap.has(line.productId))
        .map((line) => ({ product_id: line.productId, quantity: line.quantity })),
    [cart, productMap],
  );

  const fallbackSubtotal = useMemo(
    () =>
      cart.reduce((acc, line) => {
        const product = productMap.get(line.productId);
        if (!product) return acc;
        return acc + Number(product.price) * line.quantity;
      }, 0),
    [cart, productMap],
  );

  useEffect(() => {
    if (!form.delivery_place_id || itemsPayload.length === 0) {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    const payload: OrderPayload = {
      customer_name: form.customer_name.trim() || 'Guest',
      customer_phone: form.customer_phone.trim() || '+000000000',
      customer_telegram: form.customer_telegram.trim() || null,
      customer_comment: form.customer_comment.trim() || null,
      language,
      currency,
      delivery_place_id: form.delivery_place_id,
      items: itemsPayload,
    };

    setQuoteLoading(true);
    setQuoteError(null);
    quoteOrder(payload, token)
      .then((result) => {
        if (seq !== requestSeq.current) return;
        setQuote(result);
        setQuoteLoading(false);
      })
      .catch((err: unknown) => {
        if (seq !== requestSeq.current) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Quote failed';
        setQuoteError(message);
        setQuoteLoading(false);
        setQuote(null);
      });
  }, [
    form.delivery_place_id,
    form.customer_name,
    form.customer_phone,
    form.customer_telegram,
    form.customer_comment,
    itemsPayload,
    language,
    currency,
    token,
  ]);

  const handleField =
    <K extends keyof FormState>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleBlur = (key: keyof FormState) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const nameInvalid = touched.customer_name && form.customer_name.trim().length === 0;
  const phoneInvalid =
    touched.customer_phone && form.customer_phone.trim().length < 3;

  const canSubmit =
    !submitting &&
    form.customer_name.trim().length > 0 &&
    form.customer_phone.trim().length >= 3 &&
    form.delivery_place_id !== null &&
    itemsPayload.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ customer_name: true, customer_phone: true });
    if (!canSubmit || !form.delivery_place_id) return;

    const payload: OrderPayload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_telegram: form.customer_telegram.trim() || null,
      customer_comment: form.customer_comment.trim() || null,
      language,
      currency,
      delivery_place_id: form.delivery_place_id,
      items: itemsPayload,
    };

    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(payload, token);
      clearCart();
      onSuccess(order);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to place order';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={SECTION}>
        <p>{t('checkout.requireItems')}</p>
        <Button type="button" variant="outline" onClick={onBack}>
          {t('checkout.back')}
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
      <div>
        <Button type="button" variant="link" onClick={onBack} className="px-0">
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t('checkout.back')}
        </Button>
        <h2 className="my-2 font-display text-2xl font-medium tracking-tighter">
          {t('checkout.title')}
        </h2>
      </div>

      <section>
        <h3 className="mb-3 font-display text-lg font-medium tracking-tight">
          {t('auth.title')}
        </h3>
        <AuthPanel />
      </section>

      <section className={SECTION}>
        <h3 className="mb-4 font-display text-lg font-medium tracking-tight">{t('checkout.customer')}</h3>
        <Field
          htmlFor="customer_name"
          label={`${t('checkout.name')} *`}
          invalid={!!nameInvalid}
        >
          <Input
            id="customer_name"
            value={form.customer_name}
            onChange={handleField('customer_name')}
            onBlur={handleBlur('customer_name')}
            autoComplete="name"
            required
            aria-invalid={!!nameInvalid}
          />
        </Field>
        <Field
          htmlFor="customer_phone"
          label={`${t('checkout.phone')} *`}
          invalid={!!phoneInvalid}
        >
          <Input
            id="customer_phone"
            type="tel"
            value={form.customer_phone}
            onChange={handleField('customer_phone')}
            onBlur={handleBlur('customer_phone')}
            autoComplete="tel"
            required
            aria-invalid={!!phoneInvalid}
          />
        </Field>
        <Field
          htmlFor="customer_telegram"
          label={t('checkout.telegram')}
          hint={t('checkout.telegramHint')}
        >
          <Input
            id="customer_telegram"
            value={form.customer_telegram}
            onChange={handleField('customer_telegram')}
            placeholder="@username"
          />
        </Field>
        <Field htmlFor="customer_comment" label={t('checkout.comment')}>
          <Textarea
            id="customer_comment"
            value={form.customer_comment}
            onChange={handleField('customer_comment')}
          />
        </Field>
      </section>

      <section className={SECTION}>
        <h3 className="mb-4 font-display text-lg font-medium tracking-tight">{t('checkout.delivery')}</h3>
        {deliveryPlaces.length === 0 ? (
          <Alert variant="info">{t('common.empty')}</Alert>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {deliveryPlaces.map((place) => (
              <DeliveryPlaceCard
                key={place.id}
                place={place}
                selected={form.delivery_place_id === place.id}
                onSelect={(id) =>
                  setForm((prev) => ({ ...prev, delivery_place_id: id }))
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className={SECTION}>
        <h3 className="mb-4 font-display text-lg font-medium tracking-tight">{t('checkout.summary')}</h3>
        {quoteLoading && (
          <div className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
            <Spinner />
            <span>{t('checkout.quoting')}</span>
          </div>
        )}
        {quoteError && !quoteLoading && (
          <Alert variant="error">{quoteError}</Alert>
        )}
        {!quoteLoading && quote && (
          <>
            <Row label={t('checkout.subtotal')}>
              {formatPrice(quote.subtotal, currency, language)}
            </Row>
            <Row label={t('checkout.deliveryFee')}>
              {formatPrice(quote.delivery_fee, currency, language)}
            </Row>
            <Row label={t('checkout.total')} bold>
              {formatPrice(quote.total, currency, language)}
            </Row>
          </>
        )}
        {!quoteLoading && !quote && !quoteError && (
          <Row label={t('checkout.subtotal')} bold>
            {formatPrice(fallbackSubtotal.toFixed(2), currency, language)}
          </Row>
        )}
      </section>

      {error && <Alert variant="error">{error}</Alert>}

      <Button
        type="submit"
        disabled={!canSubmit}
        size="lg"
        className="w-full rounded-full"
      >
        {submitting ? t('checkout.placing') : t('checkout.placeOrder')}
      </Button>
    </form>
  );
}

function Field({
  htmlFor,
  label,
  hint,
  children,
  invalid,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-1 last:mb-0">
      <Label
        htmlFor={htmlFor}
        className={invalid ? 'text-destructive' : 'text-muted-foreground'}
      >
        {label}
      </Label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Row({
  label,
  bold,
  children,
}: {
  label: string;
  bold?: boolean;
  children: React.ReactNode;
}) {
  if (bold) {
    return (
      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-display text-xl font-medium tracking-tight text-foreground">
          {children}
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

function Alert({
  variant,
  children,
}: {
  variant: 'error' | 'info';
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-snug',
        variant === 'error'
          ? 'bg-destructive-soft text-destructive'
          : 'bg-[var(--primary-soft)] text-primary',
      )}
    >
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Spinner() {
  return <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />;
}
