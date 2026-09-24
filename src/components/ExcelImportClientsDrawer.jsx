import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Check,
  KeyRound
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

export const ExcelImportClientsDrawer = ({ isOpen, onClose, onClientsImported }) => {
  const [excelRows, setExcelRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        'User ID': 'CLI-1001',
        Name: 'John Doe',
        Email: 'john.doe@example.com',
        Phone: '+1 (555) 234-5678',
        Company: 'Acme Health Solutions'
      },
      {
        'User ID': 'CLI-1002',
        Name: 'Jane Smith',
        Email: 'jane.smith@example.com',
        Phone: '+1 (555) 345-6789',
        Company: 'Apex Diagnostics Lab'
      },
      {
        'User ID': 'CLI-1003',
        Name: 'Alex Taylor',
        Email: 'alex.taylor@example.com',
        Phone: '+1 (555) 456-7890',
        Company: 'Metropolitan Hospital Group'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 30 },
      { wch: 18 },
      { wch: 28 }
    ];

    XLSX.writeFile(workbook, 'VRD_Clients_Import_Template.xlsx');
  };

  // Handle Excel file selection & parsing
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

        const mapped = rawData.map((row) => {
          const userId = row['User ID'] || row['userId'] || row['UserId'] || row['user_id'] || '';
          const name = row['Name'] || row['name'] || row['Full Name'] || row['Client Name'] || '';
          const email = row['Email'] || row['email'] || row['Email Address'] || '';
          const phone = row['Phone'] || row['phone'] || row['Phone Number'] || '';
          const company = row['Company'] || row['company'] || row['Organization'] || '';

          const isValid = Boolean(name && email);

          return {
            userId: String(userId).trim(),
            name: String(name).trim(),
            email: String(email).trim(),
            phone: String(phone).trim(),
            company: String(company).trim(),
            isValid
          };
        });

        if (mapped.length === 0) {
          setFeedback({
            type: 'error',
            message: 'No client records found in file. Ensure columns include "Name" and "Email".'
          });
          setExcelRows([]);
        } else {
          setExcelRows(mapped);
          const validCount = mapped.filter((r) => r.isValid).length;
          setFeedback({
            type: 'success',
            message: `Parsed ${mapped.length} records (${validCount} valid). Review below and confirm import.`
          });
        }
      } catch (err) {
        console.error('Failed to parse clients Excel:', err);
        setFeedback({
          type: 'error',
          message: 'Failed to read file. Please ensure it is a valid .xlsx or .csv file.'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit bulk creation
  const handleImport = async () => {
    const validRows = excelRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setFeedback({ type: 'error', message: 'No valid client records to import.' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/clients/bulk', { items: validRows });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Successfully created ${res.data.data.createdCount} client accounts!`
        });
        setExcelRows([]);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onClientsImported) {
          onClientsImported();
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to bulk import clients.'
      });
    } finally {
      setLoading(false);
    }
  };

  const validCount = excelRows.filter((r) => r.isValid).length;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" style={{ width: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="drawer-name-title">BULK CLIENT IMPORT</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Import client roster in batch via Excel or CSV spreadsheet
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

          {/* Import Rules Notice */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              fontSize: '0.8rem',
              color: '#166534',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Info size={16} />
              <span>Import Specifications & Security Policy</span>
            </div>
            <ul style={{ paddingLeft: '22px', lineHeight: '1.5' }}>
              <li>
                <strong>Mandatory fields:</strong> Only <strong>Name</strong> and <strong>Email</strong> are required. Phone and Company are optional.
              </li>
              <li>
                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <KeyRound size={13} /> Default Password:
                </strong>{' '}
                For each bulk-created client, the initial password will automatically be set to their <strong>Email</strong> address.
              </li>
              <li>Existing emails in database will be safely skipped.</li>
            </ul>
          </div>

          {/* Download Sample Excel Template */}
          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDownloadSample}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Download size={16} />
              <span>Download Sample Clients Excel Template (.xlsx)</span>
            </button>
          </div>

          {/* File Upload Box */}
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
              {fileName ? fileName : 'Click to select client spreadsheet'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Accepts .xlsx, .xls, and .csv files
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
          </div>

          {/* Preview Table */}
          {excelRows.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                  Preview: {validCount} valid out of {excelRows.length} total rows
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={loading || validCount === 0}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Confirm & Import ({validCount})</span>
                    </>
                  )}
                </button>
              </div>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                      <th style={{ padding: '8px 12px' }}>User ID</th>
                      <th style={{ padding: '8px 12px' }}>Name</th>
                      <th style={{ padding: '8px 12px' }}>Email</th>
                      <th style={{ padding: '8px 12px' }}>Company</th>
                      <th style={{ padding: '8px 12px' }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelRows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px 12px' }}>
                          {r.isValid ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: '#ecfdf5',
                                color: '#059669'
                              }}
                            >
                              <Check size={10} /> Valid
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: '#fef2f2',
                                color: '#dc2626'
                              }}
                            >
                              Missing Info
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#4338ca' }}>
                          {r.userId || <em style={{ color: '#94a3b8' }}>auto</em>}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                          {r.name || '<empty>'}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>
                          {r.email || '<empty>'}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>
                          {r.company || '-'}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>
                          {r.phone || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExcelImportClientsDrawer;
