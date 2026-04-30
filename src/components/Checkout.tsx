import { useEffect, useMemo, useRef, useState } from 'react';
import { useShop } from '../state/useShop';
import { ApiError, createOrder, quoteOrder } from '../api/client';
import type { OrderPayload, OrderQuote, OrderResponse } from '../api/types';
import { formatPrice } from '../utils/format';
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

  // Auto-select the first delivery place once data is available.
  useEffect(() => {
    if (form.delivery_place_id) return;
    const first = deliveryPlaces[0];
    if (first) {
      setForm((prev) => ({ ...prev, delivery_place_id: first.id }));
    }
  }, [deliveryPlaces, form.delivery_place_id]);

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

  // Re-quote whenever cart, delivery, or currency/language changes.
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
    quoteOrder(payload)
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
      const order = await createOrder(payload);
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
      <div className="section">
        <p>{t('checkout.requireItems')}</p>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          {t('checkout.back')}
        </button>
      </div>
    );
  }

  return (
    <form className="content" onSubmit={handleSubmit} noValidate>
      <div>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t('checkout.back')}
        </button>
        <h2 style={{ margin: '8px 0 16px' }}>{t('checkout.title')}</h2>
      </div>

      <section className="section">
        <h3>{t('checkout.customer')}</h3>
        <div className={`field ${nameInvalid ? 'invalid' : ''}`}>
          <label htmlFor="customer_name">{t('checkout.name')} *</label>
          <input
            id="customer_name"
            value={form.customer_name}
            onChange={handleField('customer_name')}
            onBlur={handleBlur('customer_name')}
            autoComplete="name"
            required
          />
        </div>
        <div className={`field ${phoneInvalid ? 'invalid' : ''}`}>
          <label htmlFor="customer_phone">{t('checkout.phone')} *</label>
          <input
            id="customer_phone"
            type="tel"
            value={form.customer_phone}
            onChange={handleField('customer_phone')}
            onBlur={handleBlur('customer_phone')}
            autoComplete="tel"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="customer_telegram">{t('checkout.telegram')}</label>
          <input
            id="customer_telegram"
            value={form.customer_telegram}
            onChange={handleField('customer_telegram')}
            placeholder="@username"
          />
          <span className="field-hint">{t('checkout.telegramHint')}</span>
        </div>
        <div className="field">
          <label htmlFor="customer_comment">{t('checkout.comment')}</label>
          <textarea
            id="customer_comment"
            value={form.customer_comment}
            onChange={handleField('customer_comment')}
          />
        </div>
      </section>

      <section className="section">
        <h3>{t('checkout.delivery')}</h3>
        {deliveryPlaces.length === 0 ? (
          <div className="alert alert-info">{t('common.empty')}</div>
        ) : (
          <div className="delivery-grid">
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

      <section className="section">
        <h3>{t('checkout.summary')}</h3>
        {quoteLoading && (
          <div className="loader-row">
            <span className="spinner" aria-hidden="true" />
            <span>{t('checkout.quoting')}</span>
          </div>
        )}
        {quoteError && !quoteLoading && (
          <div className="alert alert-error">{quoteError}</div>
        )}
        {!quoteLoading && quote && (
          <>
            <div className="totals-row">
              <span>{t('checkout.subtotal')}</span>
              <span>{formatPrice(quote.subtotal, currency, language)}</span>
            </div>
            <div className="totals-row">
              <span>{t('checkout.deliveryFee')}</span>
              <span>{formatPrice(quote.delivery_fee, currency, language)}</span>
            </div>
            <div className="totals-row total" style={{ marginTop: 8 }}>
              <span>{t('checkout.total')}</span>
              <span>{formatPrice(quote.total, currency, language)}</span>
            </div>
          </>
        )}
        {!quoteLoading && !quote && !quoteError && (
          <div className="totals-row total">
            <span>{t('checkout.subtotal')}</span>
            <span>{formatPrice(fallbackSubtotal.toFixed(2), currency, language)}</span>
          </div>
        )}
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={!canSubmit}
      >
        {submitting ? t('checkout.placing') : t('checkout.placeOrder')}
      </button>
    </form>
  );
}
