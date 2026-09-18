import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Layers,
  Plus,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

export const ServiceTypesDrawer = ({ isOpen, onClose, onServiceTypesChanged }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'excel'
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Excel state
  const [excelRows, setExcelRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchServiceTypes();
      setFeedback({ type: '', message: '' });
      setActiveTab('list');
      setExcelRows([]);
      setFileName('');
    }
  }, [isOpen]);

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/service-types');
      if (res.data.success) {
        setServiceTypes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch service types:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to load service types from database.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Handle manual addition
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFeedback({ type: 'error', message: 'Service type name is required.' });
      return;
    }

    setActionLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/service-types', {
        name: newName.trim(),
        description: newDescription.trim()
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Service type "${res.data.data.name}" created successfully!`
        });
        setNewName('');
        setNewDescription('');
        await fetchServiceTypes();
        setActiveTab('list');
        if (onServiceTypesChanged) onServiceTypesChanged();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create service type.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deletion
  const handleDelete = async (st) => {
    if (!window.confirm(`Are you sure you want to delete service type "${st.name}"?\nNote: Already requested services will remain unaffected.`)) {
      return;
    }

    setActionLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.delete(`/service-types/${st._id}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Service type deleted successfully.'
        });
        await fetchServiceTypes();
        if (onServiceTypesChanged) onServiceTypesChanged();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete service type.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        Name: 'HVAC Maintenance & Air Quality Audit',
        Description: 'Quarterly particulate count check and HEPA filter overhaul for clinical spaces.'
      },
      {
        Name: 'Biomedical Equipment Calibration',
        Description: 'Annual ISO precision testing and compliance calibration for diagnostics.'
      },
      {
        Name: 'Water Purification & Reverse Osmosis Inspection',
        Description: 'Microbiological testing, filter replacement, and TDS level validation.'
      },
      {
        Name: 'Emergency Generator Load Bank Test',
        Description: 'Simulated 4-hour full-load power failure and automatic transfer switch inspection.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ServiceTypes');

    // Auto-width columns
    worksheet['!cols'] = [{ wch: 35 }, { wch: 60 }];

    XLSX.writeFile(workbook, 'VRD_Service_Types_Template.xlsx');
  };

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFeedback({ type: '', message: '' });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        const mapped = rawData.map((row) => ({
          name: row['Name'] || row['name'] || row['Service Type'] || row['service_type'] || '',
          description: row['Description'] || row['description'] || row['Desc'] || ''
        })).filter((r) => r.name);

        if (mapped.length === 0) {
          setFeedback({
            type: 'error',
            message: 'No valid service types found in file. Ensure the Excel has a "Name" column.'
          });
          setExcelRows([]);
        } else {
          setExcelRows(mapped);
          setFeedback({
            type: 'success',
            message: `Parsed ${mapped.length} service types from "${file.name}". Review below and confirm import.`
          });
        }
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        setFeedback({
          type: 'error',
          message: 'Failed to read file. Please ensure it is a valid .xlsx or .csv file.'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit bulk import
  const handleImportExcel = async () => {
    if (excelRows.length === 0) {
      setFeedback({ type: 'error', message: 'No rows to import.' });
      return;
    }

    setActionLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/service-types/bulk', { items: excelRows });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Successfully imported ${res.data.data.createdCount} service types!`
        });
        setExcelRows([]);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchServiceTypes();
        setActiveTab('list');
        if (onServiceTypesChanged) onServiceTypesChanged();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to bulk import service types.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" style={{ width: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <div className="drawer-name-title">SERVICE CATALOG</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Manage available service categories and descriptions
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Layers size={15} />
            Service Types ({serviceTypes.length})
          </button>
          <button
            className={`drawer-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={15} />
            Add Single
          </button>
          <button
            className={`drawer-tab ${activeTab === 'excel' ? 'active' : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            <FileSpreadsheet size={15} />
            Import by Excel
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

          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div>
              {/* Informative notice */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  fontSize: '0.78rem',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Independent Storage:</strong> Service requests store the service name as a snapshot. Deleting a service type from this catalog will <strong>never</strong> alter or remove existing requests.
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                  <Loader2 size={28} className="spin" style={{ margin: '0 auto 8px', color: '#2563eb' }} />
                  <div>Loading service catalog from DB...</div>
                </div>
              ) : serviceTypes.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                  <Layers size={36} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>No service types in database</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    Click "Add Single" or "Import by Excel" to populate the catalog.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {serviceTypes.map((st) => (
                    <div
                      key={st._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'box-shadow 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {st.name}
                        </div>
                        {st.description ? (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                            {st.description}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                            No description provided
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(st)}
                        disabled={actionLoading}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#ef4444',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Delete service type"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD SINGLE */}
          {activeTab === 'add' && (
            <form onSubmit={handleAdd}>
              <div className="form-section-title">New Service Type</div>

              <div className="form-group">
                <label className="form-label">Service Type Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Cleanroom Airborne Particulate Validation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label className="form-label">Service Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Comprehensive description of standard tasks, protocols, and equipment..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={actionLoading}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Service Type</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT BY EXCEL */}
          {activeTab === 'excel' && (
            <div>
              <div className="form-section-title">Bulk Import via Excel / CSV</div>

              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px', lineHeight: '1.5' }}>
                Upload an Excel file (.xlsx) or CSV containing service types and descriptions. Download our formatted template below to ensure column compatibility.
              </p>

              {/* Download Template Button */}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDownloadSample}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '18px' }}
              >
                <Download size={16} />
                <span>Download Sample Excel Template (.xlsx)</span>
              </button>

              {/* Upload Drop Area */}
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} style={{ color: '#2563eb', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                  {fileName ? fileName : 'Click to select Excel/CSV file'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Supports .xlsx and .csv files with columns "Name" and "Description"
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Parsed Rows Preview */}
              {excelRows.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      Ready to Import ({excelRows.length} items)
                    </span>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleImportExcel}
                      disabled={actionLoading}
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={14} className="spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Confirm & Save to DB</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    <table className="data-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>Name</th>
                          <th style={{ padding: '8px 12px' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelRows.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                              {r.name}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#64748b' }}>
                              {r.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
export default ServiceTypesDrawer;
