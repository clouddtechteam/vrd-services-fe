import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { ClientsManagement } from './ClientsManagement';
import { AdminServicesPage } from './AdminServicesPage';
import { AdminAnalytics } from './AdminAnalytics';

export const AdminDashboard = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="clients" element={<ClientsManagement />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route
            path="profile"
            element={
              <div className="main-container">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
                  Administrator Profile
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Manage your master account credentials and security keys.
                </p>
              </div>
            }
          />
          <Route path="*" element={<Navigate to="analytics" replace />} />
        </Routes>
      </main>
    </div>
  );
};
