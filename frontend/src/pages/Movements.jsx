import React, { useState, useEffect, useEffectEvent } from 'react';
import { Plus, Loader, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { movementsAPI } from '../services/movementsAPI';
import './Movements.css';

// ── Type badge colours ──────────────────────────────────────────────────────
const TYPE_META = {
  IN:     { label: 'IN',     color: '#10b981', bg: '#d1fae5', icon: ArrowDown },
  OUT:    { label: 'OUT',    color: '#ef4444', bg: '#fee2e2', icon: ArrowUp   },
  ADJUST: { label: 'ADJUST', color: '#f59e0b', bg: '#fef3c7', icon: RefreshCw },
};

// ── main Movements page ─────────────────────────────────────────────────────
const Movements = ({ setCurrentPage }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchData = useEffectEvent(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const res = await movementsAPI.getAll(params);
      setMovements(res.data);
    } catch {
      setError('Failed to load movements.');
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="movements-page">
      <div className="products-header">
        <h1 className="page-title">Stock Movements</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="search-input"
            style={{ width: 'auto', paddingLeft: '0.75rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUST">ADJUST</option>
          </select>
          <button className="primary-btn" onClick={() => setCurrentPage('add-movement')}>
            <Plus size={16} style={{ marginRight: 4 }} /> Log Movement
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader size={28} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading movements…</p>
          </div>
        ) : movements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No movements yet. Log the first one!</p>
            <button
              className="primary-btn"
              style={{ marginTop: '1rem' }}
              onClick={() => setCurrentPage('add-movement')}
            >
              Go to Manual Entry
            </button>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>By</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const meta = TYPE_META[m.type] || TYPE_META.ADJUST;
                const Icon = meta.icon;
                return (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {formatDate(m.created_at)}
                    </td>
                    <td>{m.product_name}</td>
                    <td className="sku-cell">{m.sku}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '2px 10px', borderRadius: '99px',
                          fontSize: '0.78rem', fontWeight: 600,
                          color: meta.color, background: meta.bg,
                        }}
                      >
                        <Icon size={12} />
                        {meta.label}
                      </span>
                    </td>
                    <td className={m.type === 'OUT' ? 'text-danger fw-bold' : ''}>{m.quantity}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.user_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Movements;
