import { soloFecha } from './movimientos';

export async function exportarExcel(movimientos, nombreConcepto, nombreSucursal, archivo) {
  const ExcelJS = (await import('exceljs')).default;
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Movimientos');

  hoja.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Fecha', key: 'fecha', width: 12, style: { numFmt: 'yyyy-mm-dd' } },
    { header: 'Sucursal', key: 'sucursal', width: 28 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Concepto', key: 'concepto', width: 34 },
    { header: 'Monto', key: 'monto', width: 14, style: { numFmt: '$#,##0.00' } },
    { header: 'Notas', key: 'notas', width: 40 },
  ];
  hoja.getRow(1).font = { bold: true };
  hoja.views = [{ state: 'frozen', ySplit: 1 }];

  movimientos.forEach((m) =>
    hoja.addRow({
      id: m.id,
      fecha: m.fecha ? new Date(`${soloFecha(m.fecha)}T00:00:00Z`) : null,
      sucursal: nombreSucursal(m.id_sucursal),
      tipo: m.id_tipo,
      concepto: nombreConcepto(m.id_concepto),
      monto: Number(m.monto),
      notas: m.notas ?? '',
    })
  );

  const ultima = hoja.rowCount;
  hoja.autoFilter = `A1:G${ultima}`;
  hoja.addRow([]);
  [['Total ingresos', 'Ingreso'], ['Total egresos', 'Egreso']].forEach(([etiqueta, tipo]) => {
    const fila = hoja.addRow([]);
    fila.getCell(5).value = etiqueta;
    fila.getCell(5).font = { bold: true };
    fila.getCell(6).value = { formula: `SUMIF(D2:D${ultima},"${tipo}",F2:F${ultima})` };
    fila.getCell(6).numFmt = '$#,##0.00';
    fila.getCell(6).font = { bold: true };
  });

  const buffer = await libro.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = archivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}