const express = require('express');
const router = express.Router();
const {
  listRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole
} = require('../models/store');

// GET /roles
router.get('/', async (req, res) => {
  try {
    const list = await listRoles();
    res.json(list);
  } catch (err) {
    console.error('Error listing roles:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /roles
router.post('/', async (req, res) => {
  try {
    const { name, sidebarAccess, deleteAccess } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const role = await createRole({ name, sidebarAccess, deleteAccess });
    res.status(201).json(role);
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /roles/:id
router.get('/:id', async (req, res) => {
  try {
    const role = await getRole(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (err) {
    console.error('Error getting role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /roles/:id
router.put('/:id', async (req, res) => {
  try {
    const role = await getRole(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    const updated = await updateRole(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /roles/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await deleteRole(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Role not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
