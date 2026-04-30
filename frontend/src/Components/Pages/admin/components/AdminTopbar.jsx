import React from 'react';

const AdminTopbar = ({ title, user }) => {
  return (
    <div style={{ height: 90, padding: '18px 24px', borderBottom: '1px solid rgba(148,163,184,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{title}</div>
        <div style={{ color: '#64748b', fontSize: 12 }}>Admin console</div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, lineHeight: 1.1 }}>{user?.username || 'admin'}</div>
          <div style={{ color: '#64748b', fontSize: 12 }}>{user?.email || ''}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#22c55e,#f59e0b)' }} />
      </div>
    </div>
  );
};

export default AdminTopbar;

