export const soloFecha = (fecha) => (fecha ? fecha.split('T')[0] : '');

export const formatMonto = (monto) => `$${Number(monto).toFixed(2)}`;

const normalizar = (texto) => String(texto ?? '').toLowerCase().replace(/\s+/g, '');

export function filtrarMovimientos(movimientos, busqueda, nombreConcepto, nombreSucursal) {
  const buscar = normalizar(busqueda);
  if (!buscar) return movimientos;

  return movimientos.filter((m) =>
    [nombreConcepto(m.id_concepto), nombreSucursal(m.id_sucursal), m.notas].some((campo) =>
      normalizar(campo).includes(buscar)
    )
  );
}

export function resumenPorTipo(resumen, tipo, nombreConcepto) {
  return resumen
    .filter((r) => r.id_tipo === tipo)
    .map((r) => ({ nombre: nombreConcepto(r.id_concepto), total: Number(r.total) }))
    .sort((a, b) => b.total - a.total);
}
