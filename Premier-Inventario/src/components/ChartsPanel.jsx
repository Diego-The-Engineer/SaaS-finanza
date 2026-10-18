import { useMemo } from 'react';
import DoughnutChart from './DoughnutChart';
import { resumenPorTipo } from '../utils/movimientos';

const PALETA_INGRESOS = ['#2e7d32', '#1e88e5', '#00acc1', '#7cb342', '#3949ab', '#26a69a', '#c0ca33', '#039be5'];
const PALETA_EGRESOS = ['#e53935', '#fb8c00', '#d81b60', '#8e24aa', '#6d4c41', '#f4511e', '#fdd835', '#5e35b1'];

export default function ChartsPanel({ resumen, nombreConcepto }) {
  const ingresos = useMemo(() => resumenPorTipo(resumen, 'Ingreso', nombreConcepto), [resumen, nombreConcepto]);
  const egresos = useMemo(() => resumenPorTipo(resumen, 'Egreso', nombreConcepto), [resumen, nombreConcepto]);

  return (
    <div className="card">
      <h2>Gráficas de Rendimiento</h2>
      <div className="flex-charts">
        <DoughnutChart titulo="Ingresos por Categoría" datos={ingresos} paleta={PALETA_INGRESOS} />
        <DoughnutChart titulo="Egresos por Categoría" datos={egresos} paleta={PALETA_EGRESOS} />
      </div>
    </div>
  );
}