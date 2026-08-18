export default function StatCard({ label, value, sub, tone }) {
  const cls = tone === 'green' ? 'pos' : tone === 'red' ? 'neg' : '';
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${cls}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
