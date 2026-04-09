import React, { useState } from 'react';
import Card from '../components/Card';
import { Package, AlertOctagon, TrendingUp, DollarSign } from 'lucide-react';
import '../Dashboard.css';

const Dashboard = ({ setCurrentPage }) => {
 
  const [summary] = useState({
    totalProducts: 124,
    lowStock: 4,
    recentMovements: 32,
    inventoryValue: "$12,450"
  });

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      <h2 style={{color: '#4F46E5', marginBottom: '1rem'}}>Phase 1: Hello React Cleanup</h2>
      
      <div className="dashboard-grid">
        <Card 
          title="Total Products" 
          value={summary.totalProducts} 
          icon={Package} 
          trend="up"
          trendValue="12% from last month"
        />
        <Card 
          title="Low Stock Items" 
          value={summary.lowStock} 
          icon={AlertOctagon} 
          trend="down"
          trendValue="Needs attention"
        />
        <Card 
          title="Recent Movements" 
          value={summary.recentMovements} 
          icon={TrendingUp} 
          trend="up"
          trendValue="This week"
        />
        <Card 
          title="Inventory Value" 
          value={summary.inventoryValue} 
          icon={DollarSign} 
        />
      </div>

      <div className="dashboard-actions">
        <button className="primary-btn" onClick={() => setCurrentPage('products')}>
          Manage Products
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
