const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = 'user_' + Date.now();

    await pool.query(
      'INSERT INTO users (uid, email, name, password) VALUES ($1, $2, $3, $4)',
      [uid, email, name, hashedPassword]
    );

    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: { uid, email, name },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { uid: user.uid, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    res.json({ success: true, user: { uid: decoded.uid, email: decoded.email } });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
