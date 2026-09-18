import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/clients');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@vrdgroups.com');
    setPassword('password123');
    setError('');
  };

  const fillClient = () => {
    setEmail('john.doe@vrdgroups.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-box">
            <Layers size={32} />
          </div>
          <h1 className="login-heading">VRD Service Management</h1>
          <p className="login-subheading">
            Sign in to access your administrative or client workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@vrdgroups.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              marginTop: '24px',
              fontSize: '0.95rem'
            }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Client Registration Policy Notice */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#64748b',
          lineHeight: '1.4'
        }}>
          Client registration is restricted. Client accounts are exclusively provisioned by administrators.
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="quick-seed-box">
          <div className="quick-seed-title">
            <ShieldCheck size={15} style={{ color: '#2563eb' }} />
            Quick Demo Credentials (Click to Fill):
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={fillAdmin}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#1e40af'
              }}
            >
              Fill Admin (admin@vrdgroups.com)
            </button>
            <button
              type="button"
              onClick={fillClient}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#475569'
              }}
            >
              Fill Client (john.doe@vrdgroups.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
