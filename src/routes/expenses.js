const express = require('express');
const router = express.Router();
const { listExpenses, createExpense, getExpense, updateExpense, deleteExpense } = require('../models/store');

router.get('/', async (req, res) => {
  const list = await listExpenses();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const e = await getExpense(req.params.id);
  if (!e) return res.status(404).json({ error: 'Expense not found' });
  res.json(e);
});

router.post('/', async (req, res) => {
  const { amount, description, date, category } = req.body;
  if (amount == null) return res.status(400).json({ error: 'amount is required' });
  const created = await createExpense({ amount, description, date, category });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateExpense(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Expense not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteExpense(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Expense not found' });
  res.status(204).send();
});

module.exports = router;
