const stripe = require('stripe');
const { User } = require('../setupTests');
const SubscriptionService = require('../../src/services/subscriptionService');

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn()
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn()
    }
  }));
});

describe('Subscription Service', () => {
  let stripeInstance;
  let mockStripe;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = stripe();
    stripeInstance = new SubscriptionService();
    stripeInstance.stripe = mockStripe;

    // Mock User methods
    User.update = jest.fn().mockResolvedValue([1]);
    User.findByPk = jest.fn();
  });

  describe('createCustomer', () => {
    it('should create a stripe customer and update user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User'
      };

      const mockStripeCustomer = { id: 'cus_123' };
      mockStripe.customers.create.mockResolvedValue(mockStripeCustomer);

      await stripeInstance.createCustomer(mockUser);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
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
      mockStripe.customers.create.mockRejectedValue(new Error('Stripe error'));

      await expect(stripeInstance.createCustomer({ id: 1 }))
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

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      await stripeInstance.startTrialSubscription(mockUser.id);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
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
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
        trial_end: Math.floor(Date.now() / 1000) + 86400 * 14
      };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      await stripeInstance.startTrialSubscription(mockUser.id);

      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(mockStripe.subscriptions.create).toHaveBeenCalled();
    });
  });
});
