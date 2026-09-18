import React, { useState } from 'react';
import {
  X,
  Layers,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ServiceStatusControl } from './ServiceStatusControl';

export const ServiceRequestDetailsDrawer = ({ service, onClose, onServiceUpdated }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  if (!service) return null;

  const isAdmin = user?.role === 'admin';
  const isCompleted = service.status === 'Completed';
  const isCancelled = service.status === 'Cancelled';
  const isPending = service.status === 'Pending';

  // Icon & gradient by status
  const headerGradient = isCompleted
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : isCancelled
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

  const headerShadow = isCompleted
    ? '0 4px 12px rgba(16, 185, 129, 0.35)'
    : isCancelled
    ? '0 4px 12px rgba(239, 68, 68, 0.35)'
    : '0 4px 12px rgba(245, 158, 11, 0.35)';

  const HeaderIcon = isCompleted ? CheckCircle2 : isCancelled ? XCircle : Clock;

  const formattedRequestDate = service.requestDate || service.createdAt
    ? new Date(service.requestDate || service.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  const formattedExpectedDate = service.expectedDate
    ? new Date(service.expectedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const handleStatusChanged = (updated) => {
    setFeedback({ type: 'success', message: `Status updated to "${updated.status}" successfully!` });
    if (onServiceUpdated) {
      onServiceUpdated(updated);
    }
    // Clear feedback after 3s
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: headerGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: headerShadow,
                flexShrink: 0
              }}
            >
              <HeaderIcon size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {service.requestId}
                </span>
                <span className={`status-badge ${service.status.toLowerCase()}`}>
                  {service.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Service Request Overview
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Feedback */}
          {feedback.message && (
            <div className={`alert-banner ${feedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
              {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Service Information Box */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div className="form-section-title">Service Details</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Layers size={18} style={{ color: '#2563eb' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {service.serviceType}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Request Date
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
                  {formattedRequestDate}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Expected Date
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#2563eb', marginTop: '3px' }}>
                  {formattedExpectedDate}
                </div>
              </div>
            </div>
          </div>

          {/* Client Information (shown when populated) */}
          {service.client && (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div className="form-section-title">Client Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                  <User size={15} style={{ color: '#64748b' }} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{service.client.name || 'Client'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                  <Mail size={15} style={{ color: '#64748b' }} />
                  <span>{service.client.email || 'N/A'}</span>
                </div>
                {service.client.company && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                    <Building size={15} style={{ color: '#64748b' }} />
                    <span>{service.client.company}</span>
                  </div>
                )}
                {service.client.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                    <Phone size={15} style={{ color: '#64748b' }} />
                    <span>{service.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="form-section-title">Service Description</div>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.875rem',
                color: '#334155',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}
            >
              {service.description}
            </div>
          </div>

          {/* Additional Info */}
          {service.additionalInfo && (
            <div>
              <div className="form-section-title">Additional Supporting Information</div>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {service.additionalInfo}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: Admin status control with full dropdown OR client-only status badge */}
          <div>
            {isAdmin ? (
              <ServiceStatusControl
                service={service}
                onStatusChanged={handleStatusChanged}
              />
            ) : (
              <span className={`status-badge ${service.status.toLowerCase()}`}>
                {isPending ? <Clock size={12} /> : isCompleted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                <span>{service.status}</span>
              </span>
            )}
          </div>

          {/* Right: Close button */}
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ServiceRequestDetailsDrawer;
