import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="breadcrumbs-bar">
      <div className="container">
        <nav className="breadcrumbs-nav">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <span key={index} className="breadcrumb-item">
                {index > 0 && <span className="breadcrumb-sep">/</span>}
                {isLast || !item.to ? (
                  <span className={`breadcrumb-label ${isLast ? 'current' : ''}`}>
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.to} state={item.state} className="breadcrumb-link">
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
