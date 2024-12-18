const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { User, Salon } = require('../config/db');
const ROLES = require('../config/roles');
const SubscriptionService = require('../services/subscriptionService');
const subscriptionService = SubscriptionService.getInstance();
const TwilioService = require('../services/twilioService');
const twilioService = TwilioService.getInstance();
const scheduleJob = require('node-schedule').scheduleJob;

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
      throw new Error('Failed to start trial subscription: ' + error.message);
    }
  }

  async getSubscriptionStatus(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscriptionId) return null;

      // Retrieve subscription
      
      const subscription = await this.stripe.subscriptions.retrieve(user.subscriptionId);

      const usage = await this.getSubscriptionUsage(user, subscription);
      const nextInvoice = await this.stripe.invoices.retrieveUpcoming({
        customer: user.stripeCustomerId
      });

      return  {
        ...subscription,
        usage,
        nextInvoice
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  async getSubscriptionUsage(user, subscription) {
    const meters = await this.stripe.billing.meters.list({
      limit: 100,
      status: 'active'
    });
    
    const usageData = [];
    for (const meter of meters.data) {
      const usage = await this.stripe.billing.meters.listEventSummaries(meter.id, 
        {
          customer: user.stripeCustomerId,
          start_time: subscription.current_period_start,
          end_time: subscription.current_period_end
        }
      );

      if (usage.data.length > 0) {
        usageData.push( {meter: meter, usage: usage.data[0]});
      }
    }
    return usageData;
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

  async incrementBasePrice(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user?.subscriptionId) {
        throw new Error('User has no subscription');
      }

      const subscription = await this.stripe.subscriptions.retrieve(user.subscriptionId);
      const baseItem = subscription.items.data.find(
        item => item.price.id === process.env.STRIPE_BASE_PRICE_ID
      );

      if (!baseItem) {
        throw new Error('Base price item not found in subscription');
      }

      // Update the subscription item quantity
      await this.stripe.subscriptionItems.update(baseItem.id, {
        quantity: (baseItem.quantity || 0) + 1
      });

      // Retrieve updated subscription
      const updatedSubscription = await this.stripe.subscriptions.retrieve(user.subscriptionId);
      return updatedSubscription;
    } catch (error) {
      console.error('Failed to increment base price:', error);
      throw new Error('Failed to update subscription base price: ' + error.message);
    }
  }

  async addBookingCharge(userId, quantity = null) {
    let user;
    try {
      user = await User.findByPk(userId);

      if (user.role === ROLES.STAFF) {
        user = await Salon.findByPk(user.salonId);
      }

      if (!user?.subscriptionId) return null;

      const meterEvent = await this.stripe.billing.meterEvents.create({
        event_name: 'booking_request',
        payload: {
            stripe_customer_id: user.stripeCustomerId,
            value: quantity ? quantity : 1
        }
      });

      return meterEvent;
    } catch (error) {      
      throw new Error('Failed to update subscription booking charge: ' + error.message);
    }
  }

  async createSetupIntent(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Create customer first if it doesn't exist
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await this.createCustomer(user);
        stripeCustomerId = customer.id;
      }

      const setupIntent = await this.stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card', 'link'],
        metadata: {
          userId: user.id
        }
      });

      return setupIntent;
    } catch (error) {
      throw new Error('Failed to create setup intent: ' + error.message);
    }
  }

  async attachPaymentMethod(userId, paymentMethodId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return true;
    } catch (error) {
      throw new Error('Failed to attach payment method');
    }
  }

  static getInstance() {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }
}

module.exports = SubscriptionService;

