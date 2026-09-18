import React, { useState, useEffect } from 'react';
import {
  Layers,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Eye,
  Search,
  Loader2,
  FileQuestion,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { Header } from '../../components/Header';
import { RequestServiceModal } from '../../components/RequestServiceModal';
import { ServiceRequestDetailsDrawer } from '../../components/ServiceRequestDetailsDrawer';

export const ClientServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchMyServices = async () => {
    setLoading(true);
    try {
      // Backend guarantees client receives strictly services associated with their own client ID
      const res = await api.get('/services/my-services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch client service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleServiceRequested = (newService) => {
    setServices((prev) => [newService, ...prev]);
  };

  const handleServiceUpdated = (updated) => {
    setServices((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s))
    );
    setSelectedService(updated);
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesStatus =
      statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !search ||
      s.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      s.requestId.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="main-container">
      {/* Breadcrumb Header */}
      <Header breadcrumb="My Services" />

      {/* Top Banner Header with Top-Right "Request Service" Button */}
      <div className="management-banner">
        <div className="banner-left">
          <div className="banner-icon-badge" style={{ background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)' }}>
            <Layers size={28} />
          </div>
          <div>
            <div className="banner-title">MY SERVICE REQUESTS</div>
            <div className="banner-subtitle">
              {services.length} {services.length === 1 ? 'service contract' : 'service contracts'} registered
            </div>
          </div>
        </div>

        {/* Top-right Request Service Button (Requirement 5) */}
        <div className="banner-actions">
          <button
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)'
            }}
            onClick={() => setIsRequestModalOpen(true)}
          >
            <PlusCircle size={17} />
            <span>Request Service</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="data-card">
        <div className="card-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="card-title-text">SERVICE REQUEST LOG</div>
            {/* Filter pills */}
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
                All ({services.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'pending' ? '#d97706' : '#cbd5e1',
                  background: statusFilter === 'pending' ? '#fef3c7' : '#ffffff',
                  color: statusFilter === 'pending' ? '#b45309' : '#64748b'
                }}
              >
                Pending ({services.filter((s) => s.status === 'Pending').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: statusFilter === 'completed' ? '#059669' : '#cbd5e1',
                  background: statusFilter === 'completed' ? '#ecfdf5' : '#ffffff',
                  color: statusFilter === 'completed' ? '#047857' : '#64748b'
                }}
              >
                Completed ({services.filter((s) => s.status === 'Completed').length})
              </button>
            </div>
          </div>

          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search service requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Database Loading Spinner */}
        {loading ? (
          <div style={{ padding: '70px 0', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
            <div style={{ fontWeight: 600, color: '#0f172a' }}>Loading service requests from database...</div>
          </div>
        ) : services.length === 0 ? (
          /* Requirement 4.3: Empty Service State */
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                marginBottom: '16px'
              }}
            >
              <FileQuestion size={34} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              No services available
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '24px' }}>
              You currently have no service requests.
            </p>
            <button
              className="btn-primary"
              onClick={() => setIsRequestModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
                padding: '12px 24px',
                fontSize: '0.9rem'
              }}
            >
              <PlusCircle size={18} />
              <span>Request a Service</span>
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <Search size={36} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <div style={{ fontWeight: 600, color: '#0f172a' }}>No matching service requests</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          /* Table of Services */
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>REQUEST ID</th>
                  <th>SERVICE TYPE</th>
                  <th style={{ width: '150px' }}>REQUEST DATE</th>
                  <th style={{ width: '150px' }}>EXPECTED DATE</th>
                  <th>DESCRIPTION</th>
                  <th style={{ width: '130px' }}>STATUS</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
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

                      {/* Service Type */}
                      <td data-label="Service">
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {service.serviceType}
                        </div>
                      </td>

                      {/* Request Date */}
                      <td data-label="Requested" style={{ color: '#64748b', fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} style={{ color: '#94a3b8' }} />
                          <span>{reqDate}</span>
                        </div>
                      </td>

                      {/* Expected Date */}
                      <td data-label="Expected" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} />
                          <span>{expDate}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td data-label="Description" style={{ color: '#475569', maxWidth: '320px' }}>
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.825rem'
                          }}
                          title={service.description}
                        >
                          {service.description}
                        </div>
                      </td>

                      {/* Status */}
                      <td data-label="Status">
                        <span className={`status-badge ${isPending ? 'pending' : 'completed'}`}>
                          {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                          <span>{service.status}</span>
                        </span>
                      </td>

                      {/* Action: Expand Detail Panel */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-details"
                          onClick={() => setSelectedService(service)}
                          title="View complete details in side panel"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Service Modal */}
      <RequestServiceModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onServiceRequested={handleServiceRequested}
      />

      {/* Service Request Expanded Detail Panel */}
      <ServiceRequestDetailsDrawer
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onServiceUpdated={handleServiceUpdated}
      />
    </div>
  );
};
export default ClientServicesPage;
