import { SUCURSALES } from '../constants';

export const soloFecha = (fecha) => (fecha ? fecha.split('T')[0] : '');

export const formatMonto = (monto) => `$${Number(monto).toFixed(2)}`;

const sinAcentos = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function parametrosBusqueda(texto) {
  const q = (texto ?? '').trim();
  if (!q) return {};
  const buscar = sinAcentos(q);
  const ids = SUCURSALES.filter((s) => sinAcentos(s.nombre).includes(buscar)).map((s) => s.id);
  return ids.length ? { q, q_sucursales: ids.join(',') } : { q };
}

export function resumenPorTipo(resumen, tipo, nombreConcepto) {
  return resumen
    .filter((r) => r.id_tipo === tipo)
    .map((r) => ({ nombre: nombreConcepto(r.id_concepto), total: Number(r.total) }))
    .sort((a, b) => b.total - a.total);
}
