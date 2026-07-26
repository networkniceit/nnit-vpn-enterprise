
Copy

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Billing Integration for NNIT VPN
 * Network Nice IT Tec (NNIT)
 * Contact: networkniceit@gmail.com
 */

// Create Stripe Customer
async function createCustomer(email, name, metadata = {}) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        company: 'NetworkNiceIT Tec',
        product: 'NNIT VPN'
      }
    });

    return {
      success: true,
      customer
    };
  } catch (error) {
    console.error('Stripe create customer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create Subscription
async function createSubscription(customerId, priceId, metadata = {}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata
    });

    return {
      success: true,
      subscription,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Stripe create subscription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Cancel Subscription
async function cancelSubscription(subscriptionId, immediately = false) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately
    });

    if (immediately) {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    return {
      success: true,
      subscription
    };
  } catch (error) {
    console.error('Stripe cancel subscription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update Subscription (Upgrade/Downgrade)
async function updateSubscription(subscriptionId, newPriceId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'always_invoice'
    });

    return {
      success: true,
      subscription: updatedSubscription
    };
  } catch (error) {
    console.error('Stripe update subscription error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create Payment Intent (for one-time payments)
async function createPaymentIntent(amount, currency, customerId, metadata = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      customer: customerId,
      metadata: {
        ...metadata,
        company: 'NNIT'
      }
    });

    return {
      success: true,
      paymentIntent,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get Invoice
async function getInvoice(invoiceId) {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);

    return {
      success: true,
      invoice
    };
  } catch (error) {
    console.error('Stripe get invoice error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// List Customer Invoices
async function listCustomerInvoices(customerId, limit = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit
    });

    return {
      success: true,
      invoices: invoices.data
    };
  } catch (error) {
    console.error('Stripe list invoices error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle Webhook Events
function handleWebhook(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object.id);
        break;

      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object.id);
        break;

      case 'invoice.paid':
        console.log('Invoice paid:', event.data.object.id);
        break;

      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object.id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return {
      success: true,
      event
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Price IDs (configure these in Stripe Dashboard)
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
  business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY
};

module.exports = {
  createCustomer,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  createPaymentIntent,
  getInvoice,
  listCustomerInvoices,