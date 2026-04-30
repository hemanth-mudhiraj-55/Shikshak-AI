import { useState, useEffect } from 'react';
import './App.css';
import Home from "./Components/Pages/homepage/home";
import ForgetPassword from "./Components/Pages/forgetpassword/ForgetPassword";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Components/Pages/dashboard/Layouts/Sidebar";
import Header from "./Components/Pages/dashboard/Layouts/Header";
import Dashboard from "./Components/Pages/dashboard/dboard/Dashboard";
import TodoList from "./Components/Pages/dashboard/Todolist/TodoList";
import Calendar from "./Components/Pages/dashboard/Calender/Calender";
import Transactions from "./Components/Pages/dashboard/transactions/Transactions";
import Books from "./Components/Pages/dashboard/Books/Books";
import authService from './services/authService';
import HomeWork from "./Components/Pages/dashboard/HomeWork/HomeWork";
import Exam from "./Components/Pages/dashboard/Exam/Exam";
import Messages from './Components/Pages/dashboard/Messages/Messages';
import Settings from './Components/Pages/dashboard/Settings/Settings';
import Analytics from './Components/Pages/dashboard/Analytics/Analytics';
import Teachers from './Components/Pages/dashboard/Teachers/Teachers';
import AdminLayout from './Components/Pages/admin/AdminLayout';

function ProtectedRoute({ children }) {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getStoredUser();
  if (!isAuth) return <Navigate to="/" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(authService.getStoredUser());
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data?.data?.user) {
            setUser(response.data.data.user);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        authService.logout();
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Get current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname.replace('/dashboard/', '').replace('/dashboard', '');
    if (!path || path === '/') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />
      <div className="flex h-[calc(100vh-90px)] overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPage={getCurrentPage()}
          onPageChange={() => {}}
          userRole={user?.role || 'user'}
        />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-6 space-y-6">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="todolist" element={<TodoList />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="books" element={<Books />} />
              <Route path="homework" element={<HomeWork />} />
              <Route path="exam" element={<Exam />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings collapsed={sidebarCollapsed} />} />
              <Route path="analytics" element={<Analytics collapsed={sidebarCollapsed} />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
      />
      <Route
        path="/forgetpassword"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgetPassword />}
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
