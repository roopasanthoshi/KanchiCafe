import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminApprovals from './pages/AdminApprovals.jsx';
import AdminMenu from './pages/AdminMenu.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminTables from './pages/AdminTables.jsx';
import AdminQR from './pages/AdminQR.jsx';
import AdminReviews from './pages/AdminReviews.jsx';
import AdminReports from './pages/AdminReports.jsx';
import AdminPrinterSettings from './pages/AdminPrinterSettings.jsx';
import AdminCafeSettings from './pages/AdminCafeSettings.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import CustomerFlow from './pages/CustomerFlow.jsx';

function RequireAuth({ children }) {
  const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Scan Routing */}
        <Route path="/table/:tableNumber" element={<CustomerFlow />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard Pages */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="qr" element={<AdminQR />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="printer" element={<AdminPrinterSettings />} />
          <Route path="settings" element={<AdminCafeSettings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Global Fallback to Admin Login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
