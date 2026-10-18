import { useState } from 'react';
import { nombreSucursal } from '../constants';
import { getTodasTransacciones } from '../api/transacciones';
import { exportarExcel } from '../utils/exportExcel';
import { nombreArchivo, rangoDePeriodo } from '../utils/periodo';

export function useExportarExcel(nombreConcepto) {
  const [exportando, setExportando] = useState(false);
  const exportar = async (opciones) => {
    setExportando(true);
    try {
      const datos = await getTodasTransacciones({ tipo: opciones.tipo, ...rangoDePeriodo(opciones) });
      if (datos.length === 0) {
        alert('No hay movimientos con esos filtros.');
        return false;
      }
      await exportarExcel(datos, nombreConcepto, nombreSucursal, nombreArchivo(opciones));
      return true;
    } catch (e) {
      alert(`Error al exportar: ${e.message}`);
      return false;
    } finally {
      setExportando(false);
    }
  };

  return { exportando, exportar };
}