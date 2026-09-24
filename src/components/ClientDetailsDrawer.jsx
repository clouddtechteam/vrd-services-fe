import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Layers,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileQuestion,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { ServiceStatusControl } from './ServiceStatusControl';

export const ClientDetailsDrawer = ({ client, onClose, onClientUpdated }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Password state for settings tab
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  // Services tab state
  const [clientServices, setClientServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesFetched, setServicesFetched] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        userId: client.userId || '',
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        status: client.status || 'active'
      });
      setFeedback({ type: '', message: '' });
      setPasswordFeedback({ type: '', message: '' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      // Reset services whenever client changes
      setClientServices([]);
      setServicesFetched(false);
    }
  }, [client]);

  // Fetch services when services tab is opened
  useEffect(() => {
    if (activeTab === 'services' && client && !servicesFetched) {
      const fetchClientServices = async () => {
        setServicesLoading(true);
        try {
          const res = await api.get('/services', {
            params: { clientId: client._id, limit: 50 }
          });
          if (res.data.success) {
            // Filter to only this client's services
            const filtered = res.data.data.filter(
              (s) => s.client?._id === client._id || s.client === client._id
            );
            setClientServices(filtered);
          }
        } catch (err) {
          console.error('Failed to fetch client services:', err);
        } finally {
          setServicesLoading(false);
          setServicesFetched(true);
        }
      };
      fetchClientServices();
    }
  }, [activeTab, client, servicesFetched]);

  if (!client) return null;

  const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.userId.trim() || !formData.name.trim() || !formData.email.trim()) {
      setFeedback({ type: 'error', message: 'User ID, full name, and email are required.' });
      return;
    }

    // If new password is provided, validate it
    if (passwordData.newPassword) {
      if (passwordData.newPassword.trim().length < 6) {
        setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
        return;
      }
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = { ...formData };
      if (passwordData.newPassword) {
        payload.password = passwordData.newPassword.trim();
      }

      const res = await api.put(`/clients/${client._id}`, payload);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: passwordData.newPassword
            ? 'Client details and password updated successfully!'
            : 'Client details updated successfully!'
        });
        setPasswordData({ newPassword: '', confirmPassword: '' });
        if (onClientUpdated) {
          onClientUpdated(res.data.data);
        }
        setTimeout(() => {
          setFeedback({ type: '', message: '' });
        }, 3000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update client.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordOnlyUpdate = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      setPasswordFeedback({ type: 'error', message: 'Please enter a new password.' });
      return;
    }
    if (passwordData.newPassword.trim().length < 6) {
      setPasswordFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordFeedback({ type: '', message: '' });

    try {
      const res = await api.put(`/clients/${client._id}`, {
        password: passwordData.newPassword.trim()
      });
      if (res.data.success) {
        setPasswordFeedback({ type: 'success', message: 'Password successfully updated for this client!' });
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const formattedDate = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const handleServiceStatusChanged = (updated) => {
    setClientServices((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-profile-info">
            <div className="drawer-avatar-box">{initial}</div>
            <div className="drawer-name-block">
              <div className="drawer-name-title">{formData.name || client.name}</div>
              <div className="drawer-meta-row">
                <Mail size={13} />
                <span>{formData.email || client.email}</span>
                {(formData.userId || client.userId) && (
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    background: '#eef2ff',
                    color: '#4338ca',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {formData.userId || client.userId}
                  </span>
                )}
                <span className="role-pill client">Client</span>
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} />
            Profile
          </button>
          <button
            className={`drawer-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Layers size={15} />
            Services
            {clientServices.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  minWidth: '17px',
                  height: '17px',
                  padding: '0 4px'
                }}
              >
                {clientServices.length}
              </span>
            )}
          </button>
          <button
            className={`drawer-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={15} />
            Account Settings
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {feedback.message && activeTab !== 'services' && (
            <div className={`alert-banner ${feedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
              {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form id="client-form" onSubmit={handleSave}>
              <div className="form-section-title">Client Information</div>

              <div className="form-group">
                <label className="form-label">User ID *</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Unique User ID"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="form-input"
                />
              </div>

              <div className="form-section-title" style={{ marginTop: '24px' }}>
                Account Details
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" value="Client" disabled className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Joined</label>
                  <input type="text" value={formattedDate} disabled className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Client ID</label>
                <input
                  type="text"
                  value={client._id}
                  disabled
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </div>
            </form>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div>
              {servicesLoading ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b' }}>
                  <Loader2 size={28} className="spin" style={{ color: '#2563eb', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '0.875rem' }}>Loading service requests...</div>
                </div>
              ) : clientServices.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b' }}>
                  <FileQuestion size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '6px', fontSize: '1rem' }}>
                    No Service Requests
                  </h4>
                  <p style={{ fontSize: '0.825rem' }}>
                    This client has not submitted any service requests yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-section-title">
                    {clientServices.length} Service {clientServices.length === 1 ? 'Request' : 'Requests'}
                  </div>
                  {clientServices.map((svc) => {
                    const isPending = svc.status === 'Pending';
                    const isCompleted = svc.status === 'Completed';
                    const isCancelled = svc.status === 'Cancelled';
                    const expDate = svc.expectedDate
                      ? new Date(svc.expectedDate).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : 'N/A';
                    const reqDate = svc.requestDate || svc.createdAt
                      ? new Date(svc.requestDate || svc.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : 'N/A';

                    return (
                      <div
                        key={svc._id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {/* Top row: ID + status badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                            {svc.requestId}
                          </span>
                          <span className={`status-badge ${svc.status.toLowerCase()}`}>
                            {isPending ? <Clock size={11} /> : isCompleted ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            <span>{svc.status}</span>
                          </span>
                        </div>

                        {/* Service type */}
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b' }}>
                          {svc.serviceType}
                        </div>

                        {/* Dates row */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.775rem', color: '#64748b' }}>
                            <Clock size={12} />
                            <span>Requested: {reqDate}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.775rem', color: '#2563eb', fontWeight: 600 }}>
                            <Calendar size={12} />
                            <span>Expected: {expDate}</span>
                          </div>
                        </div>

                        {/* Description snippet */}
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#475569',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={svc.description}
                        >
                          {svc.description}
                        </div>

                        {/* Status control (admin only) */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <ServiceStatusControl
                            service={svc}
                            onStatusChanged={handleServiceStatusChanged}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <div className="form-section-title">Account Security</div>
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                  form="client-form"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', marginBottom: '22px' }}>
                Deactivating this client will prevent them from signing in to the client portal.
              </p>

              {/* CHANGE PASSWORD SETTINGS OPTION */}
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={15} style={{ color: '#2563eb' }} />
                <span>Change Password</span>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginTop: '10px'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                  Assign a new password for this client to sign into their portal account.
                </div>

                {passwordFeedback.message && (
                  <div
                    className={`alert-banner ${passwordFeedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}
                    style={{ marginBottom: '14px' }}
                  >
                    {passwordFeedback.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="Enter minimum 6 characters"
                      className="form-input"
                      style={{ paddingRight: '40px' }}
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
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      placeholder="Re-enter new password"
                      className="form-input"
                      style={{ paddingRight: '40px' }}
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
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Password must be at least 6 characters.
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordOnlyUpdate}
                    disabled={passwordSaving || !passwordData.newPassword}
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                    }}
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 size={13} className="spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          {activeTab === 'services' ? (
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          ) : (
            <button
              type="submit"
              form="client-form"
              className="btn-save"
              disabled={saving}
              onClick={activeTab === 'settings' ? handleSave : undefined}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
