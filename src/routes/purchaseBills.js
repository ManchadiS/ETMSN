const express = require('express');
const router = express.Router();
const {
  listPurchaseBills,
  createPurchaseBill,
  getPurchaseBill,
  deletePurchaseBill
} = require('../models/store');

router.get('/', async (req, res) => {
  const { restaurantId } = req.query;
  const list = await listPurchaseBills(restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await getPurchaseBill(req.params.id);
  if (!item) return res.status(404).json({ error: 'Purchase bill not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const { restaurantId, supplierName, billNumber, date, items, totalAmount, paymentMode, status } = req.body;
  
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
  if (!supplierName) return res.status(400).json({ error: 'supplierName is required' });
  if (totalAmount === undefined) return res.status(400).json({ error: 'totalAmount is required' });
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items list is required and cannot be empty' });
  }
  
  try {
    const bill = await createPurchaseBill({
      restaurantId,
      supplierName,
      billNumber,
      date,
      items,
      totalAmount,
      paymentMode,
      status
    });
    res.status(201).json(bill);
  } catch (err) {
    console.error('Error creating purchase bill:', err);
    res.status(500).json({ error: 'Failed to create purchase bill' });
  }
});

router.delete('/:id', async (req, res) => {
  const ok = await deletePurchaseBill(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Purchase bill not found' });
  res.status(204).send();
});

module.exports = router;
