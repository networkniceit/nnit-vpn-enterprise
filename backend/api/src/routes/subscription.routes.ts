import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get user subscriptions
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get('/', (req, res) => {
  res.json({ message: 'Get all subscriptions' });
});

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create new subscription
 *     tags: [Subscriptions]
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create subscription' });
});

export default router;
