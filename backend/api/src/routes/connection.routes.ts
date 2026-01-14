import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/connections:
 *   get:
 *     summary: Get user connections
 *     tags: [Connections]
 *     responses:
 *       200:
 *         description: List of connections
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get all connections' });
});

/**
 * @swagger
 * /api/connections:
 *   post:
 *     summary: Create new VPN connection
 *     tags: [Connections]
 *     responses:
 *       201:
 *         description: Connection created
 */
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create connection' });
});

export default router;
