ptions · JS
Copy

const express = require('express');
const router = express.Router();

// Subscription plans
const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 GB data/month',
      'Limited server selection',
      'Basic support',
      '1 device'
    ],
    deviceLimit: 1,
    dataLimit: 5368709120 // 5 GB in bytes
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited data',
      'All servers worldwide',
      'Priority support',
      '5 devices',
      'Kill switch',
      'Split tunneling'
    ],
    deviceLimit: 5,
    dataLimit: -1 // unlimited
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      '10 devices',
      'Dedicated IP',
      'Team management',
      'Priority support',
      'Usage analytics'
    ],
    deviceLimit: 10,
    dataLimit: -1
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Contact for pricing
    currency: 'USD',
    interval: 'custom',
    features: [
      'Everything in Business',
      'Unlimited devices',
      'Custom infrastructure',
      'SLA guarantee',
      '24/7 phone support',
      'Custom integrations',
      'Dedicated account manager'
    ],
    deviceLimit: -1, // unlimited
    dataLimit: -1
  }
};

// Mock user subscriptions (use database in production)
const userSubscriptions = new Map();

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }
  req.userId = 'user_' + token.substring(0, 8);
  next();
};

// GET /api/subscriptions/plans - List all plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.values(plans)
  });
});

// GET /api/subscriptions/my - Get user's current subscription
router.get('/my', authMiddleware, (req, res) => {
  let subscription = userSubscriptions.get(req.userId);

  if (!subscription) {
    // Default to free plan
    subscription = {
      userId: req.userId,
      planId: 'free',
      plan: plans.free,
      status: 'active',
      startedAt: new Date().toISOString(),
      dataUsed: 0,
      devicesConnected: 0
    };
    userSubscriptions.set(req.userId, subscription);
  }

  res.json({
    success: true,
    subscription
  });
});

// POST /api/subscriptions/subscribe - Subscribe to a plan
router.post('/subscribe', authMiddleware, async (req, res) => {
  const { planId, paymentMethodId } = req.body;

  if (!plans[planId]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid plan ID'
    });
  }

  const plan = plans[planId];

  // In production, integrate with Stripe here
  // const stripeSubscription = await stripe.subscriptions.create({...})

  const subscription = {
    userId: req.userId,
    planId,
    plan,
    status: 'active',
    startedAt: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    dataUsed: 0,
    devicesConnected: 0,
    paymentMethod: paymentMethodId ? 'stripe' : 'none'
  };

  userSubscriptions.set(req.userId, subscription);

  res.status(201).json({
    success: true,
    message: `Successfully subscribed to ${plan.name} plan`,
    subscription
  });
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', authMiddleware, (req, res) => {
  const subscription = userSubscriptions.get(req.userId);

  if (!subscription) {
    return res.status(404).json({
      success: false,
      error: 'No active subscription found'
    });
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date().toISOString();

  // Revert to free plan at end of billing period
  subscription.plan = plans.free;
  subscription.planId = 'free';

  userSubscriptions.set(req.userId, subscription);

  res.json({
    success: true,
    message: 'Subscription cancelled. Access continues until end of billing period.',
    subscription
  });
});

// GET /api/subscriptions/usage - Get usage statistics
router.get('/usage', authMiddleware, (req, res) => {
  const subscription = userSubscriptions.get(req.userId) || {
    planId: 'free',
    plan: plans.free,
    dataUsed: 0,
    devicesConnected: 0
  };

  const dataLimit = subscription.plan.dataLimit;
  const dataUsed = subscription.dataUsed || 0;
  const dataRemaining = dataLimit === -1 ? -1 : Math.max(0, dataLimit - dataUsed);

  res.json({
    success: true,
    usage: {
      plan: subscription.planId,
      dataUsed,
      dataLimit,
      dataRemaining,
      dataUsedPercent: dataLimit === -1 ? 0 : (dataUsed / dataLimit) * 100,
      devicesConnected: subscription.devicesConnected || 0,
      deviceLimit: subscription.plan.deviceLimit
    }
  });
});

// POST /api/subscriptions/upgrade - Upgrade plan
router.post('/upgrade', authMiddleware, async (req, res) => {
  const { planId } = req.body;

  if (!plans[planId]) {
    return res.status(400).json({
      success: false,
      error: 'Invalid plan ID'
    });
  }

  const currentSubscription = userSubscriptions.get(req.userId);
  const newPlan = plans[planId];

  const subscription = {
    ...currentSubscription,
    planId,
    plan: newPlan,
    upgradedAt: new Date().toISOString()
  };

  userSubscriptions.set(req.userId, subscription);

  res.json({
    success: true,
    message: `Successfully upgraded to ${newPlan.name} plan`,
    subscription
  });
});

module.exports = router;