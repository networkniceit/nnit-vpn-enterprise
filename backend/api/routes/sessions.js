const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock sessions storage (use database in production)
const activeSessions = new Map();

// Middleware to verify auth token (simplified)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  // In production, verify JWT here
  req.userId = 'user_' + token.substring(0, 8);
  next();
};

// POST /api/sessions/start - Start VPN session
router.post('/start', authMiddleware, (req, res) => {
  const { serverId, protocol } = req.body;

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    userId: req.userId,
    serverId,
    protocol: protocol || 'WireGuard',
    startedAt: new Date().toISOString(),
    status: 'active',
    bytesReceived: 0,
    bytesSent: 0,
    deviceInfo: {
      platform: req.headers['user-agent'],
      ip: req.ip
    }
  };

  activeSessions.set(sessionId, session);

  res.status(201).json({
    success: true,
    message: 'VPN session started',
    session
  });
});

// GET /api/sessions - Get user's active sessions
router.get('/', authMiddleware, (req, res) => {
  const userSessions = Array.from(activeSessions.values())
    .filter(s => s.userId === req.userId);

  res.json({
    success: true,
    count: userSessions.length,
    sessions: userSessions
  });
});

// GET /api/sessions/:id - Get specific session
router.get('/:id', authMiddleware, (req, res) => {
  const session = activeSessions.get(req.params.id);

  if (!session || session.userId !== req.userId) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  res.json({
    success: true,
    session
  });
});

// PUT /api/sessions/:id/stats - Update session statistics
router.put('/:id/stats', authMiddleware, (req, res) => {
  const session = activeSessions.get(req.params.id);

  if (!session || session.userId !== req.userId) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  const { bytesReceived, bytesSent } = req.body;

  session.bytesReceived = bytesReceived || session.bytesReceived;
  session.bytesSent = bytesSent || session.bytesSent;
  session.lastUpdated = new Date().toISOString();

  activeSessions.set(req.params.id, session);

  res.json({
    success: true,
    session
  });
});

// POST /api/sessions/:id/end - End VPN session
router.post('/:id/end', authMiddleware, (req, res) => {
  const session = activeSessions.get(req.params.id);

  if (!session || session.userId !== req.userId) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  session.status = 'ended';
  session.endedAt = new Date().toISOString();
  
  const duration = new Date(session.endedAt) - new Date(session.startedAt);
  session.duration = Math.floor(duration / 1000); // seconds

  activeSessions.set(req.params.id, session);

  // Archive session (move to database in production)
  setTimeout(() => activeSessions.delete(req.params.id), 60000);

  res.json({
    success: true,
    message: 'VPN session ended',
    session
  });
});

// GET /api/sessions/stats/summary - Get user's usage summary
router.get('/stats/summary', authMiddleware, (req, res) => {
  const userSessions = Array.from(activeSessions.values())
    .filter(s => s.userId === req.userId);

  const totalReceived = userSessions.reduce((sum, s) => sum + s.bytesReceived, 0);
  const totalSent = userSessions.reduce((sum, s) => sum + s.bytesSent, 0);

 res.json({
    success: true,
    stats: {
      activeSessions: userSessions.filter(s => s.status === 'active').length,
      totalSessions: userSessions.length,
      totalBytesReceived: totalReceived,
      totalBytesSent: totalSent,
      totalBytes: totalReceived + totalSent
    }
  });
});

module.exports = router;
