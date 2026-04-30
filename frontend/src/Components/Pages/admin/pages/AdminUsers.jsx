import React, { useEffect, useState } from 'react';
import { AlertCircle, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../services/apiConstants';

const badgeStyle = (status) => ({
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  color: status === 'active' ? '#166534' : '#991b1b',
  background: status === 'active' ? '#dcfce7' : '#fee2e2'
});

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = search.trim()
        ? `${API_ENDPOINTS.ADMIN.USERS}?query=${encodeURIComponent(search.trim())}`
        : API_ENDPOINTS.ADMIN.USERS;
      const res = await api.get(endpoint);
      setUsers(res.data?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateStatus = async (userId, accountStatus) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await api.post(API_ENDPOINTS.ADMIN.USER_STATUS(userId), { accountStatus });
      await loadUsers(query);
    } catch (e) {
      setError(e.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Student Accounts</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            Search students, review activity footprint, and enable or disable access when needed.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username or email"
              style={{ padding: '8px 12px 8px 34px', borderRadius: 12, border: '1px solid rgba(148,163,184,0.35)', minWidth: 240 }}
            />
          </div>
          <button className="pagination-button" onClick={() => loadUsers(query)} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {!loading && users.length === 0 && (
          <div style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.65)', color: '#64748b' }}>
            No student accounts found.
          </div>
        )}

        {users.map((user) => {
          const busy = updatingId === user._id;
          const isActive = (user.accountStatus || 'active') === 'active';
          return (
            <div
              key={user._id}
              style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.78)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 5 }}>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{user.username || 'Student'}</div>
                  <div style={{ color: '#475569', fontSize: 13 }}>{user.email || 'No email provided'}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                    <span style={badgeStyle(user.accountStatus || 'active')}>{user.accountStatus || 'active'}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Teacher requests: {user.teacherRequests || 0}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                    {user.lastLogin && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>Last login: {new Date(user.lastLogin).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => updateStatus(user._id, 'active')}
                    disabled={busy || isActive}
                  >
                    <UserCheck size={16} style={{ marginRight: 6 }} /> Activate
                  </button>
                  <button
                    className="pagination-button"
                    type="button"
                    onClick={() => updateStatus(user._id, 'inactive')}
                    disabled={busy || !isActive}
                  >
                    <UserX size={16} style={{ marginRight: 6 }} /> Deactivate
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.65)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 900, marginBottom: 6 }}>
          <Shield size={18} />
          <span>Admin note</span>
        </div>
        <div style={{ color: '#64748b', fontSize: 13 }}>
          This page gives the admin a visible moderation layer, which makes the project feel more complete and institution-ready.
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
