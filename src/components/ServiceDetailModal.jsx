import React, { useState } from 'react';
import {
  X,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CheckCircle,
  User,
  Store,
  Hash,
  Mail,
  Phone,
  FileText,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

export const ServiceDetailModal = ({
  service,
  isOpen,
  onClose,
  isAdmin = false,
  onServiceUpdated
}) => {
  const [updating, setUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  if (!isOpen || !service) return null;

  const currentStatus = service.status || 'Pending';

  const stages = [
    {
      id: 'Pending',
      stepNum: '1',
      name: 'Pending',
      desc: 'Request received and queued for assignment',
      icon: Clock
    },
    {
      id: 'In Progress',
      stepNum: '2',
      name: 'In Progress',
      desc: 'Technicians deployed and work underway',
      icon: ArrowRight
    },
    {
      id: 'Completed',
      stepNum: '3',
      name: 'Completed',
      desc: 'Service completed, validated, and finalized',
      icon: CheckCircle2
    }
  ];

  // Helper to determine stage position relative to current status
  const getStageState = (stageId) => {
    if (currentStatus === 'Cancelled') {
      return { isCurrent: false, isCompleted: false };
    }

    const order = ['Pending', 'In Progress', 'Completed'];
    const currentIndex = order.indexOf(currentStatus);
    const stageIndex = order.indexOf(stageId);

    if (stageIndex === currentIndex) {
      return { isCurrent: true, isCompleted: false };
    }
    if (stageIndex < currentIndex) {
      return { isCurrent: false, isCompleted: true };
    }
    return { isCurrent: false, isCompleted: false };
  };

  const handleStatusClick = async (targetStatus) => {
    if (!isAdmin || updating || targetStatus === currentStatus) return;

    if (targetStatus === 'Cancelled') {
      const confirmCancel = window.confirm(
        `Are you sure you want to mark request "${service.requestId || service._id}" as CANCELLED?`
      );
      if (!confirmCancel) return;
    }

    setUpdating(true);
    setUpdatingStatus(targetStatus);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.patch(`/services/${service._id}/status`, {
        status: targetStatus
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Status successfully updated to "${targetStatus}"`
        });
        if (onServiceUpdated) {
          onServiceUpdated(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to change status:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update service status'
      });
    } finally {
      setUpdating(false);
      setUpdatingStatus('');
      setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 3500);
    }
  };

  const formattedRequestDate = service.requestDate || service.createdAt
    ? new Date(service.requestDate || service.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const formattedExpectedDate = service.expectedDate
    ? new Date(service.expectedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  const managerDisplay = service.managerName || service.client?.name || 'N/A';
  const storeNameDisplay = service.storeName || service.client?.company || 'N/A';
  const storeCodeDisplay = service.storeCode || 'STR-N/A';
  const emailDisplay = service.email || service.client?.email || 'N/A';
  const phoneDisplay = service.phone || service.client?.phone || 'Optional / Not specified';

  return (
    <div className="split-modal-backdrop" onClick={onClose}>
      <div className="split-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="split-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background:
                  currentStatus === 'Completed'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : currentStatus === 'Cancelled'
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : currentStatus === 'In Progress'
                    ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)'
              }}
            >
              <Layers size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {service.serviceType || 'Service Request'}
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  {service.requestId}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Service Request Specifications & Task Flow Telemetry
              </div>
            </div>
          </div>

          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback.message && (
          <div
            className={`alert-banner ${feedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}
            style={{ margin: '12px 24px 0' }}
          >
            {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 70 / 30 Body */}
        <div className="split-modal-body">
          {/* Left Panel - 70% Details */}
          <div className="split-panel-70">
            {/* Info Grid for Manager, Store, Code, Email, Phone, Dates */}
            <div className="split-info-grid">
              {/* Manager Name */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <User size={13} style={{ color: '#2563eb' }} />
                  <span>Manager Name</span>
                </div>
                <div className="split-info-value">{managerDisplay}</div>
              </div>

              {/* Store Name */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <Store size={13} style={{ color: '#2563eb' }} />
                  <span>Store Name</span>
                </div>
                <div className="split-info-value">{storeNameDisplay}</div>
              </div>

              {/* Store Code */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <Hash size={13} style={{ color: '#2563eb' }} />
                  <span>Store Code</span>
                </div>
                <div className="split-info-value" style={{ fontFamily: 'monospace' }}>
                  {storeCodeDisplay}
                </div>
              </div>

              {/* Email */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <Mail size={13} style={{ color: '#2563eb' }} />
                  <span>Email</span>
                </div>
                <div className="split-info-value" style={{ wordBreak: 'break-all' }}>
                  {emailDisplay}
                </div>
              </div>

              {/* Phone Number */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <Phone size={13} style={{ color: '#2563eb' }} />
                  <span>Phone Number (Optional)</span>
                </div>
                <div className="split-info-value" style={{ color: service.phone ? '#0f172a' : '#94a3b8' }}>
                  {phoneDisplay}
                </div>
              </div>

              {/* Expected Date */}
              <div className="split-info-card">
                <div className="split-info-label">
                  <Calendar size={13} style={{ color: '#2563eb' }} />
                  <span>Expected Completion</span>
                </div>
                <div className="split-info-value" style={{ color: '#2563eb' }}>
                  {formattedExpectedDate}
                </div>
              </div>
            </div>

            {/* Request Date Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#64748b',
                background: '#f8fafc',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                marginBottom: '16px'
              }}
            >
              <Clock size={14} style={{ color: '#94a3b8' }} />
              <span>
                Request Logged: <strong>{formattedRequestDate}</strong>
              </span>
            </div>

            {/* Description */}
            <div className="split-description-card">
              <div className="split-info-label" style={{ marginBottom: '8px' }}>
                <FileText size={13} style={{ color: '#2563eb' }} />
                <span>Service Description</span>
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#334155',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {service.description}
              </div>
            </div>

            {/* Additional info if present */}
            {service.additionalInfo && (
              <div className="split-description-card" style={{ marginTop: '12px', background: '#fafbfc' }}>
                <div className="split-info-label" style={{ marginBottom: '6px' }}>
                  <span>Additional Notes</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.5' }}>
                  {service.additionalInfo}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - 30% Task Flow */}
          <div className="split-panel-30">
            <div className="taskflow-header">
              <div className="taskflow-title">
                <Clock size={16} style={{ color: '#2563eb' }} />
                <span>Task Flow</span>
              </div>
              <div className="taskflow-subtitle">
                {isAdmin
                  ? 'Click any step below to change current status'
                  : 'Current progression of this service request'}
              </div>
            </div>

            {/* The 3 Core Stages: Always shown */}
            <div className="taskflow-list">
              {stages.map((stage) => {
                const { isCurrent, isCompleted } = getStageState(stage.id);
                const isUpdatingThis = updating && updatingStatus === stage.id;
                const IconComponent = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`taskflow-step ${isCurrent ? 'active-step' : ''} ${
                      isCompleted ? 'completed-step' : ''
                    } ${isAdmin ? 'is-admin-clickable' : ''}`}
                    onClick={() => handleStatusClick(stage.id)}
                    title={
                      isAdmin
                        ? isCurrent
                          ? 'Current Status'
                          : `Click to set status to ${stage.name}`
                        : undefined
                    }
                  >
                    <div className="taskflow-step-icon-wrap">
                      {isUpdatingThis ? (
                        <Loader2 size={16} className="spin" style={{ color: '#2563eb' }} />
                      ) : isCompleted ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <IconComponent size={16} />
                      )}
                    </div>

                    <div className="taskflow-step-content">
                      <div className="taskflow-step-label">
                        <span>
                          {stage.stepNum}. {stage.name}
                        </span>

                        {/* Green Dot on Current Status */}
                        {isCurrent && (
                          <span
                            className="status-green-dot"
                            title="Active Current Status"
                          />
                        )}

                        {isCompleted && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#059669',
                              background: '#ecfdf5',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Done
                          </span>
                        )}
                      </div>

                      <div className="taskflow-step-desc">{stage.desc}</div>

                      {isAdmin && !isCurrent && (
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: '#2563eb',
                            fontWeight: 600,
                            marginTop: '4px'
                          }}
                        >
                          Click to set active
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancelled State Card (shown / interactable) */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div
                className={`taskflow-step ${currentStatus === 'Cancelled' ? 'active-step' : ''} ${
                  isAdmin ? 'is-admin-clickable' : ''
                }`}
                style={{
                  border:
                    currentStatus === 'Cancelled'
                      ? '1px solid #fecaca'
                      : '1px dashed #e2e8f0',
                  background:
                    currentStatus === 'Cancelled' ? '#fef2f2' : 'transparent'
                }}
                onClick={() => isAdmin && handleStatusClick('Cancelled')}
                title={isAdmin ? 'Click to cancel request' : undefined}
              >
                <div
                  className="taskflow-step-icon-wrap"
                  style={{
                    borderColor: currentStatus === 'Cancelled' ? '#ef4444' : '#cbd5e1',
                    background: currentStatus === 'Cancelled' ? '#fee2e2' : '#ffffff',
                    color: currentStatus === 'Cancelled' ? '#dc2626' : '#94a3b8'
                  }}
                >
                  <XCircle size={16} />
                </div>
                <div className="taskflow-step-content">
                  <div
                    className="taskflow-step-label"
                    style={{ color: currentStatus === 'Cancelled' ? '#dc2626' : '#64748b' }}
                  >
                    <span>Cancelled</span>
                    {currentStatus === 'Cancelled' && (
                      <span className="status-green-dot" title="Current Status: Cancelled" />
                    )}
                  </div>
                  <div className="taskflow-step-desc">
                    {currentStatus === 'Cancelled'
                      ? 'This service request has been cancelled.'
                      : isAdmin
                      ? 'Click here if request must be cancelled'
                      : 'Not cancelled'}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Guidance Footer */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '16px',
                fontSize: '0.72rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
              <span>
                {isAdmin
                  ? 'Admin access: Click any stage above to modify database status in real-time.'
                  : 'Status updates in real-time as service operations progress.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ServiceDetailModal;
