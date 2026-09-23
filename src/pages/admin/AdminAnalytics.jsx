import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';
import { Header } from '../../components/Header';
import { Link } from 'react-router-dom';

export const AdminAnalytics = () => {
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services/analytics');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="main-container">
      <Header breadcrumb="Analytics Overview" />

      {/* Top Banner */}
      <div className="management-banner">
        <div className="banner-left">
          <div className="banner-icon-badge" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}>
            <BarChart3 size={28} />
          </div>
          <div>
            <div className="banner-title">ANALYTICS & OPERATIONAL OVERVIEW</div>
            <div className="banner-subtitle">
              High-level telemetry of clients, service workflows, and fulfillment metrics
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={36} className="spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
          <div style={{ fontWeight: 600, color: '#0f172a' }}>Loading analytics telemetry from database...</div>
        </div>
      ) : !stats ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Failed to load analytics. Please try again.
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            {/* Total Clients */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                  <Users size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Clients
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    {stats.totalClients}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                {stats.activeClients} Active account{stats.activeClients === 1 ? '' : 's'}
              </div>
            </div>

            {/* Total Services */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed' }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Requests
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    {stats.totalServices}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Across all registered clients
              </div>
            </div>

            {/* Pending Services */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Pending
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
                    {stats.pendingServices}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>
                Awaiting fulfillment
              </div>
            </div>

            {/* In Progress Services */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    In Progress
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                    {stats.inProgressServices || 0}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                Active operations underway
              </div>
            </div>

            {/* Completed Services */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Completed
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                    {stats.completedServices}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                {stats.completionRate}% Fulfillment rate
              </div>
            </div>

            {/* Cancelled Services */}
            <div className="data-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444' }}>
                  <XCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Cancelled
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>
                    {stats.cancelledServices}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>
                Voided or rescheduled
              </div>
            </div>
          </div>

          {/* Secondary Details Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Service Status Breakdown */}
            <div className="data-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  SERVICE WORKFLOW DISTRIBUTION
                </div>
                <TrendingUp size={18} style={{ color: '#2563eb' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Pending Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#b45309' }}>Pending Requests</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {stats.pendingServices} ({stats.totalServices > 0 ? Math.round((stats.pendingServices / stats.totalServices) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: '#f59e0b',
                        width: `${stats.totalServices > 0 ? (stats.pendingServices / stats.totalServices) * 100 : 0}%`,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>

                {/* Completed Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#059669' }}>Completed Services</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {stats.completedServices} ({stats.totalServices > 0 ? Math.round((stats.completedServices / stats.totalServices) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: '#10b981',
                        width: `${stats.totalServices > 0 ? (stats.completedServices / stats.totalServices) * 100 : 0}%`,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>

                {/* Cancelled Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#dc2626' }}>Cancelled Requests</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {stats.cancelledServices} ({stats.totalServices > 0 ? Math.round((stats.cancelledServices / stats.totalServices) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: '#ef4444',
                        width: `${stats.totalServices > 0 ? (stats.cancelledServices / stats.totalServices) * 100 : 0}%`,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  to="/admin/services"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Go to Services Management</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Popular Service Categories */}
            <div className="data-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  POPULAR SERVICE CATEGORIES
                </div>
                <Layers size={18} style={{ color: '#2563eb' }} />
              </div>

              {stats.serviceTypeBreakdown?.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No categorized requests yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.serviceTypeBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                        {item._id}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#2563eb'
                        }}
                      >
                        {item.count} request{item.count === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AdminAnalytics;
