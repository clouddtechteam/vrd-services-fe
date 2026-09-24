import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Wrench,
  ShieldCheck,
  User,
  LogOut,
  Layers,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile top bar - hamburger */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-icon-box" style={{ width: 34, height: 34, fontSize: '0.95rem' }}>
            <img src="/LOGO.jpg" alt="Logo" style={{
              width: "120px", height: "60px", objectFit: "contain", transform: "translateX(25px)",
              marginLeft: "25px"
            }} />          </div>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Mobile close button inside sidebar */}
        <button
          className="sidebar-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="sidebar-header">
          <div
            className="brand-icon-box"
            style={{
              width: "180px",
              height: "90px",
              marginLeft: "-10px",
              flexShrink: 0
            }}
          >
            <img
              src="/LOGO.jpg"
              alt="Logo"
              style={{
                width: "180px",
                height: "90px",
                objectFit: "contain",
                transform: "translateX(20px)",
                maxWidth: "none"
              }}
            />
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="user-profile-badge">
          <div className="user-badge-avatar">
            <User size={18} />
          </div>
          <div className="user-badge-meta">
            {/* User ID above Name */}
            <div
              className="user-badge-id"
              style={{
                fontSize: '0.72rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 700,
                color: '#93c5fd',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={user?.userId || (isAdmin ? 'ADMIN' : '')}
            >
              {user?.userId || (isAdmin ? 'ADMIN' : (user?.id ? `ID: ${user.id.slice(-6).toUpperCase()}` : 'CLIENT'))}
            </div>
            <div className="user-badge-name" title={user?.name || 'User'}>
              {user?.name || 'User'}
            </div>
            <div className="user-badge-role">{isAdmin ? 'Admin' : 'Client'}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <NavLink
                to="/admin/analytics"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                <span>Analytics</span>
              </NavLink>

              <NavLink
                to="/admin/clients"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>Clients</span>
              </NavLink>

              <NavLink
                to="/admin/services"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Wrench size={18} />
                <span>Services</span>
              </NavLink>


            </>
          ) : (
            <>
              <NavLink
                to="/client/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/client/services"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Layers size={18} />
                <span>My Services</span>
              </NavLink>

              <NavLink
                to="/client/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Profile</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout at Bottom */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
