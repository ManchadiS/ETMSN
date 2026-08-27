const express = require('express');
const router = express.Router();
const { listWastage, createWastage, getWastage, updateWastage, deleteWastage } = require('../models/store');

// GET /api/v1/wastage?restaurantId=...
router.get('/', async (req, res) => {
  try {
    const list = await listWastage(req.query.restaurantId);
    res.json(list);
  } catch (err) {
    console.error('Error listing wastage:', err);
    res.status(500).json({ error: 'Failed to list wastage' });
  }
});

// GET /api/v1/wastage/:id
router.get('/:id', async (req, res) => {
  try {
    const w = await getWastage(req.params.id);
    if (!w) return res.status(404).json({ error: 'Wastage entry not found' });
    res.json(w);
  } catch (err) {
    console.error('Error fetching wastage entry:', err);
    res.status(500).json({ error: 'Failed to fetch wastage entry' });
  }
});

// POST /api/v1/wastage
router.post('/', async (req, res) => {
  try {
    const { restaurantId, inventoryItemId, inventoryItemName, quantity, date, reason, amount } = req.body;
    if (quantity == null || !date || !restaurantId || !inventoryItemId || !inventoryItemName) {
      return res.status(400).json({ error: 'quantity, date, restaurantId, inventoryItemId, and inventoryItemName are required' });
    }
    const created = await createWastage({ restaurantId, inventoryItemId, inventoryItemName, quantity, date, reason, amount });
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating wastage entry:', err);
    res.status(500).json({ error: 'Failed to create wastage entry' });
  }
});

// PUT /api/v1/wastage/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateWastage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Wastage entry not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating wastage entry:', err);
    res.status(500).json({ error: 'Failed to update wastage entry' });
  }
});

// DELETE /api/v1/wastage/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteWastage(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Wastage entry not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting wastage entry:', err);
    res.status(500).json({ error: 'Failed to delete wastage entry' });
  }
});

module.exports = router;
