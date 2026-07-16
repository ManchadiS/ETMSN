const express = require('express');
const router = express.Router();
const { listExpenses, createExpense, getExpense, updateExpense, deleteExpense } = require('../models/store');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Construct the relative public URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: fileUrl });
});

router.get('/', async (req, res) => {
  const list = await listExpenses(req.query.restaurantId);
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const e = await getExpense(req.params.id);
  if (!e) return res.status(404).json({ error: 'Expense not found' });
  res.json(e);
});

router.post('/', async (req, res) => {
  const { amount, description, date, category, restaurantId, imageUrl } = req.body;
  if (amount == null || !restaurantId) {
    return res.status(400).json({ error: 'amount and restaurantId are required' });
  }
  const created = await createExpense({ amount, description, date, category, restaurantId, imageUrl });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await updateExpense(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Expense not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteExpense(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Expense not found' });
  res.status(204).send();
});

module.exports = router;
