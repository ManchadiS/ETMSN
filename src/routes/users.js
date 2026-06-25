const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {
  listUsers,
  createUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser
} = require('../models/store');

// Utility to hash passwords using SHA-256
function hashPassword(password) {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Success: Return user details without password
  const { password: _, ...userInfo } = user;
  res.json(userInfo);
});

// POST /users/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, dob, age } = req.body;
  if (!firstName || !lastName || !email || !password || !dob || age == null) {
    return res.status(400).json({ error: 'All fields are required (firstName, lastName, email, password, dob, age)' });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email address is already registered' });
  }

  const hashedPassword = hashPassword(password);
  const created = await createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dob,
    age: Number(age)
  });

  res.status(201).json(created);
});

// GET /users (List all users)
router.get('/', async (req, res) => {
  const list = await listUsers();
  // Strip passwords for safety
  const safeList = list.map(({ password, ...u }) => u);
  res.json(safeList);
});

// GET /users/:id (Get single user)
router.get('/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

// POST /users (Admin Create User)
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password, dob, age } = req.body;
  if (!firstName || !lastName || !email || !password || !dob || age == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email address is already registered' });
  }

  const hashedPassword = hashPassword(password);
  const created = await createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    dob,
    age: Number(age)
  });

  res.status(201).json(created);
});

// PUT /users/:id (Update User)
router.put('/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const data = { ...req.body };
  
  // If email is changing, verify it is not already taken
  if (data.email && data.email !== user.email) {
    const existing = await getUserByEmail(data.email);
    if (existing) {
      return res.status(400).json({ error: 'Email address is already taken' });
    }
  }

  // If password is being updated, hash it
  if (data.password) {
    data.password = hashPassword(data.password);
  }

  if (data.age !== undefined) {
    data.age = Number(data.age);
  }

  const updated = await updateUser(req.params.id, data);
  res.json(updated);
});

// DELETE /users/:id (Delete User)
router.delete('/:id', async (req, res) => {
  const ok = await deleteUser(req.params.id);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
});

module.exports = router;
