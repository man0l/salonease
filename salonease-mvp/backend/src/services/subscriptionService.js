const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../config/db');

class SubscriptionService {
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id
        }
      });

      await User.update(
        { stripeCustomerId: customer.id },
        { where: { id: user.id } }
      );

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  async startTrialSubscription(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      let customer;
      if (!user.stripeCustomerId) {
        customer = await this.createCustomer(user);
      }

      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId || customer.id,
        trial_period_days: 14,
        items: [
          { price: process.env.STRIPE_BASE_PRICE_ID },
          { price: process.env.STRIPE_BOOKING_PRICE_ID }
        ],
        metadata: {
          userId: user.id
        }
      });

      await User.update({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        trialEndsAt: new Date(subscription.trial_end * 1000)
      }, {
        where: { id: user.id }
      });

      return subscription;
    } catch (error) {
      console.error('Error starting trial subscription:', error);
      throw new Error('Failed to start trial subscription');
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscriptionId) return null;

      const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription status:', error);
      return null;
    }
  }
}

module.exports = new SubscriptionService();
