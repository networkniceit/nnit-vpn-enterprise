import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.BILLING_PORT || 3004;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'billing', timestamp: new Date().toISOString() });
});

// Billing routes
app.post('/api/billing/create-subscription', async (req, res) => {
  res.json({ message: 'Create subscription' });
});

app.post('/api/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  // Handle Stripe webhooks
  res.json({ received: true });
});

app.get('/api/billing/invoices/:userId', (req, res) => {
  res.json({ message: `Get invoices for user ${req.params.userId}` });
});

app.listen(PORT, () => {
  console.log(`Billing service listening on port ${PORT}`);
});

export default app;
