import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PriceChart({ labels, data, label = 'Price', height = 280 }) {
  const up = data.length > 1 ? data[data.length - 1] >= data[0] : true;
  const color = up ? '#22c55e' : '#ef4444';

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return 'transparent';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, up ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)');
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          return gradient;
        },
        fill: true,
        tension: 0.3,
        pointRadius: data.length === 1 ? 5 : 0,
        pointHitRadius: 8,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2130',
        borderColor: '#232c3d',
        borderWidth: 1,
        titleColor: '#e6ebf4',
        bodyColor: '#e6ebf4',
        callbacks: {
          label: (ctx) => ` $${Number(ctx.parsed.y).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(35,44,61,0.4)' },
        ticks: { color: '#8b95a9', maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        grid: { color: 'rgba(35,44,61,0.4)' },
        ticks: { color: '#8b95a9', callback: (v) => `$${v}` },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
