import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { placeTrade, fetchPortfolio } from '../redux/slices/portfolioSlice';
import { fetchTransactions } from '../redux/slices/transactionSlice';

const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });

export default function TradeModal({ stock, mode, onClose, onSuccess }) {
  const [shares, setShares] = useState('');
  const dispatch = useDispatch();
  const trading = useSelector((state) => state.portfolio.trading);
  const cash = useSelector((state) => state.portfolio.cash);
  const holdings = useSelector((state) => state.portfolio.holdings);

  const holding = holdings.find((h) => h.stockId === stock._id);
  const ownedShares = holding ? holding.shares : 0;
  const isBuy = mode === 'buy';
  const quantity = Number(shares) || 0;
  const total = quantity * stock.price;

  const canSubmit =
    quantity > 0 &&
    Number.isInteger(quantity) &&
    (isBuy ? total <= cash : quantity <= ownedShares);

  const handleSubmit = async () => {
    const result = await dispatch(placeTrade({ stockId: stock._id, shares: quantity, type: mode }));
    if (placeTrade.fulfilled.match(result)) {
      toast.success(
        isBuy
          ? `Bought ${quantity} share(s) of ${stock.symbol}`
          : `Sold ${quantity} share(s) of ${stock.symbol}`
      );
      dispatch(fetchPortfolio());
      dispatch(fetchTransactions());
      onSuccess?.(result.payload);
      onClose();
    } else {
      toast.error(result.payload || 'Trade failed');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {isBuy ? 'Buy' : 'Sell'} {stock.symbol}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
            {stock.name} · Current price <strong style={{ color: 'var(--text)' }}>{fmt(stock.price)}</strong>
          </p>

          {!isBuy && (
            <div className="tag" style={{ marginBottom: 14 }}>
              You own {ownedShares} share{ownedShares === 1 ? '' : 's'}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="shares">Number of shares</label>
            <input
              id="shares"
              className="form-control"
              type="number"
              min="1"
              max={isBuy ? undefined : ownedShares}
              placeholder="e.g. 10"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
            <div className="form-hint">
              {quantity > 0 && (
                <>
                  Total: <strong className={isBuy ? 'pos' : 'neg'}>{fmt(total)}</strong>
                  {isBuy && (
                    <>
                      {' '}
                      · Available cash: {fmt(cash)}
                      {total > cash && <span className="error-text" style={{ display: 'block' }}>Insufficient funds</span>}
                    </>
                  )}
                  {!isBuy && quantity > ownedShares && (
                    <span className="error-text" style={{ display: 'block' }}>You cannot sell more than you own</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className={`btn ${isBuy ? 'btn-green' : 'btn-red'}`}
              disabled={!canSubmit || trading}
              onClick={handleSubmit}
            >
              {trading ? 'Processing…' : `${isBuy ? 'Buy' : 'Sell'} ${stock.symbol}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
