import React, { useState, useEffect } from 'react';
import { Package, AlertOctagon, TrendingUp, DollarSign } from 'lucide-react';
import Card from '../components/Card';
import { productsAPI } from '../services/productsAPI';
import { movementsAPI } from '../services/movementsAPI';
import { authAPI } from '../services/authAPI';
import '../Dashboard.css';

const Dashboard = ({ setCurrentPage }) => {
  const [summary, setSummary] = useState({
    totalProducts: '—',
    lowStock: '—',
    recentMovements: '—',
    inventoryValue: '—',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authAPI.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [productsRes, movementsRes] = await Promise.all([
          productsAPI.getAll({ active: 'true' }),
          movementsAPI.getAll(),
        ]);

        const products = productsRes.data;
        const movements = movementsRes.data;

        // Count low stock items
        const lowStockCount = products.filter(
          (p) => p.on_hand <= p.reorder_level
        ).length;

        // Count movements in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = movements.filter(
          (m) => new Date(m.created_at) >= sevenDaysAgo
        ).length;

        // Calculate total inventory value
        const totalValue = products.reduce(
          (sum, p) => sum + Number(p.on_hand || 0) * Number(p.unit_cost || 0),
          0
        );

        setSummary({
          totalProducts: products.length,
          lowStock: lowStockCount,
          recentMovements: recentCount,
          inventoryValue: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        });
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <Card
          title="Total Products"
          value={loading ? '...' : summary.totalProducts}
          icon={Package}
          trend="up"
          trendValue="Active products"
        />
        <Card
          title="Low Stock Items"
          value={loading ? '...' : summary.lowStock}
          icon={AlertOctagon}
          trend={summary.lowStock > 0 ? 'down' : 'up'}
          trendValue={summary.lowStock > 0 ? 'Needs attention' : 'All stocked'}
        />
        <Card
          title="Recent Movements"
          value={loading ? '...' : summary.recentMovements}
          icon={TrendingUp}
          trend="up"
          trendValue="Last 7 days"
        />
        <Card
          title="Inventory Value"
          value={loading ? '...' : summary.inventoryValue}
          icon={DollarSign}
        />
      </div>

      <div className="dashboard-actions">
        <p className="dashboard-actions-copy">Manual entry and review</p>
        {isAdmin && (
          <button className="primary-btn" onClick={() => setCurrentPage('add-product')}>
            Add Product
          </button>
        )}
        <button
          className="primary-btn dashboard-secondary-btn"
          onClick={() => setCurrentPage('add-movement')}
        >
          Log Movement
        </button>
        <button className="primary-btn dashboard-outline-btn" onClick={() => setCurrentPage('products')}>
          Browse Products
        </button>
        <button className="primary-btn dashboard-outline-btn" onClick={() => setCurrentPage('movements')}>
          Movement History
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
