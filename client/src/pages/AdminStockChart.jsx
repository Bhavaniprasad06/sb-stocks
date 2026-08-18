import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client';
import LivePriceChart from '../components/LivePriceChart';
import Spinner from '../components/Spinner';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function AdminStockChart() {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('3M');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/stock-chart?symbol=${symbol}&period=${period}`);
      setData(data);
    } catch {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol, period]);

  const up = data ? data.change >= 0 : true;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Stock Chart</h1>
          <p>View any stock's price performance</p>
        </div>
        <span className="pill pill-blue">Admin only</span>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Stock Symbol</label>
            <input
              className="form-control"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              style={{ width: 120 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 22 }}>
            {['1W', '1M', '3M', '6M', '1Y'].map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPeriod(p)}
              >{p}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : data ? (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h2 style={{ fontSize: '1.4rem' }}>{data.symbol}</h2>
              <span className="tag">{data.name}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>{fmt(data.currentPrice)}</span>
              <span className={up ? 'pos' : 'neg'} style={{ fontWeight: 600 }}>
                {up ? '+' : ''}{data.change?.toFixed(2)} ({up ? '+' : ''}{data.changePercent?.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="chart-box">
            <h3>Price History — {period}</h3>
            {data.history.length > 1 ? (
              <LivePriceChart
                history={data.history}
                period={period}
                height={400}
                showVolume={true}
                showSMA={false}
              />
            ) : (
              <p className="empty-state" style={{ padding: 40 }}>Insufficient data for this period.</p>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="big">🔍</div>
          <p>Enter a stock symbol to view its chart.</p>
        </div>
      )}
    </div>
  );
}
