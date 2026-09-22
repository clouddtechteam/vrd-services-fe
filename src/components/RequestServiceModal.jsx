import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Calendar,
  Layers,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Store,
  Hash,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RequestServiceModal = ({ isOpen, onClose, onServiceRequested }) => {
  const { user } = useAuth();
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: '',
    managerName: '',
    storeName: '',
    storeCode: '',
    email: '',
    phone: '',
    expectedDate: '',
    description: '',
    additionalInfo: ''
  });

  // Calculate today's date formatted as YYYY-MM-DD for min date
  const todayDateString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      fetchServiceTypes();
      setError('');
      setSuccess(false);
      setFormData({
        serviceType: '',
        managerName: user?.name || '',
        storeName: user?.company || '',
        storeCode: '',
        email: user?.email || '',
        phone: user?.phone || '',
        expectedDate: '',
        description: '',
        additionalInfo: ''
      });
    }
  }, [isOpen, user]);

  const fetchServiceTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await api.get('/service-types');
      if (res.data.success) {
        setServiceTypes(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            serviceType: prev.serviceType || res.data.data[0].name
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load service types from DB:', err);
      setError('Failed to load available service types from database.');
    } finally {
      setLoadingTypes(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceType) {
      setError('Please choose a service type.');
      return;
    }
    if (!formData.managerName.trim()) {
      setError('Please enter the manager name.');
      return;
    }
    if (!formData.storeName.trim()) {
      setError('Please enter the store name.');
      return;
    }
    if (!formData.storeCode.trim()) {
      setError('Please enter the store code.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter an email address.');
      return;
    }
    if (!formData.expectedDate) {
      setError('Please select an expected completion date.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for your service request.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/services', formData);
      if (res.data.success) {
        setSuccess(true);
        if (onServiceRequested) {
          onServiceRequested(res.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-modal-backdrop" onClick={onClose}>
      <div
        className="split-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="split-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <PlusCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {formData.serviceType || 'New Service Request'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Fill out the required store specifications to initiate service workflow
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* 70 / 30 Body */}
        <div className="split-modal-body">
          {/* Left Panel - 70% Form */}
          <div className="split-panel-70">
            <form onSubmit={handleSubmit} id="request-service-form">
              {error && (
                <div className="alert-banner alert-danger" style={{ marginBottom: '14px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert-banner alert-success" style={{ marginBottom: '14px' }}>
                  <CheckCircle size={16} style={{ flexShrink: 0 }} />
                  <span>Service request created successfully! Initial status set to Pending.</span>
                </div>
              )}

              {/* Service Type Selection */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Service Category *</span>
                  {loadingTypes && (
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="spin" /> Loading categories...
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="form-input"
                    style={{ paddingLeft: '38px', appearance: 'auto' }}
                    disabled={loadingTypes || submitting}
                    required
                  >
                    {serviceTypes.map((st) => (
                      <option key={st._id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <Layers
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Two Column Grid for Manager Name & Store Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Manager Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="managerName"
                      value={formData.managerName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                      required
                    />
                    <User
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Store Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="e.g. Downtown Branch #12"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                      required
                    />
                    <Store
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Two Column Grid for Store Code & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Store Code *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="storeCode"
                      value={formData.storeCode}
                      onChange={handleChange}
                      placeholder="e.g. STR-4029"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                      required
                    />
                    <Hash
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="manager@store.com"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                      required
                    />
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Two Column Grid for Phone (Optional) & Expected Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span style={{ textTransform: 'none', fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                    />
                    <Phone
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Date *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      name="expectedDate"
                      min={todayDateString}
                      value={formData.expectedDate}
                      onChange={handleChange}
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      disabled={submitting}
                      required
                    />
                    <Calendar
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide scope, equipment identifiers, specific requirements, or access notes..."
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', paddingTop: '6px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || loadingTypes}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                    padding: '10px 24px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      <span>Submit</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - 30% Task Flow */}
          <div className="split-panel-30">
            <div className="taskflow-header">
              <div className="taskflow-title">
                <Clock size={16} style={{ color: '#2563eb' }} />
                <span>Task Flow</span>
              </div>
              <div className="taskflow-subtitle">
                Workflow stages for this service request
              </div>
            </div>

            <div className="taskflow-list">
              {/* Step 1: Pending */}
              <div className="taskflow-step active-step">
                <div className="taskflow-step-icon-wrap">
                  <Clock size={18} />
                </div>
                <div className="taskflow-step-content">
                  <div className="taskflow-step-label">
                    <span>1. Pending</span>
                    <span className="status-green-dot" title="Initial active state" />
                  </div>
                  <div className="taskflow-step-desc">
                    Initial status upon submitting. Queued for admin dispatch.
                  </div>
                </div>
              </div>

              {/* Step 2: In Progress */}
              <div className="taskflow-step">
                <div className="taskflow-step-icon-wrap" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
                  <ArrowRight size={16} />
                </div>
                <div className="taskflow-step-content">
                  <div className="taskflow-step-label" style={{ color: '#64748b' }}>
                    <span>2. In Progress</span>
                  </div>
                  <div className="taskflow-step-desc">
                    Technicians assigned and service actively underway.
                  </div>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div className="taskflow-step">
                <div className="taskflow-step-icon-wrap" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="taskflow-step-content">
                  <div className="taskflow-step-label" style={{ color: '#64748b' }}>
                    <span>3. Completed</span>
                  </div>
                  <div className="taskflow-step-desc">
                    Service successfully performed and closed out.
                  </div>
                </div>
              </div>
            </div>

            {/* Microcopy footer */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.73rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Info size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
              <span>
                System automatically initializes requests at the <strong>Pending</strong> stage.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RequestServiceModal;
