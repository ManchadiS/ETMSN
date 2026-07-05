const express = require('express');
const router = express.Router();
const {
  listInventory,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory
} = require('../models/store');

router.get('/', async (req, res) => {
  const { restaurantId } = req.query;
  const list = await listInventory(restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const item = await getInventory(req.params.id);
  if (!item) return res.status(404).json({ error: 'Inventory item not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const { name, restaurantId } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
  
  const item = await createInventory({ name, restaurantId });
  res.status(201).json(item);
});

router.put('/:id', async (req, res) => {
  const updated = await updateInventory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteInventory(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Inventory item not found' });
  res.status(204).send();
});

module.exports = router;
