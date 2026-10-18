const CLAVE = 'premier_token';

export const getToken = () => localStorage.getItem(CLAVE);
export const setToken = (token) => localStorage.setItem(CLAVE, token);
export const clearToken = () => localStorage.removeItem(CLAVE);