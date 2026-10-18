import { soloFecha } from './movimientos';

const comillas = (texto) => `"${String(texto ?? '').replace(/"/g, '""')}"`;

export function exportarCSV(movimientos, nombreConcepto, nombreSucursal, archivo = 'reporte_finanzas.csv') {
  const encabezados = ['ID', 'Fecha', 'Sucursal', 'Tipo', 'Concepto', 'Monto', 'Notas'];
  const filas = movimientos.map((m) => [
    m.id,
    soloFecha(m.fecha),
    comillas(nombreSucursal(m.id_sucursal)),
    m.id_tipo,
    comillas(nombreConcepto(m.id_concepto)),
    m.monto,
    comillas(m.notas),
  ]);

  const csv = '\uFEFF' + [encabezados, ...filas].map((f) => f.join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));

  const link = document.createElement('a');
  link.href = url;
  link.download = archivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
