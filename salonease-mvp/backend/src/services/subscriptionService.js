const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User } = require('../config/db');

class SubscriptionService {
  constructor() {
    this.stripe = stripe;
  }

  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
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

      const subscription = await this.stripe.subscriptions.create({
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
      throw new Error('Failed to start trial subscription');
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscriptionId) return null;

      const subscription = await this.stripe.subscriptions.retrieve(user.subscriptionId);
      return subscription;
    } catch (error) {
      return null;
    }
  }

  async updateSubscriptionStatus(userId, status, trialEnd = null) {
    try {
      await User.update({
        subscriptionStatus: status,
        trialEndsAt: trialEnd ? new Date(trialEnd * 1000) : null
      }, {
        where: { id: userId }
      });
    } catch (error) {
      throw new Error('Failed to update subscription status');
    }
  }

  async cancelSubscription(userId) {
    try {
      await User.update({
        subscriptionStatus: 'canceled',
        subscriptionId: null
      }, {
        where: { id: userId }
      });
    } catch (error) {
      throw new Error('Failed to cancel subscription');
    }
  }
}

module.exports = SubscriptionService;
