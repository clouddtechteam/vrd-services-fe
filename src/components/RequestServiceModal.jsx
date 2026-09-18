import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Calendar,
  FileText,
  Layers,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export const RequestServiceModal = ({ isOpen, onClose, onServiceRequested }) => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: '',
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
        expectedDate: '',
        description: '',
        additionalInfo: ''
      });
    }
  }, [isOpen]);

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

  const selectedTypeObj = serviceTypes.find((st) => st.name === formData.serviceType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceType) {
      setError('Please choose a service type.');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ width: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
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
              <div className="modal-title">Request a Service</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Fill out the service requirements to initiate a new request
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Feedback Alerts */}
            {error && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-banner alert-success">
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>Service request submitted successfully! Initial status: Pending.</span>
              </div>
            )}

            {/* Service Type Dropdown from DB */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Service Type *</span>
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
              {selectedTypeObj?.description && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '0.78rem',
                    color: '#475569',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}
                >
                  <Info size={14} style={{ color: '#2563eb', marginTop: '2px', flexShrink: 0 }} />
                  <span>{selectedTypeObj.description}</span>
                </div>
              )}
            </div>

            {/* Expected Date Picker */}
            <div className="form-group" style={{ marginTop: '16px' }}>
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
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Date on which your organization expects the service to be carried out
              </div>
            </div>

            {/* Description Textarea */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Service Description *</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Specify location, scope, equipment identifiers, or key requirements..."
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Additional Information Textarea */}
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">
                Additional Information <span style={{ textTransform: 'none', fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
              </label>
              <textarea
                name="additionalInfo"
                rows={2}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Access hours, security clearance notes, designated on-site contact..."
                className="form-input"
                style={{ resize: 'vertical', minHeight: '60px' }}
                disabled={submitting}
              />
            </div>

            {/* System Automation Notice */}
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: '0.78rem',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                System automatically assigns a unique <strong>Request ID</strong>, timestamp, and sets initial status to <strong>Pending</strong>.
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || loadingTypes}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default RequestServiceModal;
