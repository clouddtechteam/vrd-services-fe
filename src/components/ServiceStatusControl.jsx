import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronDown,
  Loader2
} from 'lucide-react';
import api from '../services/api';

export const ServiceStatusControl = ({ service, onStatusChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdate = async (newStatus) => {
    setIsOpen(false);

    // Confirmation required when changing to Cancelled or returning to Pending
    if (newStatus === 'Cancelled') {
      const ok = window.confirm(
        `Are you sure you want to CANCEL service request "${service.requestId || service._id}"?`
      );
      if (!ok) return;
    } else if (newStatus === 'Pending') {
      const ok = window.confirm(
        `Are you sure you want to return service request "${service.requestId || service._id}" to PENDING status?`
      );
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`/services/${service._id}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        if (onStatusChanged) {
          onStatusChanged(res.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to change service status:', err);
      alert(err.response?.data?.message || 'Failed to update status in database.');
    } finally {
      setLoading(false);
    }
  };

  const isPending = service.status === 'Pending';
  const isCompleted = service.status === 'Completed';
  const isCancelled = service.status === 'Cancelled';

  return (
    <div
      ref={menuRef}
      className="status-dropdown-wrapper"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
    >
      {/* Primary Action Button / Badge */}
      {isPending ? (
        <button
          type="button"
          onClick={() => handleUpdate('Completed')}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.775rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.15s ease'
          }}
          title="Click to Mark Complete"
        >
          {loading ? (
            <Loader2 size={13} className="spin" />
          ) : (
            <CheckCircle size={13} />
          )}
          <span>Mark Complete</span>
        </button>
      ) : isCompleted ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            color: '#059669',
            fontWeight: 700,
            padding: '4px 8px'
          }}
        >
          <CheckCircle2 size={14} /> Completed
        </span>
      ) : (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.75rem',
            color: '#dc2626',
            fontWeight: 700,
            padding: '4px 8px'
          }}
        >
          <XCircle size={14} /> Cancelled
        </span>
      )}

      {/* Small Arrow Button - Click to reveal other status options safely */}
      <button
        type="button"
        className="status-arrow-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading}
        title="More status options"
        style={{ width: '26px', height: '28px' }}
      >
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="status-menu-popup">
          <div style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Change Status:
          </div>

          {!isCompleted && (
            <button
              type="button"
              className="status-menu-item success"
              onClick={() => handleUpdate('Completed')}
            >
              <CheckCircle size={13} />
              <span>Mark Completed</span>
            </button>
          )}

          {!isPending && (
            <button
              type="button"
              className="status-menu-item warning"
              onClick={() => handleUpdate('Pending')}
            >
              <RotateCcw size={13} />
              <span>Return to Pending</span>
            </button>
          )}

          {!isCancelled && (
            <button
              type="button"
              className="status-menu-item danger"
              onClick={() => handleUpdate('Cancelled')}
            >
              <XCircle size={13} />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default ServiceStatusControl;
