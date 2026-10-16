import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setUnauthorizedHandler } from '../services/api.js';

const STORAGE_KEY = 'devvoluntario:auth';

const AuthContext = createContext(null);

// Lê o payload do JWT (apenas para conferir a expiração; a validação real é feita no servidor).
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const { token, user } = JSON.parse(raw);
    const payload = token ? decodeJwtPayload(token) : null;
    const expired = !payload?.exp || payload.exp * 1000 <= Date.now();

    if (!token || !user || expired) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { token, user };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const persist = useCallback((token, user) => {
    const next = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  // Atualiza os dados do usuário logado (ex.: depois de editar o perfil), mantendo o token.
  const updateUser = useCallback((user) => {
    setAuth((current) => {
      if (!current) return current;
      const next = { token: current.token, user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { token, user } = await authApi.login({ email, password });
      return persist(token, user);
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const { token, user } = await authApi.register(payload);
      return persist(token, user);
    },
    [persist]
  );

  // Token recusado pela API (expirado/inválido): encerra a sessão local.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Encerra a sessão automaticamente quando o token de 8h expirar.
  useEffect(() => {
    if (!auth?.token) return undefined;
    const payload = decodeJwtPayload(auth.token);
    if (!payload?.exp) return undefined;

    const msLeft = payload.exp * 1000 - Date.now();
    const timer = setTimeout(logout, Math.max(msLeft, 0));
    return () => clearTimeout(timer);
  }, [auth?.token, logout]);

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
      updateUser,
    }),
    [auth, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return context;
}
