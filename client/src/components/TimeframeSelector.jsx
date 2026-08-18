import { useState } from 'react';

const PERIODS = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' },
];

export default function TimeframeSelector({ value = '3M', onChange }) {
  return (
    <div className="timeframe-selector">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          className={`timeframe-btn ${value === p.value ? 'active' : ''}`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
