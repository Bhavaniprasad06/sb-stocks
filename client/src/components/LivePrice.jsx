import { useEffect, useRef, useState } from 'react';

export default function LivePrice({ price, change, changePercent, size = 'lg' }) {
  const [flash, setFlash] = useState(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      setFlash(price > prevPrice.current ? 'up' : 'down');
      prevPrice.current = price;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [price]);

  const up = change >= 0;
  const fmt = (n) =>
    Number(n || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  const fmtNum = (n) =>
    Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  const sizeClass = size === 'lg' ? 'live-price-lg' : size === 'md' ? 'live-price-md' : 'live-price-sm';

  return (
    <span className={`live-price ${sizeClass} ${flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''}`}>
      <span className="live-price-value">{fmt(price)}</span>
      <span className={`live-price-change ${up ? 'pos' : 'neg'}`}>
        {up ? '▲' : '▼'} {up ? '+' : ''}{fmtNum(change)} ({up ? '+' : ''}{fmtNum(changePercent)}%)
      </span>
    </span>
  );
}
