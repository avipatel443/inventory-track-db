import React from 'react';
import './Card.css';

const Card = ({ title, value, icon: Icon, trend, trendValue }) => {
  return (
    <div className="card-container">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {Icon && <div className="card-icon"><Icon size={20} /></div>}
      </div>
      <div className="card-body">
        <div className="card-value">{value}</div>
        {trend && (
          <div className={`card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
