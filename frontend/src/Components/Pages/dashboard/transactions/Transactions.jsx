import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import './Transactions.css';
import { api } from '../../../../services/api';
import { API_ENDPOINTS, SERVER_BASE_URL } from '../../../../services/apiConstants';

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);

const toDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid') return { label: 'Paid', cls: 'completed' };
  if (s === 'overdue') return { label: 'Overdue', cls: 'pending' };
  if (s === 'issued') return { label: 'Due', cls: 'pending' };
  if (s === 'draft') return { label: 'Draft', cls: 'pending' };
  if (s === 'void') return { label: 'Void', cls: 'pending' };
  return { label: s || 'Unknown', cls: 'pending' };
};

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paying, setPaying] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, inv, pay] = await Promise.all([
        api.get(API_ENDPOINTS.FEES.OVERVIEW),
        api.get(API_ENDPOINTS.FEES.INVOICES),
        api.get(API_ENDPOINTS.FEES.PAYMENTS),
      ]);

      setOverview(ov.data?.data || null);
      setInvoices(inv.data?.data || []);
      setPayments(pay.data?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const amountDue = overview?.amountDue ?? invoices
    .filter(i => i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft')
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const nextDue = overview?.nextDueDate || null;

  const payInvoice = async (invoiceId) => {
    setPaying(invoiceId);
    setError(null);
    try {
      await api.post(API_ENDPOINTS.FEES.PAY_INVOICE(invoiceId), { method: 'manual' });
      await refresh();
    } catch (e) {
      setError(e.message || 'Payment failed');
    } finally {
      setPaying(null);
    }
  };

  const receiptHref = (payment) => {
    const url = payment?.receiptUrl;
    if (!url) return null;
    if (String(url).startsWith('http')) return url;
    if (String(url).startsWith('/uploads/')) return `${SERVER_BASE_URL}${url}`;
    if (String(url).startsWith('uploads/')) return `${SERVER_BASE_URL}/${url}`;
    return url;
  };

  const unpaidInvoices = useMemo(
    () => invoices.filter(i => i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft'),
    [invoices]
  );

  const overdueCount = overview?.overdueCount ?? unpaidInvoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">Fees & Payments</h1>
          <p className="transactions-subtitle">View your invoices, pay dues, and download receipts.</p>
        </div>
        <button className="compact-filter-button" onClick={refresh} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#fee2e2', color: '#7f1d1d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending-icon"><CreditCard size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Amount Due</span>
            <span className="stat-value pending-value">{formatInr(amountDue)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Next Due Date</span>
            <span className="stat-value">{nextDue ? toDate(nextDue) : '-'}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed-icon"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Paid This Term</span>
            <span className="stat-value completed-value">{formatInr(overview?.paidThisTerm || 0)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending-icon"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Overdue</span>
            <span className="stat-value pending-value">{overdueCount}</span>
          </div>
        </div>
      </div>

      <div className="transactions-table-container">
        <h2 style={{ margin: '12px 0' }}>Invoices</h2>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Term</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">
                  <CreditCard size={48} />
                  <p>No invoices assigned yet.</p>
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const badge = statusBadge(inv.status);
              const canPay = inv.status === 'issued' || inv.status === 'overdue';
              return (
                <tr key={inv._id || inv.id}>
                  <td>{inv.term || '-'}</td>
                  <td>{toDate(inv.dueDate)}</td>
                  <td>
                    <span className={`status-badge ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td>
                    <span className={`amount ${inv.status === 'paid' ? 'paid-amount' : 'pending-amount'}`}>
                      {formatInr(inv.amount)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {canPay ? (
                      <button className="pagination-button" onClick={() => payInvoice(inv._id)} disabled={!!paying}>
                        {paying === inv._id ? 'Paying…' : 'Pay'}
                      </button>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="transactions-table-container" style={{ marginTop: 18 }}>
        <h2 style={{ margin: '12px 0' }}>Payment History</h2>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {!loading && payments.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  <Download size={48} />
                  <p>No payments yet.</p>
                </td>
              </tr>
            )}
            {payments.map((p) => {
              const href = receiptHref(p);
              return (
                <tr key={p._id || p.id}>
                  <td>{toDate(p.createdAt)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{String(p.invoiceId || '').slice(0, 10)}…</td>
                  <td>{p.method || '-'}</td>
                  <td>
                    <span className={`status-badge ${p.status === 'captured' ? 'completed' : 'pending'}`}>
                      {p.status || 'unknown'}
                    </span>
                  </td>
                  <td>{formatInr(p.amount)}</td>
                  <td>
                    {href ? (
                      <a className="compact-download-button" href={href} target="_blank" rel="noreferrer">
                        <Download size={16} /> Receipt
                      </a>
                    ) : (
                      <span style={{ color: '#64748b' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {overview?.term && (
        <p style={{ marginTop: 14, color: '#64748b', fontSize: 12 }}>
          Term: {overview.term}. Payments are recorded locally (gateway integration not added yet).
        </p>
      )}
    </div>
  );
};

export default Transactions;

