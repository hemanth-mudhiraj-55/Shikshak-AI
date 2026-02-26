import { useState, useEffect } from 'react';
import './App.css';
import Home from "./Components/Pages/homepage/home";
import ForgetPassword from "./Components/Pages/forgetpassword/ForgetPassword";
import { Routes, Route, Navigate } from "react-router-dom";
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


function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔥 THIS MAKES AUTH REACTIVE
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Dashboard Layout
  const DashboardLayout = () => {
    const user = authService.getCurrentUser();

    const renderContent = () => {
      switch (currentPage) {
        case 'Dashboard':
          return <Dashboard />;
        case 'Todolist':
          return <TodoList />;
        case 'Calendar':
          return <Calendar />;
        case 'Transactions':
          return <Transactions />;
        case 'Books':
          return <Books />;
          case 'Homework':
            return <HomeWork />;
          case 'Exam':
            return <Exam />;
          case 'Messages':
            return <Messages />;
          case 'Settings':
            return <Settings />;
          case 'Analytics':
            return <Analytics />;
          case 'Teachers':
            return <Teachers />;
          
        default:
          return <Dashboard />;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* <Header
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              user={user}
            /> */}
            <main className="flex-1 overflow-y-auto bg-transparent">
              <div className="p-6 space-y-6">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Home />
        }
      />

      <Route
        path="/forgetpassword"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <ForgetPassword />
        }
      />

      <Route path="/dashboard" element={<DashboardLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;