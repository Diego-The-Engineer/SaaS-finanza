import { request } from './client';

export const getTransacciones = ({ tipo, mes, pagina, pageSize }) => {
  const params = { limit: pageSize, offset: (pagina - 1) * pageSize };
  if (tipo) params.tipo = tipo;
  if (mes) params.mes = parseInt(mes, 10);
  return request('/transacciones', { params });
};

export const getTotalTransacciones = ({ tipo, mes } = {}) => {
  const params = {};
  if (tipo) params.tipo = tipo;
  if (mes) params.mes = parseInt(mes, 10);
  return request('/transacciones/count', { params });
};

export const createTransaccion = (data) => request('/transacciones', { method: 'POST', body: data });
export const updateTransaccion = (id, data) => request(`/transacciones/${id}`, { method: 'PUT', body: data });
export const deleteTransaccion = (id) => request(`/transacciones/${id}`, { method: 'DELETE' });

export async function getTodasTransacciones({ tipo, desde, hasta }) {
  const LOTE = 1000;
  const todas = [];
  for (let offset = 0; ; offset += LOTE) {
    const params = { limit: LOTE, offset };
    if (tipo) params.tipo = tipo;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const lote = await request('/transacciones', { params });
    todas.push(...lote);
    if (lote.length < LOTE) return todas;
  }
}