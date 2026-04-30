import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cpu, ListChecks, Upload, Volume2, XCircle } from 'lucide-react';
import { api } from '../../../../services/api';
import { API_ENDPOINTS, SERVER_BASE_URL } from '../../../../services/apiConstants';

const toAssetUrl = (value) => {
  if (!value) return null;
  const v = String(value);
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.startsWith('uploads/')) return `${SERVER_BASE_URL}/${v}`;
  if (v.startsWith('/uploads/')) return `${SERVER_BASE_URL}${v}`;
  return v;
};

const AdminTeacherRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [uploadTeacherId, setUploadTeacherId] = useState(null);
  const [prepareConfig, setPrepareConfig] = useState({});

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/teachers/requests');
      setRequests(res.data?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const approve = async (id) => {
    setError(null);
    try {
      await api.post(`/teachers/requests/${id}/approve`, {});
      await refresh();
    } catch (e) {
      setError(e.message || 'Approve failed');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    setError(null);
    try {
      await api.post(`/teachers/requests/${id}/reject`, { reason });
      await refresh();
    } catch (e) {
      setError(e.message || 'Reject failed');
    }
  };

  const prepareAvatar = async (id) => {
    setError(null);
    const config = prepareConfig[id] || {};
    try {
      await api.post(API_ENDPOINTS.TEACHERS.PREPARE_AVATAR(id), {
        avatarType: 'live-photo-avatar',
        voiceProfile: config.voiceProfile || 'default-teacher',
        speechRate: config.speechRate || 0.96,
        speechPitch: config.speechPitch || 1,
        teachingStyle: config.teachingStyle || 'friendly'
      });
      await refresh();
    } catch (e) {
      setError(e.message || 'Prepare avatar failed');
    }
  };

  const updateConfig = (teacherId, patch) => {
    setPrepareConfig(prev => ({
      ...prev,
      [teacherId]: {
        voiceProfile: prev[teacherId]?.voiceProfile || 'default-teacher',
        speechRate: prev[teacherId]?.speechRate || 0.96,
        speechPitch: prev[teacherId]?.speechPitch || 1,
        teachingStyle: prev[teacherId]?.teachingStyle || 'friendly',
        ...patch
      }
    }));
  };

  const uploadAvatarVideo = async (teacherId, file) => {
    if (!file) return;
    setError(null);
    try {
      const fd = new FormData();
      fd.append('generatedAvatar', file);
      await api.postForm(`/teachers/${teacherId}/generated-avatar`, fd);
      setUploadTeacherId(null);
      await refresh();
    } catch (e) {
      setError(e.message || 'Upload avatar video failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Teacher Model Requests</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>Approve the face request first, then prepare the reusable avatar once.</div>
        </div>
        <button className="pagination-button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {!loading && requests.length === 0 && (
          <div style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.65)', color: '#64748b' }}>
            No teacher requests found.
          </div>
        )}

        {requests.map((r) => (
          <div key={r._id} style={{ padding: 12, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.75)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {toAssetUrl(r.photoUrl) ? (
                <img src={toAssetUrl(r.photoUrl)} alt="" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(148,163,184,0.25)' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900 }}>{r.aiTeacherName}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{r.subject}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  Request: {r.status} | Avatar: {r.avatarStatus || 'pending'} | Requested by: {String(r.addedBy).slice(0, 8)}...
                </div>
                {typeof r.averageRating === 'number' && (
                  <div style={{ color: '#64748b', fontSize: 12 }}>
                    Student rating: {r.averageRating}/5 from {r.feedbackCount || 0} sessions
                  </div>
                )}
              </div>
              {r.status === 'pending' && (
                <>
                  <button className="pagination-button" onClick={() => approve(r._id)}>
                    <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Approve
                  </button>
                  <button className="pagination-button" onClick={() => reject(r._id)}>
                    <XCircle size={16} style={{ marginRight: 6 }} /> Reject
                  </button>
                </>
              )}
              {r.status === 'approved' && (
                <button className="pagination-button" onClick={() => prepareAvatar(r._id)} disabled={r.avatarStatus === 'ready'}>
                  <Cpu size={16} style={{ marginRight: 6 }} /> {r.avatarStatus === 'ready' ? 'Avatar Ready' : 'Prepare Avatar'}
                </button>
              )}
            </div>

            {r.status === 'approved' && (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <div style={{ padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800, marginBottom: 8 }}>
                    <ListChecks size={16} />
                    <span>AI Readiness Checklist</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#334155' }}>
                    {Object.entries(r.readinessChecklist || {}).map(([key, value]) => (
                      <span key={key} style={{ padding: '4px 8px', borderRadius: 999, background: value ? '#dcfce7' : '#fee2e2', color: value ? '#166534' : '#991b1b', fontWeight: 700 }}>
                        {key}: {value ? 'yes' : 'no'}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 10, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800 }}>
                    <Volume2 size={16} />
                    <span>Teacher voice and style</span>
                  </div>
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                      <span>Voice profile</span>
                      <select value={prepareConfig[r._id]?.voiceProfile || r.voiceProfile || 'default-teacher'} onChange={(e) => updateConfig(r._id, { voiceProfile: e.target.value })}>
                        <option value="default-teacher">Default teacher</option>
                        <option value="calm-mentor">Calm mentor</option>
                        <option value="energetic-guide">Energetic guide</option>
                        <option value="formal-lecturer">Formal lecturer</option>
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                      <span>Teaching style</span>
                      <select value={prepareConfig[r._id]?.teachingStyle || r.teachingStyle || 'friendly'} onChange={(e) => updateConfig(r._id, { teachingStyle: e.target.value })}>
                        <option value="friendly">Friendly</option>
                        <option value="calm">Calm</option>
                        <option value="strict">Strict</option>
                        <option value="concise">Concise</option>
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                      <span>Speech rate</span>
                      <input type="number" min="0.7" max="1.3" step="0.01" value={prepareConfig[r._id]?.speechRate || r.speechRate || 0.96} onChange={(e) => updateConfig(r._id, { speechRate: e.target.value })} />
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                      <span>Speech pitch</span>
                      <input type="number" min="0.7" max="1.5" step="0.01" value={prepareConfig[r._id]?.speechPitch || r.speechPitch || 1} onChange={(e) => updateConfig(r._id, { speechPitch: e.target.value })} />
                    </label>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Optional: upload a generated preview avatar MP4 from Kaggle or another GPU workflow.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <input type="file" accept="video/*" onChange={(e) => uploadAvatarVideo(r._id, e.target.files?.[0] || null)} />
                  <button className="pagination-button" type="button" onClick={() => setUploadTeacherId(uploadTeacherId === r._id ? null : r._id)}>
                    <Upload size={16} style={{ marginRight: 6 }} /> {uploadTeacherId === r._id ? 'Close Upload' : 'Upload Preview'}
                  </button>
                </div>
                {uploadTeacherId === r._id && (
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Choose an MP4 file and it will be attached to this teacher as the generated avatar preview.
                  </div>
                )}
                {toAssetUrl(r.generatedAvatarUrl) && (
                  <div style={{ fontSize: 12 }}>
                    Current generated asset: <a href={toAssetUrl(r.generatedAvatarUrl)} target="_blank" rel="noreferrer">open preview</a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTeacherRequests;
