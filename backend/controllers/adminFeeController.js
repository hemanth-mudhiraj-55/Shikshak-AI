const { withDb, makeRecord, touchRecord } = require('../lib/localStore');

function normalizeLineItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      label: String(it?.label || '').trim(),
      amount: Number(it?.amount) || 0,
    }))
    .filter(it => it.label && it.amount >= 0);
}

class AdminFeeController {
  async createInvoice(req, res) {
    try {
      const studentId = String(req.body?.studentId || '').trim();
      const term = String(req.body?.term || '').trim() || undefined;
      const amount = Number(req.body?.amount) || 0;
      const dueDate = req.body?.dueDate ? new Date(req.body.dueDate).toISOString() : null;
      const lineItems = normalizeLineItems(req.body?.lineItems);
      const status = String(req.body?.status || 'issued');

      if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
      if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'amount must be > 0' });
      if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return res.status(400).json({ success: false, message: 'dueDate is invalid' });

      let invoice;
      await withDb(async (db) => {
        const student = db.users.find(u => u._id === studentId);
        if (!student) throw new Error('Student not found');

        invoice = makeRecord({
          studentId,
          term: term || null,
          amount,
          dueDate,
          status,
          lineItems,
          issuedAt: status !== 'draft' ? new Date().toISOString() : null,
          paidAt: null,
          paymentId: null
        });

        db.feeInvoices.push(invoice);
      });

      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      if (['Student not found'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Admin create invoice error:', error);
      res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
  }

  async listInvoices(req, res) {
    try {
      let invoices = [];
      await withDb(async (db) => {
        invoices = [...db.feeInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      console.error('Admin list invoices error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  }

  async voidInvoice(req, res) {
    try {
      const id = String(req.params.id || '').trim();
      if (!id) return res.status(400).json({ success: false, message: 'Invoice id is required' });
      let updated;
      await withDb(async (db) => {
        const invoice = db.feeInvoices.find(inv => inv._id === id);
        if (!invoice) return;
        if (invoice.status === 'paid') return;
        invoice.status = 'void';
        Object.assign(invoice, touchRecord(invoice));
        updated = invoice;
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Admin void invoice error:', error);
      res.status(500).json({ success: false, message: 'Failed to void invoice' });
    }
  }
}

module.exports = new AdminFeeController();

