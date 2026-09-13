import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../data/types';
import { api, apiOptional, getToken, setToken } from '../api/client';

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, extra?: object) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      const data = await apiOptional<{ user: AuthUser }>('/auth/me');
      if (!cancelled) {
        if (data?.user) setUser(data.user);
        else setToken(null);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string, extra?: object) => {
      const data = await api<{ token: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, ...extra }),
      });
      setToken(data.token);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth requires AuthProvider');
  return ctx;
}
