import React from 'react';
import { PackageSearch, LayoutDashboard, History, Settings } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo-icon">
            <PackageSearch size={24} />
          </div>
          <span className="brand-name">InventoryTrack</span>
        </div>
        
        <ul className="nav-links">
          <li className="nav-item">
            <button 
              className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-btn ${currentPage === 'products' ? 'active' : ''}`}
              onClick={() => setCurrentPage('products')}
            >
              <PackageSearch size={18} />
              <span>Products</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-btn ${currentPage === 'movements' ? 'active' : ''}`}
              onClick={() => setCurrentPage('movements')}
            >
              <History size={18} />
              <span>Movements</span>
            </button>
          </li>
        </ul>

        <div className="user-profile">
          <div className="user-avatar">AD</div>
          <span className="user-name">Avi D. Patel</span>
          <Settings size={18} className="settings-icon"/>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
