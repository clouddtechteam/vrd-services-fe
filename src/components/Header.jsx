import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export const Header = ({ breadcrumb = 'Clients' }) => {
  return (
    <div className="breadcrumb-bar">
      <span>
        <Home size={14} />
        Dashboard
      </span>
      <ChevronRight size={13} />
      <span className="breadcrumb-active">{breadcrumb}</span>
    </div>
  );
};
