import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';
import { Header } from '../../components/Header';
import { ClientDetailsDrawer } from '../../components/ClientDetailsDrawer';
import { AddClientModal } from '../../components/AddClientModal';
import { ExcelImportClientsDrawer } from '../../components/ExcelImportClientsDrawer';

// Consistent avatar background colors
const AVATAR_COLORS = ['#6366f1', '#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

export const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelDrawerOpen, setIsExcelDrawerOpen] = useState(false);

  const fetchClients = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: {
          page,
          limit: pagination.limit,
          search: searchQuery
        }
      });
      if (res.data.success) {
        setClients(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(1, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClients(newPage, search);
    }
  };

  const handleClientUpdated = (updatedClient) => {
    setClients((prev) =>
      prev.map((c) => (c._id === updatedClient._id ? updatedClient : c))
    );
    setSelectedClient(updatedClient);
  };

  const handleClientAdded = (newClient) => {
    fetchClients(1, '');
    setSearch('');
  };

  return (
    <div className="main-container">
      {/* Breadcrumb Header */}
      <Header breadcrumb="Clients" />

      {/* Top Banner Header */}
      <div className="management-banner">
        <div className="banner-left">
          <div className="banner-icon-badge">
            <Users size={28} />
          </div>
          <div>
            <div className="banner-title">CLIENT MANAGEMENT</div>
            <div className="banner-subtitle">
              {pagination.total} {pagination.total === 1 ? 'client member' : 'clients'} registered
            </div>
          </div>
        </div>

        <div className="banner-actions">
          <button
            className="btn-secondary"
            onClick={() => setIsExcelDrawerOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FileSpreadsheet size={16} style={{ color: '#059669' }} />
            <span>Import Excel</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="data-card">
        <div className="card-header-bar">
          <div className="card-title-text">CLIENT LIST</div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Filter this page..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
            <div>Loading clients data...</div>
          </div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <Users size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <div style={{ fontWeight: 600, color: '#0f172a' }}>No clients found</div>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {search ? 'Try adjusting your search criteria' : 'Click "Add Client" to register the first client'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => {
                const rowNum = (pagination.page - 1) * pagination.limit + index + 1;
                const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';

                return (
                  <tr key={client._id}>
                    <td data-label="#" style={{ color: '#64748b', fontWeight: 600 }}>{rowNum}</td>
                    <td data-label="Name">
                      <div className="user-cell">
                        <div className="avatar-circle" style={{ backgroundColor: avatarColor }}>
                          {initial}
                        </div>
                        <span className="client-name">{client.name}</span>
                      </div>
                    </td>
                    <td data-label="Email" style={{ color: '#475569' }}>{client.email}</td>
                    <td data-label="Role">
                      <span className="role-pill client">CLIENT</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-details"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Bar */}
        <div className="pagination-bar">
          <div className="pagination-info">
            Showing {clients.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
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

      {/* Slide-Over Details Drawer (Screenshot 2) */}
      <ClientDetailsDrawer
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onClientUpdated={handleClientUpdated}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Bulk Import Clients Drawer via Excel */}
      <ExcelImportClientsDrawer
        isOpen={isExcelDrawerOpen}
        onClose={() => setIsExcelDrawerOpen(false)}
        onClientsImported={() => {
          fetchClients(1, '');
          setSearch('');
        }}
      />
    </div>
  );
};
