const express = require('express');
const router = express.Router();
const { listCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer, lookupCustomer } = require('../models/store');

router.get('/', async (req, res) => {
  const list = await listCustomers();
  res.json(list);
});

router.get('/lookup', async (req, res) => {
  const { mobile, emailId } = req.query;
  const customer = await lookupCustomer({ mobile, emailId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.get('/:id', async (req, res) => {
  const c = await getCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  res.json(c);
});

router.post('/', async (req, res) => {
  const { mobile, emailId, loyaltyPoints } = req.body;
  const created = await createCustomer({ mobile, emailId, loyaltyPoints });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateCustomer(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Customer not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await deleteCustomer(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Customer not found' });
  res.status(204).end();
});

module.exports = router;
