const express = require('express');
const router = express.Router();
const { pool } = require('../../db');

const requireAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ success: false, error: 'ADMIN_KEY not configured on server' });
  }
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing admin key' });
  }
  next();
};

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, uid, email, name, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: result.rows.length, users: result.rows });
  } catch (error) {
    console.error('Admin users query error:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const todayResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours'"
    );
    const weekResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
    );

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(usersResult.rows[0].count, 10),
        newUsersLast24h: parseInt(todayResult.rows[0].count, 10),
        newUsersLast7d: parseInt(weekResult.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error('Admin stats query error:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

router.delete('/users/:uid', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE uid = $1 RETURNING uid', [
      req.params.uid,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: `User ${req.params.uid} deleted` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ success: false, error: 'Database query failed' });
  }
});

module.exports = router;
