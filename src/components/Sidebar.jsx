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
<img src="/favicon.jpg" alt="Logo" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }} />          </div>
          <span className="brand-title" style={{ fontSize: '0.95rem' }}>VRD Groups</span>
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
          <div className="brand-icon-box">
<img src="/favicon.jpg" alt="Logo" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }} />          </div>
          <div className="brand-info">
            <div className="brand-title">VRD Groups</div>
            <div className="brand-subtitle">Service Management</div>
          </div>
        </div>

        {/* User Profile Snippet */}
        <div className="user-profile-badge">
          <div className="user-badge-avatar">
            <User size={18} />
          </div>
          <div className="user-badge-meta">
            <div className="user-badge-name">{user?.name || 'User'}</div>
            <div className="user-badge-role">{user?.role === 'admin' ? 'Admin' : 'Client'}</div>
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
