import { request } from './client';

export const getSucursales = () => request('/sucursales');
export const createSucursal = (data) => request('/sucursales', { method: 'POST', body: data });
export const updateSucursal = (id, data) => request(`/sucursales/${id}`, { method: 'PUT', body: data });
export const deleteSucursal = (id) => request(`/sucursales/${id}`, { method: 'DELETE' });
