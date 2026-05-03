import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  fetchCurrentUser,
  login as loginRequest,
  signup as signupRequest,
} from '@/api/client';
import type { AuthUser } from '@/api/types';
import { AuthContext, type AuthState } from './authContext';

const TOKEN_KEY = 'shop-meraj.auth.token';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialToken = useRef(readToken()).current;
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(initialToken !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCurrentUser(token)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          writeToken(null);
          setToken(null);
          setUser(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const t = await loginRequest(email, password);
      writeToken(t.access_token);
      setToken(t.access_token);
      const u = await fetchCurrentUser(t.access_token);
      setUser(u);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setError(null);
      try {
        await signupRequest({
          email,
          password,
          full_name: fullName?.trim() ? fullName.trim() : null,
        });
        await login(email, password);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Registration failed';
        setError(message);
        throw err;
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      loading,
      error,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [token, user, loading, error, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
