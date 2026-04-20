/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { UserDetails } from './pages/UserDetails';
import { UserProfile } from './pages/UserProfile';
import { Library } from './pages/Library';
import { BookDetails } from './pages/BookDetails';
import { Borrowing } from './pages/Borrowing';
import { BookHistory } from './pages/BookHistory';
import { BookEdit } from './pages/BookEdit';
import { LoginPage } from './pages/LoginPage';
import { Settings } from './pages/Settings';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuthProvider, useAuth } from './lib/auth';
import { PageLoader } from './components/ui/PageLoader';
import { ToastProvider } from './lib/toast';
import { NotificationsProvider } from './lib/notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route
                element={(
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                )}
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/new" element={<UserDetails />} />
                <Route path="users/:id/details" element={<UserDetails />} />
                <Route path="users/:id/profile" element={<UserProfile />} />
                <Route path="library" element={<Library />} />
                <Route path="library/new/edit" element={<BookEdit />} />
                <Route path="library/:id/details" element={<BookDetails />} />
                <Route path="library/:id/history" element={<BookHistory />} />
                <Route path="library/:id/edit" element={<BookEdit />} />
                <Route path="borrowing" element={<Borrowing />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </NotificationsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
