const express = require('express');
const router = express.Router();
const { listOrders, createOrder, getOrder, updateOrder, deleteOrder } = require('../models/store');

router.get('/', async (req, res) => {
  const list = await listOrders(req.query.restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', async (req, res) => {
  const { restaurantId, tableNo, mobile, emailId, items, status, totalAmount, date, discount, orderType } = req.body;
  if (!restaurantId) {
    return res.status(400).json({ error: 'restaurantId is required' });
  }
  const created = await createOrder({ restaurantId, tableNo, mobile, emailId, items, status, totalAmount, date, discount, orderType });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateOrder(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteOrder(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Order not found' });
  res.status(204).send();
});

module.exports = router;
