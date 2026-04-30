import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import AdminDashboard from './pages/AdminDashboard';
import AdminTeacherRequests from './pages/AdminTeacherRequests';
import AdminFees from './pages/AdminFees';
import AdminUsers from './pages/AdminUsers';

const AdminLayout = () => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success && response.data?.data?.user) {
          setUser(response.data.data.user);
        }
      } catch (e) {
        console.error('Admin load user failed:', e);
        authService.logout();
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const pageTitle = (() => {
    const p = location.pathname.replace('/admin', '') || '/';
    if (p === '/' || p === '') return 'Admin';
    const seg = p.split('/').filter(Boolean)[0] || 'Admin';
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  })();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading admin…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <AdminTopbar title={pageTitle} user={user} />
      <div className="flex h-[calc(100vh-90px)] overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-6 space-y-6">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeacherRequests />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
