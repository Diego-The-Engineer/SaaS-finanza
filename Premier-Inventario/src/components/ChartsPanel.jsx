import { useMemo } from 'react';
import DoughnutChart from './DoughnutChart';
import { agruparPorConcepto } from '../utils/movimientos';

const COLORES_INGRESOS = ['#4caf50', '#2196f3', '#00bcd4', '#8bc34a', '#ffc107'];
const COLORES_EGRESOS = ['#f44336', '#ff9800', '#e91e63', '#9c27b0', '#795548'];

export default function ChartsPanel({ movimientos, nombreConcepto }) {
  const ingresos = useMemo(
    () => agruparPorConcepto(movimientos, 'Ingreso', nombreConcepto),
    [movimientos, nombreConcepto]
  );
  const egresos = useMemo(
    () => agruparPorConcepto(movimientos, 'Egreso', nombreConcepto),
    [movimientos, nombreConcepto]
  );

  return (
    <div className="card">
      <h2>Gráficas de Rendimiento</h2>
      <div className="flex-charts">
        <DoughnutChart titulo="Ingresos por Categoría" datos={ingresos} colores={COLORES_INGRESOS} />
        <DoughnutChart titulo="Egresos por Categoría" datos={egresos} colores={COLORES_EGRESOS} />
      </div>
    </div>
  );
}
