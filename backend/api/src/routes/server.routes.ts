import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/servers:
 *   get:
 *     summary: Get all VPN servers
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: List of servers
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get all servers' });
});

/**
 * @swagger
 * /api/servers/{id}:
 *   get:
 *     summary: Get server by ID
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server details
 */
router.get('/:id', (req, res) => {
  res.json({ message: `Get server ${req.params.id}` });
});

export default router;
