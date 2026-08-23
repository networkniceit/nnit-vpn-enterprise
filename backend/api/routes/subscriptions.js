const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// Subscription plans
const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: ['5 GB data/month', 'Limited server selection', 'Basic support', '1 device'],
    deviceLimit: 1,
    dataLimit: 5368709120,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: ['Unlimited data', 'All servers worldwide', 'Priority support', '5 devices', 'Kill switch', 'Split tunneling'],
    deviceLimit: 5,
    dataLimit: -1,
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    features: ['Everything in Pro', '10 devices', 'Dedicated IP', 'Team management', 'Priority support', 'Usage analytics'],
    deviceLimit: 10,
    dataLimit: -1,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    currency: 'EUR',
    interval: 'custom',
    features: ['Everything in Business', 'Unlimited devices', 'Custom infrastructure', 'SLA guarantee', '24/7 phone support', 'Custom integrations', 'Dedicated account manager'],
    deviceLimit: -1,
    dataLimit: -1,
  },
};

// Real JWT-based auth middleware (matches auth.js — no more fake token substring)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.userEmail = decoded.email;
    req.userUid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET /api/subscriptions/plans - List all plans (public)
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: Object.values(plans) });
});

// GET /api/subscriptions/my - Get user's current subscription (real, from Postgres)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT plan, plan_updated_at FROM users WHERE email = $1', [req.userEmail]);
    const row = result.rows[0];
    const planId = row?.plan || 'free';

    res.json({
      success: true,
      subscription: {
        email: req.userEmail,
        planId,
        plan: plans[planId] || plans.free,
        updatedAt: row?.plan_updated_at || null,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

// POST /api/subscriptions/webhook/nnit-pay
// Called BY the NNIT-Pay backend after a successful transfer to your
// business account. Protected by a shared secret header, not user auth.
router.post('/webhook/nnit-pay', async (req, res) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (!process.env.NNIT_PAY_WEBHOOK_SECRET || secret !== process.env.NNIT_PAY_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, error: 'Invalid webhook secret' });
    }

    const { senderEmail, amountInEUR, transactionId } = req.body;
    if (!senderEmail || !amountInEUR) {
      return res.status(400).json({ success: false, error: 'senderEmail and amountInEUR are required' });
    }

    const tolerance = 0.05;
    let matchedPlan = null;
    for (const plan of Object.values(plans)) {
      if (plan.price !== null && Math.abs(plan.price - amountInEUR) < tolerance) {
        matchedPlan = plan;
        break;
      }
    }

    if (!matchedPlan) {
      console.warn(`NNIT-Pay webhook: no plan matches amount ${amountInEUR} for ${senderEmail} (tx ${transactionId})`);
      return res.status(200).json({ success: true, message: 'Payment received but no matching plan amount — no action taken' });
    }

    const result = await pool.query(
      'UPDATE users SET plan = $1, plan_updated_at = NOW() WHERE email = $2 RETURNING uid, email, plan',
      [matchedPlan.id, senderEmail]
    );

    if (result.rows.length === 0) {
      console.warn(`NNIT-Pay webhook: no NNIT VPN account found for ${senderEmail} (tx ${transactionId})`);
      return res.status(200).json({ success: true, message: 'Payment received but no matching VPN account — no action taken' });
    }

    console.log(`Activated ${matchedPlan.id} plan for ${senderEmail} via NNIT-Pay tx ${transactionId}`);
    res.json({ success: true, message: `Activated ${matchedPlan.name} plan`, user: result.rows[0] });
  } catch (error) {
    console.error('NNIT-Pay webhook error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

// GET /api/subscriptions/usage - Get usage statistics
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT plan FROM users WHERE email = $1', [req.userEmail]);
    const planId = result.rows[0]?.plan || 'free';
    const plan = plans[planId] || plans.free;

    res.json({
      success: true,
      usage: {
        plan: planId,
        dataLimit: plan.dataLimit,
        deviceLimit: plan.deviceLimit,
      },
    });
  } catch (error) {
    console.error('Usage error:', error);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});

module.exports = router;