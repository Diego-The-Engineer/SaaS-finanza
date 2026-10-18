import { clearToken, getToken } from './token';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://saas-finanza.onrender.com';

export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

function formatearDetalle(detail, status) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${(d.loc ?? []).slice(1).join('.')}: ${d.msg}`).join('\n');
  }
  return `Error del servidor (${status})`;
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  const token = getToken();

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}${query}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const texto = await res.text();
  let data = null;
  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = null; 
  }

  if (!res.ok) {
    if (res.status === 401 && token && path !== '/login') {
      clearToken();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    throw new Error(formatearDetalle(data?.detail, res.status));
  }
  return data;
}
