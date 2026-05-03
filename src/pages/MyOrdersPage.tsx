import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { ApiError, fetchMyOrders } from '@/api/client';
import type { OrderResponse } from '@/api/types';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  const { language, t } = useShop();
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMyOrders(token)
      .then((result) => {
        if (cancelled) return;
        setOrders(result.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load orders';
        setError(message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (authLoading) {
    return <CenteredSpinner label={t('common.loading')} />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center">
        <p className="m-0 mb-4 text-sm text-muted-foreground">
          {t('auth.title')}
        </p>
        <Button asChild className="rounded-full">
          <Link to="/checkout">{t('auth.signIn')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col gap-4">
      <h1 className="m-0 font-display text-2xl font-medium tracking-tighter">
        {t('myOrders.title')}
      </h1>
      {loading && <CenteredSpinner label={t('common.loading')} />}
      {error && !loading && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}
      {!loading && !error && orders && orders.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          {t('myOrders.empty')}
        </div>
      )}
      {!loading && !error && orders && orders.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {orders.map((order) => (
            <li
              key={order.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm font-medium">
                  {order.order_number}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>
                    {t('myOrders.status')}: {order.status}
                  </span>
                  {order.created_at && (
                    <span>
                      {t('myOrders.created')}:{' '}
                      {new Date(order.created_at).toLocaleString(language)}
                    </span>
                  )}
                </div>
              </div>
              <div className="font-display text-lg font-medium tracking-tight">
                {formatPrice(order.total, order.currency, language)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
