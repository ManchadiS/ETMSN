const express = require('express');
const router = express.Router();
const { listBillings, createBilling, getBilling, updateBilling, deleteBilling, getRestaurant } = require('../models/store');
const { sendBill } = require('../services/emailService');

router.get('/', async (req, res) => {
  const list = await listBillings();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const b = await getBilling(req.params.id);
  if (!b) return res.status(404).json({ error: 'Billing not found' });
  res.json(b);
});

router.post('/', async (req, res) => {
  const { amount, restaurantId, date, description, status, mobile, emailId, cgst, sgst, foodItems } = req.body;
  if (amount == null) return res.status(400).json({ error: 'amount is required' });
  
  const created = await createBilling({ amount, restaurantId, date, description, status, mobile, emailId, cgst, sgst, foodItems });
  
  // Send email if emailId is provided
  if (emailId) {
    try {
      const restaurant = restaurantId ? await getRestaurant(restaurantId) : null;
      await sendBill(created, restaurant, emailId);
    } catch (err) {
      console.error('Email send error:', err);
    }
  }
  
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateBilling(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Billing not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteBilling(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Billing not found' });
  res.status(204).send();
});

module.exports = router;
