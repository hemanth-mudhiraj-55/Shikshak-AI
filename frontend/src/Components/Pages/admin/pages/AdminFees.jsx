import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, PlusCircle, XCircle } from 'lucide-react';
import { api } from '../../../../services/api';

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);

const toDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const AdminFees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    term: '',
    amount: '',
    dueDate: '',
    status: 'issued',
    lineItemLabel: '',
    lineItemAmount: '',
  });

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/fees/invoices');
      setInvoices(res.data?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const createInvoice = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const lineItems = [];
      if (form.lineItemLabel.trim() && String(form.lineItemAmount).trim()) {
        lineItems.push({ label: form.lineItemLabel.trim(), amount: Number(form.lineItemAmount) || 0 });
      }

      await api.post('/admin/fees/invoices', {
        studentId: form.studentId.trim(),
        term: form.term.trim() || null,
        amount: Number(form.amount) || 0,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        status: form.status,
        lineItems,
      });

      setForm({
        studentId: '',
        term: '',
        amount: '',
        dueDate: '',
        status: 'issued',
        lineItemLabel: '',
        lineItemAmount: '',
      });
      await refresh();
    } catch (e2) {
      setError(e2.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const voidInvoice = async (id) => {
    setError(null);
    try {
      await api.post(`/admin/fees/invoices/${id}/void`, {});
      await refresh();
    } catch (e) {
      setError(e.message || 'Failed to void invoice');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>Fees & Invoices</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>Create invoices and track payment status.</div>
        </div>
        <button className="pagination-button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 12, padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.75)' }}>
        <div style={{ fontWeight: 900, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <PlusCircle size={18} /> Create Invoice
        </div>
        <form onSubmit={createInvoice} style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Student Id</label>
            <input value={form.studentId} onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))} placeholder="UUID of student" />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Term</label>
            <input value={form.term} onChange={(e) => setForm(prev => ({ ...prev, term: e.target.value }))} placeholder="e.g., 2026-T1" />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Amount</label>
            <input value={form.amount} onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="e.g., 45000" />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}>
              <option value="issued">issued</option>
              <option value="draft">draft</option>
              <option value="void">void</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Line Item Label (optional)</label>
            <input value={form.lineItemLabel} onChange={(e) => setForm(prev => ({ ...prev, lineItemLabel: e.target.value }))} placeholder="e.g., Semester Fee" />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Line Item Amount (optional)</label>
            <input value={form.lineItemAmount} onChange={(e) => setForm(prev => ({ ...prev, lineItemAmount: e.target.value }))} placeholder="e.g., 45000" />
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button className="pagination-button" type="submit" disabled={creating}>
              {creating ? 'Creating…' : (<><CheckCircle2 size={16} style={{ marginRight: 6 }} /> Create</>)}
            </button>
          </div>
        </form>
        <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
          Tip: you can copy a student id from `backend/data/db.json` users list.
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 14, borderRadius: 16, border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.75)' }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>All Invoices</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '8px 6px' }}>Student</th>
                <th style={{ padding: '8px 6px' }}>Term</th>
                <th style={{ padding: '8px 6px' }}>Due</th>
                <th style={{ padding: '8px 6px' }}>Status</th>
                <th style={{ padding: '8px 6px' }}>Amount</th>
                <th style={{ padding: '8px 6px' }}></th>
              </tr>
            </thead>
            <tbody>
              {!loading && invoices.length === 0 && (
                <tr><td colSpan="6" style={{ padding: 10, color: '#64748b' }}>No invoices yet.</td></tr>
              )}
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderTop: '1px solid rgba(148,163,184,0.25)' }}>
                  <td style={{ padding: '10px 6px', fontFamily: 'monospace' }}>{String(inv.studentId).slice(0, 8)}…</td>
                  <td style={{ padding: '10px 6px' }}>{inv.term || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>{toDate(inv.dueDate)}</td>
                  <td style={{ padding: '10px 6px' }}>{inv.status}</td>
                  <td style={{ padding: '10px 6px', fontWeight: 800 }}>{formatInr(inv.amount)}</td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    {inv.status !== 'paid' && inv.status !== 'void' ? (
                      <button className="pagination-button" onClick={() => voidInvoice(inv._id)}>
                        <XCircle size={16} style={{ marginRight: 6 }} /> Void
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFees;

