const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../config/db');
const emailHelper = require('../utils/helpers/emailHelper');

const handleSubscriptionTrialEnding = async (subscription, user) => {
  const daysRemaining = Math.ceil((subscription.trial_end - Date.now() / 1000) / 86400);
  await emailHelper.sendTrialEndingEmail(user.email, daysRemaining);
};

const handleInvoicePaymentFailed = async (subscription, user) => {
  const errorMessage = subscription.last_payment_error?.message || 'Payment method declined';
  await emailHelper.sendSubscriptionFailedEmail(user.email, errorMessage);
};

const handleSubscriptionDeleted = async (user) => {
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
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const subscription = event.data.object;
  const user = await User.findOne({ where: { subscriptionId: subscription.id } });

  if (!user) {
    return res.status(200).json({ received: true });
  }

  const handler = eventHandlers[event.type];
  if (handler) {
    await handler(subscription, user);
  }

  res.json({ received: true });
};
