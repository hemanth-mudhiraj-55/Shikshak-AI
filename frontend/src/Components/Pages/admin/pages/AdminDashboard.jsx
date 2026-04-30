import React, { useEffect, useState } from 'react';
import { AlertCircle, Bot, CreditCard, GraduationCap, Users2, Video } from 'lucide-react';
import { api } from '../../../../services/api';

const Stat = ({ icon: Icon, label, value }) => (
  <div style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.75)' }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: 14, background: 'rgba(34,197,94,0.12)', display: 'grid', placeItems: 'center' }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{value}</div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/teachers/admin-overview');
        setOverview(res.data?.data || null);
      } catch (e) {
        setError(e.message || 'Failed to load admin overview');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Stat icon={Users2} label="Students" value={loading ? '...' : overview?.totalStudents ?? 0} />
        <Stat icon={GraduationCap} label="Approved Teachers" value={loading ? '...' : overview?.totalTeachers ?? 0} />
        <Stat icon={Bot} label="Ready Avatars" value={loading ? '...' : overview?.readyAvatars ?? 0} />
        <Stat icon={Video} label="Live Sessions" value={loading ? '...' : overview?.liveSessions ?? 0} />
        <Stat icon={Users2} label="Pending Requests" value={loading ? '...' : overview?.pendingTeacherRequests ?? 0} />
        <Stat icon={CreditCard} label="Fee Invoices" value={loading ? '...' : overview?.invoices ?? 0} />
      </div>

      <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.65)' }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Next Steps</div>
        <div style={{ color: '#64748b', fontSize: 13 }}>
          Keep the teacher pipeline moving: approve requests, prepare reusable avatars once, and support students in live class sessions.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

