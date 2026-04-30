const { readDb, withDb, makeRecord } = require('../lib/localStore');

class TransactionController {
  async getAll(req, res) {
    try {
      const { status, category, startDate, endDate } = req.query;
      const db = await readDb();
      let transactions = db.transactions.filter(item => item.user === req.user._id);

      if (status && status !== 'all') transactions = transactions.filter(item => item.status === status);
      if (category && category !== 'all') transactions = transactions.filter(item => item.category === category);
      if (startDate) transactions = transactions.filter(item => new Date(item.date) >= new Date(startDate));
      if (endDate) transactions = transactions.filter(item => new Date(item.date) <= new Date(endDate));

      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json({ success: true, data: transactions });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
  }

  async create(req, res) {
    try {
      let transaction;
      await withDb(async (db) => {
        transaction = makeRecord({
          user: req.user._id,
          ...req.body,
          amount: Number(req.body.amount) || 0,
          date: req.body.date || new Date().toISOString(),
          status: req.body.status || 'pending'
        });
        db.transactions.push(transaction);
      });
      res.status(201).json({ success: true, data: transaction });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to create transaction' });
    }
  }

  async getStats(req, res) {
    try {
      const db = await readDb();
      const userTransactions = db.transactions.filter(item => item.user === req.user._id);
      const totalTransactions = userTransactions.length;
      const totalPaid = userTransactions
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const pendingAmount = userTransactions
        .filter(item => item.status === 'pending')
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      res.json({
        success: true,
        data: { totalTransactions, totalPaid, pendingAmount }
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }
}

module.exports = new TransactionController();
