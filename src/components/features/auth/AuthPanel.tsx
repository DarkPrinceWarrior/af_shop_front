import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/state/useAuth';
import { useShop } from '@/state/useShop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Mode = 'guest' | 'signIn' | 'signUp';

export function AuthPanel() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { t } = useShop();
  const [mode, setMode] = useState<Mode>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-primary">
            <UserIcon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium">
              {t('auth.signedInAs', { name: user.full_name || user.email })}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={logout}
          className="rounded-full"
        >
          <LogOut aria-hidden="true" className="size-4" />
          {t('auth.logout')}
        </Button>
      </div>
    );
  }

  const submit = async () => {
    if (mode === 'guest' || !email || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signIn') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, fullName);
      }
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-[var(--button-neutral-bg)] p-1">
        {(['guest', 'signIn', 'signUp'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              'rounded-full py-2 text-sm font-medium transition-colors',
              mode === m
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(m === 'guest' ? 'auth.guest' : m === 'signIn' ? 'auth.signIn' : 'auth.signUp')}
          </button>
        ))}
      </div>

      {mode === 'guest' && (
        <p className="m-0 text-sm text-muted-foreground">{t('auth.guestHint')}</p>
      )}

      {mode !== 'guest' && (
        <div onKeyDown={onKeyDown} className="flex flex-col gap-3">
          {mode === 'signUp' && (
            <Field htmlFor="auth_full_name" label={t('auth.fullName')}>
              <Input
                id="auth_full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </Field>
          )}
          <Field htmlFor="auth_email" label={t('auth.email')}>
            <Input
              id="auth_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <Field htmlFor="auth_password" label={t('auth.password')}>
            <Input
              id="auth_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </Field>
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={submitting || !email || !password}
            className="rounded-full"
          >
            {submitting ? '…' : t('auth.submit')}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setError(null);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === 'signIn' ? t('auth.noAccount') : t('auth.haveAccount')}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={htmlFor} className="text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
