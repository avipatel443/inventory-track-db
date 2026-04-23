import React, { useState } from 'react';
import { PackageSearch, LayoutDashboard, History, LogOut } from 'lucide-react';
import '../Navbar.css';

const Navbar = ({ currentPage, setCurrentPage, user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isActive = (...pages) => pages.includes(currentPage);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setCurrentPage('dashboard')}>
          <div className="logo-icon">
            <PackageSearch size={24} />
          </div>
          <span className="brand-name">InventoryTrack</span>
        </div>
        
        <ul className="nav-links">
          <li className="nav-item">
            <button 
              className={`nav-btn ${isActive('dashboard') ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-btn ${isActive('products', 'add-product') ? 'active' : ''}`}
              onClick={() => setCurrentPage('products')}
            >
              <PackageSearch size={18} />
              <span>Products</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-btn ${isActive('movements', 'add-movement') ? 'active' : ''}`}
              onClick={() => setCurrentPage('movements')}
            >
              <History size={18} />
              <span>Movements</span>
            </button>
          </li>
        </ul>

        <div className="user-profile">
          <button 
            className="user-profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item disabled">
                <span className="user-email">{user?.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item logout-btn"
                onClick={() => {
                  onLogout();
                  setShowDropdown(false);
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
