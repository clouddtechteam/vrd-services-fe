import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { Header } from '../../components/Header';
import { ServiceTypesDrawer } from '../../components/ServiceTypesDrawer';
import { ServiceDetailModal } from '../../components/ServiceDetailModal';
import { ServiceStatusControl } from '../../components/ServiceStatusControl';

const AVATAR_COLORS = ['#6366f1', '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

export const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1
  });

  // Drawers
  const [isCatalogDrawerOpen, setIsCatalogDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async (page = 1, searchQuery = '', status = 'all') => {
    setLoading(true);
    try {
      const res = await api.get('/services', {
        params: {
          page,
          limit: pagination.limit,
          search: searchQuery,
          status: status !== 'all' ? status : ''
        }
      });
      if (res.data.success) {
        setServices(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch admin service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchServices(newPage, search, statusFilter);
    }
  };

  const handleServiceUpdated = (updated) => {
    setServices((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
    setSelectedService(updated);
  };

  return (
    <div className="main-container">
      {/* Breadcrumb Header */}
      <Header breadcrumb="Services Management" />

      {/* Top Banner Header */}
      <div className="management-banner">
        <div className="banner-left">
          <div className="banner-icon-badge">
            <Wrench size={28} />
          </div>
          <div>
            <div className="banner-title">SERVICE REQUEST MANAGEMENT</div>
            <div className="banner-subtitle">
              {pagination.total} {pagination.total === 1 ? 'service request' : 'service requests'} recorded • Ordered newest first
            </div>
          </div>
        </div>

        {/* Top Button to Open Service Catalog / Service Types Detail Panel */}
        <div className="banner-actions">
          <button
            className="btn-secondary"
            onClick={() => setIsCatalogDrawerOpen(true)}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Layers size={17} style={{ color: '#2563eb' }} />
            <span>Service Types Catalog</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="data-card">
        <div className="card-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="card-title-text">RECENT SERVICES</div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'all' ? '#2563eb' : '#cbd5e1',
                  background: statusFilter === 'all' ? '#eff6ff' : '#ffffff',
                  color: statusFilter === 'all' ? '#2563eb' : '#64748b'
                }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Pending')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'Pending' ? '#d97706' : '#cbd5e1',
                  background: statusFilter === 'Pending' ? '#fef3c7' : '#ffffff',
                  color: statusFilter === 'Pending' ? '#b45309' : '#64748b'
                }}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('In Progress')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'In Progress' ? '#2563eb' : '#cbd5e1',
                  background: statusFilter === 'In Progress' ? '#eff6ff' : '#ffffff',
                  color: statusFilter === 'In Progress' ? '#2563eb' : '#64748b'
                }}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Completed')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'Completed' ? '#059669' : '#cbd5e1',
                  background: statusFilter === 'Completed' ? '#ecfdf5' : '#ffffff',
                  color: statusFilter === 'Completed' ? '#047857' : '#64748b'
                }}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search client, service, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Loading Spinner on DB Query */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
            <div>Loading service requests from database...</div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <Wrench size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <div style={{ fontWeight: 600, color: '#0f172a' }}>No service requests found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filter options'
                : 'Client service requests will appear here as soon as submitted'}
            </p>
          </div>
        ) : (
          /* Table showing Section 7.2 columns: Client name, Client email, Service type, Expected date, Request date, Current status, Action / status control */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>REQUEST ID</th>
                  <th>CLIENT NAME & EMAIL</th>
                  <th>SERVICE TYPE</th>
                  <th style={{ width: '130px' }}>REQUEST DATE</th>
                  <th style={{ width: '130px' }}>EXPECTED DATE</th>
                  <th style={{ width: '120px' }}>STATUS</th>
                  <th style={{ textAlign: 'right', width: '220px' }}>ACTION / CONTROL</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => {
                  const client = service.client || {};
                  const clientName = client.name || 'Unknown Client';
                  const clientEmail = client.email || 'N/A';
                  const initial = clientName ? clientName.charAt(0).toUpperCase() : 'C';
                  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

                  const reqDate = service.requestDate || service.createdAt
                    ? new Date(service.requestDate || service.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  const expDate = service.expectedDate
                    ? new Date(service.expectedDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  const isPending = service.status === 'Pending';
                  const isInProgress = service.status === 'In Progress';
                  const isCancelled = service.status === 'Cancelled';

                  return (
                    <tr
                      key={service._id}
                      onClick={() => setSelectedService(service)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Request ID */}
                      <td data-label="ID" style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {service.requestId}
                      </td>

                      {/* Client Name & Client Email */}
                      <td data-label="Client">
                        <div className="user-cell">
                          <div className="avatar-circle" style={{ backgroundColor: avatarColor }}>
                            {initial}
                          </div>
                          <div>
                            <div className="client-name">{clientName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              {clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service Type & Store */}
                      <td data-label="Service">
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {service.serviceType}
                        </div>
                        {service.storeName && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {service.storeName} {service.storeCode ? `(${service.storeCode})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Request Date */}
                      <td data-label="Requested" style={{ color: '#64748b', fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} style={{ color: '#94a3b8' }} />
                          <span>{reqDate}</span>
                        </div>
                      </td>

                      {/* Expected Date */}
                      <td data-label="Expected" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          <span>{expDate}</span>
                        </div>
                      </td>

                      {/* Current Status */}
                      <td data-label="Status">
                        <span
                          className={`status-badge ${
                            isPending
                              ? 'pending'
                              : isInProgress
                              ? 'in-progress'
                              : isCancelled
                              ? 'cancelled'
                              : 'completed'
                          }`}
                        >
                          {isPending ? (
                            <Clock size={12} />
                          ) : isInProgress ? (
                            <Clock size={12} />
                          ) : isCancelled ? (
                            <XCircle size={12} />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          <span>{service.status}</span>
                        </span>
                      </td>

                      {/* Action / Status Control - uses ServiceStatusControl for full dropdown */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <ServiceStatusControl
                            service={service}
                            onStatusChanged={(updated) => {
                              setServices((prev) =>
                                prev.map((s) => (s._id === updated._id ? updated : s))
                              );
                              if (selectedService && selectedService._id === updated._id) {
                                setSelectedService(updated);
                              }
                            }}
                          />
                          <button
                            className="btn-details"
                            onClick={() => setSelectedService(service)}
                            title="View expanded details panel"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing {services.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={pagination.page <= 1 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Previous
            </button>
            <span style={{ fontSize: '0.8rem', color: '#64748b', padding: '0 8px' }}>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              className="page-btn"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Service Types Detail Panel Drawer */}
      <ServiceTypesDrawer
        isOpen={isCatalogDrawerOpen}
        onClose={() => setIsCatalogDrawerOpen(false)}
        onServiceTypesChanged={() => fetchServices(pagination.page, search, statusFilter)}
      />

      {/* Expanded Service Request Details 70/30 Modal with Admin Interactivity */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        isAdmin={true}
        onServiceUpdated={handleServiceUpdated}
      />
    </div>
  );
};
export default AdminServicesPage;
