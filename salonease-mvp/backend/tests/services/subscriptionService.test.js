const stripe = require('stripe');
const { User } = require('../setupTests');
const SubscriptionService = require('../../src/services/subscriptionService');

jest.mock('stripe');
jest.mock('../../src/config/db');

describe('Subscription Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('should create a stripe customer and update user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User'
      };

      const mockStripeCustomer = { id: 'cus_123' };
      stripe.customers.create.mockResolvedValue(mockStripeCustomer);

      await SubscriptionService.createCustomer(mockUser);

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.fullName,
        metadata: { userId: mockUser.id }
      });

      expect(User.update).toHaveBeenCalledWith(
        { stripeCustomerId: 'cus_123' },
        { where: { id: mockUser.id } }
      );
    });

    it('should handle stripe customer creation error', async () => {
      stripe.customers.create.mockRejectedValue(new Error('Stripe error'));

      await expect(SubscriptionService.createCustomer({ id: 1 }))
        .rejects
        .toThrow('Failed to create Stripe customer');
    });
  });

  describe('startTrialSubscription', () => {
    it('should create subscription with trial period', async () => {
      const mockUser = {
        id: 1,
        stripeCustomerId: 'cus_123'
      };

      User.findByPk.mockResolvedValue(mockUser);

      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
        trial_end: Math.floor(Date.now() / 1000) + 86400 * 14
      };

      stripe.subscriptions.create.mockResolvedValue(mockSubscription);

      await SubscriptionService.startTrialSubscription(mockUser.id);

      expect(stripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockUser.stripeCustomerId,
        trial_period_days: 14,
        items: [
          { price: process.env.STRIPE_BASE_PRICE_ID },
          { price: process.env.STRIPE_BOOKING_PRICE_ID }
        ],
        metadata: { userId: mockUser.id }
      });

      expect(User.update).toHaveBeenCalledWith(
        {
          subscriptionId: mockSubscription.id,
          subscriptionStatus: mockSubscription.status,
          trialEndsAt: expect.any(Date)
        },
        { where: { id: mockUser.id } }
      );
    });

    it('should create customer if stripeCustomerId does not exist', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User'
      };

      User.findByPk.mockResolvedValue(mockUser);

      const mockCustomer = { id: 'cus_123' };
      stripe.customers.create.mockResolvedValue(mockCustomer);

      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
        trial_end: Math.floor(Date.now() / 1000) + 86400 * 14
      };

      stripe.subscriptions.create.mockResolvedValue(mockSubscription);

      await SubscriptionService.startTrialSubscription(mockUser.id);

      expect(stripe.customers.create).toHaveBeenCalled();
      expect(stripe.subscriptions.create).toHaveBeenCalled();
    });
  });
});
