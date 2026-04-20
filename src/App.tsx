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
import { Analytics } from './pages/Analytics';
import { Borrowing } from './pages/Borrowing';
import { BookHistory } from './pages/BookHistory';
import { BookEdit } from './pages/BookEdit';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id/details" element={<UserDetails />} />
          <Route path="users/:id/profile" element={<UserProfile />} />
          <Route path="library" element={<Library />} />
          <Route path="library/:id/details" element={<BookDetails />} />
          <Route path="library/:id/history" element={<BookHistory />} />
          <Route path="library/:id/edit" element={<BookEdit />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="borrowing" element={<Borrowing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
