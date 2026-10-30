import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import InspectStudioPage from './pages/InspectStudioPage';
import InspectionsHistoryPage from './pages/InspectionsHistoryPage';
import InspectionDetailPage from './pages/InspectionDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sites"
            element={
              <ProtectedRoute>
                <Layout>
                  <SitesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspect"
            element={
              <ProtectedRoute>
                <Layout>
                  <InspectStudioPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections"
            element={
              <ProtectedRoute>
                <Layout>
                  <InspectionsHistoryPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspections/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <InspectionDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

