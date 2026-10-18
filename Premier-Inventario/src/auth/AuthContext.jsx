import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { EVENTO_SESION_EXPIRADA } from '../api/client';
import { clearToken, getToken, setToken } from '../api/token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [autenticado, setAutenticado] = useState(() => Boolean(getToken()));

  const cerrarSesion = useCallback(() => {
    clearToken();
    setAutenticado(false);
    queryClient.clear(); 
  }, [queryClient]);

  const iniciarSesion = useCallback(async (username, password) => {
    const { access_token } = await authApi.login(username, password);
    setToken(access_token);
    setAutenticado(true);
  }, []);

  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion);
  }, [cerrarSesion]);

  const valor = useMemo(
    () => ({ autenticado, iniciarSesion, cerrarSesion }),
    [autenticado, iniciarSesion, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
