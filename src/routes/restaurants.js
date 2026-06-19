const express = require('express');
const router = express.Router();
const { listRestaurants, createRestaurant, getRestaurant, updateRestaurant, deleteRestaurant } = require('../models/store');

router.get('/', async (req, res) => {
  const list = await listRestaurants();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const r = await getRestaurant(req.params.id);
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(r);
});

router.post('/', async (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const restaurant = await createRestaurant({ name, address });
  res.status(201).json(restaurant);
});

router.put('/:id', async (req, res) => {
  const updated = await updateRestaurant(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteRestaurant(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Restaurant not found' });
  res.status(204).send();
});

module.exports = router;
