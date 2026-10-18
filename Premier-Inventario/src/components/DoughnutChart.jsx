import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
export default function DoughnutChart({ titulo, datos, colores }) {
  const data = {
    labels: Object.keys(datos),
    datasets: [{ data: Object.values(datos), backgroundColor: colores }],
  };

  return (
    <div className="chart-container">
      <h3>{titulo}</h3>
      <Doughnut data={data} />
    </div>
  );
}
