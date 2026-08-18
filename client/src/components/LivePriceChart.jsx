import { useRef, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fmtDate = (d, period) => {
  const date = new Date(d);
  if (period === '1D' || period === '5D') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function LivePriceChart({
  history = [],
  period = '3M',
  height = 400,
  showVolume = true,
  showSMA = true,
}) {
  const chartRef = useRef(null);

  const labels = useMemo(
    () => history.map((h) => fmtDate(h.date, period)),
    [history, period]
  );

  const prices = useMemo(() => history.map((h) => h.price), [history]);
  const volumes = useMemo(() => history.map((h) => h.volume || 0), [history]);
  const sma20Data = useMemo(() => history.map((h) => h.sma20), [history]);
  const sma50Data = useMemo(() => history.map((h) => h.sma50), [history]);

  const up = prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true;
  const mainColor = up ? '#00ff88' : '#ff3366';
  const mainColorAlpha = up ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,102,0.15)';

  const maxVolume = Math.max(...volumes, 1);

  const chartData = {
    labels,
    datasets: [
      // Volume bars (behind everything)
      ...(showVolume && volumes.some((v) => v > 0)
        ? [
            {
              label: 'Volume',
              data: volumes,
              type: 'bar',
              yAxisID: 'volume',
              backgroundColor: history.map((h, i) => {
                if (i === 0) return 'rgba(79,140,255,0.15)';
                return h.price >= history[i - 1].price
                  ? 'rgba(0,255,136,0.12)'
                  : 'rgba(255,51,102,0.12)';
              }),
              borderColor: 'transparent',
              borderWidth: 0,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
              order: 3,
            },
          ]
        : []),
      // SMA 50 line
      ...(showSMA
        ? [
            {
              label: 'SMA 50',
              data: sma50Data,
              borderColor: '#ff9500',
              borderWidth: 1.5,
              borderDash: [6, 3],
              pointRadius: 0,
              pointHitRadius: 0,
              fill: false,
              tension: 0.3,
              order: 1,
            },
          ]
        : []),
      // SMA 20 line
      ...(showSMA
        ? [
            {
              label: 'SMA 20',
              data: sma20Data,
              borderColor: '#4f8cff',
              borderWidth: 1.5,
              borderDash: [4, 2],
              pointRadius: 0,
              pointHitRadius: 0,
              fill: false,
              tension: 0.3,
              order: 1,
            },
          ]
        : []),
      // Main price line
      {
        label: 'Price',
        data: prices,
        borderColor: mainColor,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return 'transparent';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, mainColorAlpha);
          gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
          return gradient;
        },
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHitRadius: 10,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: mainColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
        order: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,10,15,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#8b95a9',
        bodyColor: '#e6ebf4',
        titleFont: { size: 11 },
        bodyFont: { size: 13, weight: '600', family: "'JetBrains Mono', monospace" },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (ctx) => {
            if (ctx.dataset.label === 'Volume') {
              return `  Vol: ${Number(ctx.parsed.y).toLocaleString()}`;
            }
            if (ctx.dataset.label?.startsWith('SMA')) {
              return `  ${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(2)}`;
            }
            return `  Price: $${Number(ctx.parsed.y).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: '#5c6679',
          maxTicksLimit: 8,
          maxRotation: 0,
          font: { size: 11 },
        },
        border: { display: false },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: '#8b95a9',
          callback: (v) => `$${v}`,
          font: { size: 11, family: "'JetBrains Mono', monospace" },
        },
        border: { display: false },
      },
      ...(showVolume
        ? {
            volume: {
              position: 'left',
              display: false,
              beginAtZero: true,
              max: maxVolume * 4,
              grid: { display: false },
            },
          }
        : {}),
    },
  };

  return (
    <div className="live-chart-container" style={{ height, position: 'relative' }}>
      {prices.length > 0 && (
        <div className={`live-chart-badge ${up ? 'up' : 'down'}`}>
          {up ? '▲' : '▼'} LIVE
        </div>
      )}
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
