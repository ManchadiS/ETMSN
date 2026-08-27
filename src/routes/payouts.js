const express = require('express');
const router = express.Router();
const { listPayouts, createPayout, getPayout, updatePayout, deletePayout } = require('../models/store');

// GET /api/v1/payouts?restaurantId=...
router.get('/', async (req, res) => {
  try {
    const list = await listPayouts(req.query.restaurantId);
    res.json(list);
  } catch (err) {
    console.error('Error listing payouts:', err);
    res.status(500).json({ error: 'Failed to list payouts' });
  }
});

// GET /api/v1/payouts/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await getPayout(req.params.id);
    if (!p) return res.status(404).json({ error: 'Payout not found' });
    res.json(p);
  } catch (err) {
    console.error('Error fetching payout:', err);
    res.status(500).json({ error: 'Failed to fetch payout' });
  }
});

// POST /api/v1/payouts
router.post('/', async (req, res) => {
  try {
    const { amount, date, platform, restaurantId, referenceNumber, description } = req.body;
    if (amount == null || !date || !platform || !restaurantId) {
      return res.status(400).json({ error: 'amount, date, platform, and restaurantId are required' });
    }
    const created = await createPayout({ amount, date, platform, restaurantId, referenceNumber, description });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating payout:', err);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

// PUT /api/v1/payouts/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await updatePayout(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Payout not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating payout:', err);
    res.status(500).json({ error: 'Failed to update payout' });
  }
});

// DELETE /api/v1/payouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deletePayout(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Payout not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting payout:', err);
    res.status(500).json({ error: 'Failed to delete payout' });
  }
});

module.exports = router;
