import { useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatMonto } from '../utils/movimientos';
import '../styles/graficas.css';

ChartJS.register(ArcElement, Tooltip);

const COLOR_OTROS = '#9e9e9e';

const OPCIONES = {
  plugins: {
    legend: { display: false }, 
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatMonto(ctx.parsed)}` } },
  },
};

export default function DoughnutChart({ titulo, datos, paleta }) {
  const [verDetalle, setVerDetalle] = useState(false);
  const total = datos.reduce((suma, d) => suma + d.total, 0);

  const data = useMemo(() => {
    const resto = datos.slice(paleta.length);
    const rebanadas = datos
      .slice(0, paleta.length)
      .map((d, i) => ({ nombre: d.nombre, total: d.total, color: paleta[i] }));
    if (resto.length > 0) {
      rebanadas.push({
        nombre: `Otros (${resto.length})`,
        total: resto.reduce((suma, d) => suma + d.total, 0),
        color: COLOR_OTROS,
      });
    }
    return {
      labels: rebanadas.map((r) => r.nombre),
      datasets: [{ data: rebanadas.map((r) => r.total), backgroundColor: rebanadas.map((r) => r.color) }],
    };
  }, [datos, paleta]);

  return (
    <div className="chart-container">
      <h3>{titulo}</h3>

      {datos.length === 0 ? (
        <p className="chart-vacio">Sin movimientos para mostrar.</p>
      ) : (
        <>
          <p className="chart-resumen">
            {datos.length} {datos.length === 1 ? 'concepto' : 'conceptos'} · Total {formatMonto(total)}
          </p>

          <Doughnut data={data} options={OPCIONES} />

          <button type="button" className="chart-toggle" onClick={() => setVerDetalle((v) => !v)}>
            {verDetalle ? '▲ Ocultar detalle' : '▼ Ver más'}
          </button>

          {verDetalle && (
            <ul className="chart-detalle">
              {datos.map((d, i) => (
                <li key={`${d.nombre}-${i}`}>
                  <span className="chart-punto" style={{ background: paleta[i] ?? COLOR_OTROS }} />
                  <span className="chart-nombre">{d.nombre}</span>
                  <span className="chart-monto">{formatMonto(d.total)}</span>
                  <span className="chart-pct">{total > 0 ? ((d.total / total) * 100).toFixed(1) : '0.0'}%</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}