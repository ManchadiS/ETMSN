const express = require('express');
const router = express.Router();
const { listFoodItems, createFoodItem, getFoodItem, updateFoodItem, deleteFoodItem } = require('../models/store');

router.get('/', async (req, res) => {
  const list = await listFoodItems(req.query.restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const f = await getFoodItem(req.params.id);
  if (!f) return res.status(404).json({ error: 'Food item not found' });
  res.json(f);
});

router.post('/', async (req, res) => {
  const { name, price, description, category, restaurantId } = req.body;
  if (!name || price == null || !restaurantId) {
    return res.status(400).json({ error: 'name, price, and restaurantId are required' });
  }
  const created = await createFoodItem({ name, price, description, category, restaurantId });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateFoodItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Food item not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteFoodItem(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Food item not found' });
  res.status(204).send();
});

module.exports = router;
