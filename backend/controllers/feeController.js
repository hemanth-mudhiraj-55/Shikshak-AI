const fs = require('fs/promises');
const path = require('path');
const { readDb, withDb, makeRecord, touchRecord } = require('../lib/localStore');

function currentTermKey(now = new Date()) {
  const year = now.getFullYear();
  const term = now.getMonth() < 6 ? 'T1' : 'T2';
  return `${year}-${term}`;
}

function deriveInvoiceStatus(invoice) {
  if (invoice.status === 'paid' || invoice.status === 'void' || invoice.status === 'draft') return invoice.status;
  const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
  if (due && due < new Date()) return 'overdue';
  return invoice.status || 'issued';
}

function ensureReceiptDir() {
  return fs.mkdir(path.join(__dirname, '../uploads/receipts'), { recursive: true });
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return num.toFixed(2);
}

class FeeController {
  async getOverview(req, res) {
    try {
      const userId = req.user._id;
      let overview;

      await withDb(async (db) => {
        const invoices = db.feeInvoices.filter(inv => inv.studentId === userId);

        // Keep stored statuses up-to-date.
        invoices.forEach((inv) => {
          const nextStatus = deriveInvoiceStatus(inv);
          if (nextStatus !== inv.status) {
            inv.status = nextStatus;
            inv.updatedAt = new Date().toISOString();
          }
        });

        const unpaid = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft');
        const paid = invoices.filter(inv => inv.status === 'paid');

        const amountDue = unpaid.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
        const overdue = unpaid.filter(inv => inv.status === 'overdue');
        const nextDue = unpaid
          .filter(inv => inv.dueDate)
          .map(inv => new Date(inv.dueDate))
          .sort((a, b) => a - b)[0] || null;

        const term = currentTermKey();
        const paidThisTerm = paid
          .filter(inv => inv.term === term)
          .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

        overview = {
          term,
          amountDue,
          nextDueDate: nextDue ? nextDue.toISOString() : null,
          paidThisTerm,
          overdueCount: overdue.length,
          invoiceCount: invoices.length
        };
      });

      res.json({ success: true, data: overview });
    } catch (error) {
      console.error('Fees overview error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fees overview' });
    }
  }

  async listInvoices(req, res) {
    try {
      const userId = req.user._id;
      const { status, term } = req.query;

      const db = await readDb();
      let invoices = db.feeInvoices
        .filter(inv => inv.studentId === userId)
        .map(inv => ({ ...inv, status: deriveInvoiceStatus(inv) }));

      if (status && status !== 'all') invoices = invoices.filter(inv => inv.status === status);
      if (term && term !== 'all') invoices = invoices.filter(inv => inv.term === term);

      invoices.sort((a, b) => new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt));

      res.json({ success: true, data: invoices });
    } catch (error) {
      console.error('List invoices error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  }

  async listPayments(req, res) {
    try {
      const userId = req.user._id;
      const db = await readDb();
      const invoices = db.feeInvoices.filter(inv => inv.studentId === userId);
      const invoiceIds = new Set(invoices.map(inv => inv._id));

      const payments = db.payments
        .filter(p => invoiceIds.has(p.invoiceId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, data: payments });
    } catch (error) {
      console.error('List payments error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
  }

  async payInvoice(req, res) {
    try {
      const userId = req.user._id;
      const invoiceId = String(req.params.id || '').trim();
      const method = String(req.body?.method || 'manual').trim();

      if (!invoiceId) {
        return res.status(400).json({ success: false, message: 'Invoice id is required' });
      }

      let payment;
      let invoice;

      await withDb(async (db) => {
        invoice = db.feeInvoices.find(inv => inv._id === invoiceId);
        if (!invoice || invoice.studentId !== userId) {
          throw new Error('Invoice not found');
        }

        const derived = deriveInvoiceStatus(invoice);
        if (derived === 'paid') {
          throw new Error('Invoice already paid');
        }
        if (derived === 'void' || derived === 'draft') {
          throw new Error('Invoice cannot be paid');
        }

        payment = makeRecord({
          invoiceId,
          amount: Number(invoice.amount) || 0,
          method,
          status: 'captured',
          provider: 'local',
          providerRef: `LOCAL-${Date.now()}`,
        });

        db.payments.push(payment);

        invoice.status = 'paid';
        invoice.paidAt = new Date().toISOString();
        invoice.paymentId = payment._id;
        Object.assign(invoice, touchRecord(invoice));
      });

      await ensureReceiptDir();

      const receiptNumber = `REC-${new Date().getFullYear()}-${String(payment._id).slice(0, 8).toUpperCase()}`;
      const receiptFilename = `${receiptNumber}.txt`;
      const receiptPath = path.join(__dirname, '../uploads/receipts', receiptFilename);
      const receiptUrl = `uploads/receipts/${receiptFilename}`;

      const lines = [
        'Shikshak AI - Fee Payment Receipt',
        `Receipt No: ${receiptNumber}`,
        `Date: ${new Date().toLocaleString('en-IN')}`,
        '',
        `Invoice Id: ${invoiceId}`,
        `Term: ${invoice.term || ''}`,
        `Amount: INR ${formatMoney(payment.amount)}`,
        `Method: ${payment.method}`,
        `Payment Ref: ${payment.providerRef}`,
        '',
        'This is a locally generated receipt (no payment gateway verification).'
      ];

      await fs.writeFile(receiptPath, lines.join('\n'), 'utf8');

      await withDb(async (db) => {
        const stored = db.payments.find(p => p._id === payment._id);
        if (stored) {
          stored.receiptNumber = receiptNumber;
          stored.receiptUrl = receiptUrl;
          stored.updatedAt = new Date().toISOString();
        }

        db.receipts.push(makeRecord({
          paymentId: payment._id,
          invoiceId,
          receiptNumber,
          url: receiptUrl
        }));
      });

      res.status(201).json({ success: true, message: 'Payment recorded', data: { paymentId: payment._id } });
    } catch (error) {
      if (['Invoice not found', 'Invoice already paid', 'Invoice cannot be paid'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Pay invoice error:', error);
      res.status(500).json({ success: false, message: 'Failed to pay invoice' });
    }
  }
}

module.exports = new FeeController();

