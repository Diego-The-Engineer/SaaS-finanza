import { request } from './client';

export const getConceptos = () => request('/conceptos');
export const createConcepto = (data) => request('/conceptos', { method: 'POST', body: data });
export const updateConcepto = (id, data) => request(`/conceptos/${id}`, { method: 'PUT', body: data });
export const deleteConcepto = (id) => request(`/conceptos/${id}`, { method: 'DELETE' });
