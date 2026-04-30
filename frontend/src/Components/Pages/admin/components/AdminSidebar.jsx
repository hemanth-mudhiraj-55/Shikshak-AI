import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users2, CreditCard, LogOut, UserCog } from 'lucide-react';
import authService from '../../../../services/authService';

const items = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, to: '/admin' },
  { id: 'teachers', label: 'Teacher Requests', icon: Users2, to: '/admin/teachers' },
  { id: 'users', label: 'Student Accounts', icon: UserCog, to: '/admin/users' },
  { id: 'fees', label: 'Fees & Invoices', icon: CreditCard, to: '/admin/fees' },
];

const AdminSidebar = () => {
  const nav = useNavigate();
  const loc = useLocation();

  const logout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <aside style={{ width: 280, padding: 16, borderRight: '1px solid rgba(148,163,184,0.35)' }}>
      <div style={{ fontWeight: 900, letterSpacing: 0.5, marginBottom: 14 }}>
        Shikshak AI Admin
      </div>

      <nav style={{ display: 'grid', gap: 8 }}>
        {items.map((it) => {
          const active = loc.pathname === it.to || loc.pathname.startsWith(it.to + '/');
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => nav(it.to)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 12,
                border: active ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(148,163,184,0.25)',
                background: active ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.65)',
                textAlign: 'left',
                fontWeight: 700,
              }}
            >
              <Icon size={18} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.25)',
            background: 'rgba(255,255,255,0.65)',
            fontWeight: 700,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
