const API_URL = import.meta.env.VITE_API_URL ?? 'https://saas-finanza.onrender.com';

function formatearDetalle(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${(d.loc ?? []).slice(1).join('.')}: ${d.msg}`).join('\n');
  }
  return 'Verifica los datos';
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${API_URL}${path}${query}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const texto = await res.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!res.ok) throw new Error(formatearDetalle(data?.detail));
  return data;
}