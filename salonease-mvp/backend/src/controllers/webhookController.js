const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../config/db');
const emailHelper = require('../utils/helpers/emailHelper');

let stripeInstance = stripe;

const handleSubscriptionTrialEnding = async (subscription, user) => {
  const daysRemaining = Math.ceil((subscription.trial_end - Date.now() / 1000) / 86400);
  await emailHelper.sendTrialEndingEmail(user.email, daysRemaining);
};

const handleInvoicePaymentFailed = async (invoice, user) => {
  const errorMessage = invoice.last_payment_error?.message || 'Payment method declined';
  await emailHelper.sendSubscriptionFailedEmail(user.email, errorMessage);
};

const handleSubscriptionDeleted = async (subscription, user) => {
  await User.update({
    subscriptionStatus: 'canceled',
    subscriptionId: null
  }, {
    where: { id: user.id }
  });

  await emailHelper.sendSubscriptionCanceledEmail(user.email);
};

const handleSubscriptionUpdated = async (subscription, user) => {
  await User.update({
    subscriptionStatus: subscription.status,
    trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
  }, {
    where: { id: user.id }
  });
};

const eventHandlers = {
  'customer.subscription.trial_will_end': handleSubscriptionTrialEnding,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'customer.subscription.updated': handleSubscriptionUpdated
};

exports.handleStripeWebhook = async (req, res) => {
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventObject = event.data.object;
  const user = await User.findOne({ 
    where: { 
      subscriptionId: eventObject.subscription || eventObject.id 
    } 
  });

  if (!user) {
    return res.json({ received: true });
  }

  const handler = eventHandlers[event.type];
  if (handler) {
    try {
      await handler(eventObject, user);
    } catch (error) {
      console.error('Webhook handler error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.json({ received: true });
};

exports.setStripeInstance = (instance) => {
  stripeInstance = instance;
};
