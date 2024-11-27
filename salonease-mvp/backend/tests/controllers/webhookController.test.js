const { handleStripeWebhook, setStripeInstance } = require('../../src/controllers/webhookController');
const { User } = require('../setupTests');
const httpMocks = require('node-mocks-http');
const emailHelper = require('../../src/utils/helpers/emailHelper');
const subscriptionService = require('../../src/services/subscriptionService');

jest.mock('../../src/utils/helpers/emailHelper', () => ({
  sendTrialEndingEmail: jest.fn().mockResolvedValue(),
  sendSubscriptionFailedEmail: jest.fn().mockResolvedValue(),
  sendSubscriptionCanceledEmail: jest.fn().mockResolvedValue()
}));

jest.mock('../../src/services/subscriptionService', () => ({
  updateSubscriptionStatus: jest.fn().mockResolvedValue(),
  cancelSubscription: jest.fn().mockResolvedValue()
}));

describe('Webhook Controller', () => {
  let req, res, mockStripe, testUser;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      subscriptionId: 'sub_123',
      role: 'SalonOwner'
    });

    // Mock the subscription service to actually update the user
    subscriptionService.updateSubscriptionStatus.mockImplementation(async (userId, status, trialEnd) => {
      await User.update({
        subscriptionStatus: status,
        trialEndsAt: trialEnd ? new Date(trialEnd * 1000) : null
      }, {
        where: { id: userId }
      });
    });

    subscriptionService.cancelSubscription.mockImplementation(async (userId) => {
      await User.update({
        subscriptionStatus: 'canceled',
        subscriptionId: null
      }, {
        where: { id: userId }
      });
    });

    // Mock Stripe instance
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn()
      }
    };

    // Set mock Stripe instance
    setStripeInstance(mockStripe);

    // Setup request and response
    req = httpMocks.createRequest({
      method: 'POST',
      headers: {
        'stripe-signature': 'test_signature'
      },
      rawBody: 'raw_body'
    });

    res = httpMocks.createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleStripeWebhook', () => {
    it('should return 400 if webhook signature verification fails', async () => {
      const error = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw error;
      });

      await handleStripeWebhook(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getData()).toBe(`Webhook Error: ${error.message}`);
    });

    it('should handle subscription trial ending event', async () => {
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            subscription: 'sub_123',
            trial_end: Math.floor(Date.now() / 1000) + (3 * 86400) // 3 days from now
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await handleStripeWebhook(req, res);

      expect(emailHelper.sendTrialEndingEmail).toHaveBeenCalledWith(
        testUser.email,
        3
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('should handle invoice payment failed event', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            subscription: 'sub_123',
            last_payment_error: {
              message: 'Your card was declined'
            }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await handleStripeWebhook(req, res);

      expect(emailHelper.sendSubscriptionFailedEmail).toHaveBeenCalledWith(
        testUser.email,
        'Your card was declined'
      );
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('should handle subscription deleted event', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            status: 'canceled'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await handleStripeWebhook(req, res);

      // Verify the user's subscription status is updated
      const updatedUser = await User.findByPk(testUser.id);      
      expect(updatedUser.subscriptionStatus).toBe('canceled');
      expect(updatedUser.subscriptionId).toBeNull();

      // Verify email was sent
      expect(emailHelper.sendSubscriptionCanceledEmail).toHaveBeenCalledWith(
        testUser.email
      );

      // Verify response
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('should handle subscription updated event', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'active',
            trial_end: Math.floor(Date.now() / 1000) + (7 * 86400)
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await handleStripeWebhook(req, res);

      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser.subscriptionStatus).toBe('active');
      expect(updatedUser.trialEndsAt).toBeTruthy();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('should handle unknown user gracefully', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'non_existent_sub',
            status: 'active'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await handleStripeWebhook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ received: true });
    });

    it('should handle webhook handler errors gracefully', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'active'
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      
      // Mock the subscription service to throw the specific error
      subscriptionService.updateSubscriptionStatus.mockRejectedValue(new Error('Database error'));

      await handleStripeWebhook(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: 'Database error' });
    });
  });
});
