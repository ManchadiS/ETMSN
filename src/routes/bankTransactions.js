const express = require('express');
const router = express.Router();
const {
  listBankTransactions,
  createBankTransaction,
  getBankTransaction,
  updateBankTransaction,
  deleteBankTransaction,
  getBankSummary
} = require('../models/store');

// GET /api/v1/bank-transactions/summary
router.get('/summary', async (req, res) => {
  try {
    const { restaurantId, startDate, endDate } = req.query;
    const summary = await getBankSummary(restaurantId, startDate, endDate);
    res.json(summary);
  } catch (err) {
    console.error('Error fetching bank summary:', err);
    res.status(500).json({ error: 'Failed to fetch bank summary' });
  }
});

// GET /api/v1/bank-transactions
router.get('/', async (req, res) => {
  try {
    const { restaurantId, type, startDate, endDate } = req.query;
    const list = await listBankTransactions(restaurantId, { type, startDate, endDate });
    res.json(list);
  } catch (err) {
    console.error('Error listing bank transactions:', err);
    res.status(500).json({ error: 'Failed to list bank transactions' });
  }
});

// GET /api/v1/bank-transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await getBankTransaction(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bank transaction not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching bank transaction:', err);
    res.status(500).json({ error: 'Failed to fetch bank transaction' });
  }
});

// POST /api/v1/bank-transactions
router.post('/', async (req, res) => {
  try {
    const { amount, date, type, restaurantId, source, description, referenceNumber } = req.body;
    if (amount == null || amount <= 0 || !date || !type) {
      return res.status(400).json({ error: 'amount (greater than 0), date, and type are required' });
    }
    const created = await createBankTransaction({
      amount: Number(amount),
      date,
      type,
      restaurantId,
      source,
      description,
      referenceNumber
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating bank transaction:', err);
    res.status(500).json({ error: 'Failed to create bank transaction' });
  }
});

// PUT /api/v1/bank-transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateBankTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Bank transaction not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating bank transaction:', err);
    res.status(500).json({ error: 'Failed to update bank transaction' });
  }
});

// DELETE /api/v1/bank-transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteBankTransaction(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Bank transaction not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting bank transaction:', err);
    res.status(500).json({ error: 'Failed to delete bank transaction' });
  }
});

module.exports = router;
