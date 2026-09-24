import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields (User ID, Name, Email, Password).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/clients', {
        ...formData,
        userId: formData.userId.trim(),
        email: formData.email.trim()
      });
      if (res.data.success) {
        onClientAdded(res.data.data);
        onClose();
        setFormData({
          userId: '',
          name: '',
          email: '',
          password: '',
          phone: '',
          company: '',
          status: 'active'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={18} />
            </div>
            <div className="modal-title">Register New Client</div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">User ID *</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                placeholder="e.g. CLI-1001 or VRD-CLI-01"
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Unique identifier used by the client to sign in.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
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
                placeholder="e.g. client@domain.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="form-input"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
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
                <label className="form-label">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
