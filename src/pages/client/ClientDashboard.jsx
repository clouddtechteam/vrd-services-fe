import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { ClientServicesPage } from './ClientServicesPage';
import { RequestServiceModal } from '../../components/RequestServiceModal';
import {
  LayoutDashboard,
  Layers,
  Clock,
  FileText,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const ClientOverview = ({ onOpenRequestModal }) => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services/my-services');
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load services for overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const pendingCount = services.filter((s) => s.status === 'Pending').length;
  const completedCount = services.filter((s) => s.status === 'Completed').length;

  return (
    <div className="main-container">
      <Header breadcrumb="Client Portal" />

      {/* Welcome Banner */}
      <div className="management-banner">
        <div className="banner-left">
          <div
            className="banner-icon-badge"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }}
          >
            <LayoutDashboard size={28} />
          </div>
          <div>
            <div className="banner-title">Welcome, {user?.name || 'Client'}</div>
            <div className="banner-subtitle">
              VRD Client Service Portal • Organization: {user?.company || 'Authorized Client'}
            </div>
          </div>
        </div>

        {/* Top-Right Request Service Button (Requirement 5) */}
        <div className="banner-actions">
          <button
            className="btn-primary"
            onClick={onOpenRequestModal}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
            }}
          >
            <PlusCircle size={17} />
            <span>Request Service</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}
      >
        <div className="data-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Service Requests</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {loading ? <Loader2 size={18} className="spin" /> : `${services.length} Total`}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            All active & fulfilled requests recorded under your client account.
          </p>
        </div>

        <div className="data-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pending Execution</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
                {loading ? <Loader2 size={18} className="spin" /> : `${pendingCount} In Progress`}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Services undergoing admin assessment, coordination, or field dispatch.
          </p>
        </div>

        <div className="data-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Completed Services</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                {loading ? <Loader2 size={18} className="spin" /> : `${completedCount} Completed`}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Fully certified and completed service assignments.
          </p>
        </div>
      </div>

      {/* Quick Navigation Card */}
      <div className="data-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Manage Your Services & Review Schedules
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            View detailed timestamps, expected dates, and status progression for all your contracts.
          </p>
        </div>
        <Link
          to="/client/services"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <span>Go to My Services</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

const ClientProfile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setFeedback({ type: 'error', message: 'Please enter a new password.' });
      return;
    }
    if (newPassword.trim().length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.put('/auth/update-password', {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim()
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Your password has been updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="main-container">
      <Header breadcrumb="Client Profile" />
      <div className="management-banner">
        <div className="banner-left">
          <div className="banner-icon-badge" style={{ background: '#6366f1' }}>
            <UserIcon size={28} />
          </div>
          <div>
            <div className="banner-title">CLIENT ACCOUNT DETAILS</div>
            <div className="banner-subtitle">Credentials & Organization Profile</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1000px' }}>
        {/* Account Details Card */}
        <div className="data-card" style={{ padding: '24px' }}>
          <div className="form-section-title" style={{ marginBottom: '18px' }}>
            Profile Overview
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={user?.name || ''} readOnly disabled />
          </div>
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Email Address</label>
            <input className="form-input" value={user?.email || ''} readOnly disabled />
          </div>
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Company / Organization</label>
            <input className="form-input" value={user?.company || 'N/A'} readOnly disabled />
          </div>
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Contact Phone</label>
            <input className="form-input" value={user?.phone || 'N/A'} readOnly disabled />
          </div>
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Role</label>
            <input className="form-input" value="Authorized Client" readOnly disabled />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="data-card" style={{ padding: '24px' }}>
          <div className="form-section-title" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#2563eb' }} />
            <span>Account Security & Password</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '18px' }}>
            Update your account password to keep your client portal access secure.
          </p>

          {feedback.message && (
            <div
              className={`alert-banner ${feedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}
              style={{ marginBottom: '16px' }}
            >
              {feedback.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input"
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={savingPassword}
              style={{
                width: '100%',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {savingPassword ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Save New Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const ClientDashboard = () => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route
            path="dashboard"
            element={<ClientOverview onOpenRequestModal={() => setIsRequestModalOpen(true)} />}
          />
          <Route path="services" element={<ClientServicesPage />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="*" element={<Navigate to="services" replace />} />
        </Routes>
      </main>

      {/* Global Request Service Modal */}
      <RequestServiceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onServiceRequested={() => {
          // Can redirect or trigger refresh
          window.location.href = '/client/services';
        }}
      />
    </div>
  );
};
export default ClientDashboard;
