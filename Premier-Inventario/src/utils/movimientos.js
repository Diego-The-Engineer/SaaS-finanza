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

export function agruparPorConcepto(movimientos, tipo, nombreConcepto) {
  return movimientos
    .filter((m) => m.id_tipo === tipo)
    .reduce((acc, m) => {
      const nombre = nombreConcepto(m.id_concepto);
      acc[nombre] = (acc[nombre] || 0) + Number(m.monto);
      return acc;
    }, {});
}
