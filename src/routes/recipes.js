const express = require('express');
const router = express.Router();
const {
  listRecipes,
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  seedDefaultRecipes
} = require('../models/store');

router.get('/', async (req, res) => {
  const { restaurantId } = req.query;
  const list = await listRecipes(restaurantId);
  res.json(list);
});

router.post('/seed-default', async (req, res) => {
  const { restaurantId } = req.body;
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
  const result = await seedDefaultRecipes(restaurantId);
  res.json(result);
});

router.get('/:id', async (req, res) => {
  const item = await getRecipe(req.params.id);
  if (!item) return res.status(404).json({ error: 'Recipe not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const { restaurantId, dishName, dishId, category, appliance, yieldPortions, ingredients, notes, isActive } = req.body;
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' });
  if (!dishName) return res.status(400).json({ error: 'dishName is required' });
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'ingredients list is required and cannot be empty' });
  }

  try {
    const item = await createRecipe({
      restaurantId,
      dishName,
      dishId,
      category,
      appliance,
      yieldPortions,
      ingredients,
      notes,
      isActive
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating recipe:', err);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

router.put('/:id', async (req, res) => {
  const updated = await updateRecipe(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Recipe not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteRecipe(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Recipe not found' });
  res.status(204).send();
});

module.exports = router;
