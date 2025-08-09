import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import Stripe from 'stripe';
import { 
  createStripeCustomer, 
  createStripeSubscription, 
  createStripeInvoice,
  createStripePaymentMethod,
  createStripeWebhookEvent,
} from '../../factories/subscriptionFactory';
import { createUser } from '../../factories/userFactory';

// Mock Stripe
const mockStripe = {
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  },
  subscriptions: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
    list: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  invoices: {
    retrieve: vi.fn(),
    list: vi.fn(),
    pay: vi.fn(),
    voidInvoice: vi.fn(),
  },
  paymentMethods: {
    create: vi.fn(),
    retrieve: vi.fn(),
    attach: vi.fn(),
    detach: vi.fn(),
    list: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
  prices: {
    list: vi.fn(),
    retrieve: vi.fn(),
  },
  products: {
    list: vi.fn(),
    retrieve: vi.fn(),
  },
};

vi.mock('stripe', () => {
  return {
    default: vi.fn(() => mockStripe),
  };
});

// Mock Stripe service
class StripeService {
  private stripe: typeof mockStripe;

  constructor() {
    this.stripe = mockStripe;
  }

  async createCustomer(data: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata || {},
      });

      return customer;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create Stripe customer',
        cause: error,
      });
    }
  }

  async getCustomer(customerId: string) {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      if ((error as any).code === 'resource_missing') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve customer',
        cause: error,
      });
    }
  }

  async updateCustomer(customerId: string, data: any) {
    try {
      const customer = await this.stripe.customers.update(customerId, data);
      return customer;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update customer',
        cause: error,
      });
    }
  }

  async createSubscription(data: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
    trialPeriodDays?: number;
  }) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        metadata: data.metadata || {},
        trial_period_days: data.trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create subscription',
        cause: error,
      });
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer'],
      });
      return subscription;
    } catch (error) {
      if ((error as any).code === 'resource_missing') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve subscription',
        cause: error,
      });
    }
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: atPeriodEnd,
      });
      return subscription;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to cancel subscription',
        cause: error,
      });
    }
  }

  async createCheckoutSession(data: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    trialPeriodDays?: number;
  }) {
    try {
      const sessionData: any = {
        payment_method_types: ['card'],
        line_items: [{
          price: data.priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: data.metadata || {},
      };

      if (data.customerId) {
        sessionData.customer = data.customerId;
      }

      if (data.trialPeriodDays) {
        sessionData.subscription_data = {
          trial_period_days: data.trialPeriodDays,
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionData);
      return session;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session',
        cause: error,
      });
    }
  }

  async constructWebhookEvent(payload: string, signature: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      return event;
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid webhook signature',
        cause: error,
      });
    }
  }

  async getPrices() {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });
      return prices.data;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve prices',
        cause: error,
      });
    }
  }

  async getInvoices(customerId: string) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: 10,
      });
      return invoices.data;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve invoices',
        cause: error,
      });
    }
  }
}

describe('StripeService', () => {
  let stripeService: StripeService;

  beforeEach(() => {
    stripeService = new StripeService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCustomer', () => {
    test('should create customer successfully', async () => {
      const mockCustomer = createStripeCustomer();
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user-123' },
      };

      const result = await stripeService.createCustomer(userData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        metadata: userData.metadata,
      });

      expect(result).toEqual(mockCustomer);
    });

    test('should handle Stripe API errors', async () => {
      mockStripe.customers.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await expect(stripeService.createCustomer(userData)).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create Stripe customer',
        })
      );
    });

    test('should create customer without metadata', async () => {
      const mockCustomer = createStripeCustomer();
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await stripeService.createCustomer(userData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: userData.email,
        name: userData.name,
        metadata: {},
      });
    });
  });

  describe('getCustomer', () => {
    test('should retrieve customer successfully', async () => {
      const mockCustomer = createStripeCustomer();
      mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);

      const result = await stripeService.getCustomer('cus_123');

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_123');
      expect(result).toEqual(mockCustomer);
    });

    test('should handle customer not found', async () => {
      mockStripe.customers.retrieve.mockRejectedValue({
        code: 'resource_missing',
        message: 'No such customer',
      });

      await expect(stripeService.getCustomer('cus_invalid')).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      );
    });

    test('should handle other Stripe errors', async () => {
      mockStripe.customers.retrieve.mockRejectedValue(
        new Error('Network error')
      );

      await expect(stripeService.getCustomer('cus_123')).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve customer',
        })
      );
    });
  });

  describe('createSubscription', () => {
    test('should create subscription successfully', async () => {
      const mockSubscription = createStripeSubscription();
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const subscriptionData = {
        customerId: 'cus_123',
        priceId: 'price_premium',
        metadata: { userId: 'user-123' },
        trialPeriodDays: 7,
      };

      const result = await stripeService.createSubscription(subscriptionData);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: subscriptionData.customerId,
        items: [{ price: subscriptionData.priceId }],
        metadata: subscriptionData.metadata,
        trial_period_days: subscriptionData.trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      expect(result).toEqual(mockSubscription);
    });

    test('should create subscription without trial', async () => {
      const mockSubscription = createStripeSubscription();
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const subscriptionData = {
        customerId: 'cus_123',
        priceId: 'price_premium',
      };

      await stripeService.createSubscription(subscriptionData);

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          trial_period_days: undefined,
        })
      );
    });

    test('should handle subscription creation errors', async () => {
      mockStripe.subscriptions.create.mockRejectedValue(
        new Error('Card declined')
      );

      const subscriptionData = {
        customerId: 'cus_123',
        priceId: 'price_premium',
      };

      await expect(
        stripeService.createSubscription(subscriptionData)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create subscription',
        })
      );
    });
  });

  describe('cancelSubscription', () => {
    test('should cancel subscription at period end', async () => {
      const mockSubscription = createStripeSubscription({
        cancel_at_period_end: true,
      });
      mockStripe.subscriptions.update.mockResolvedValue(mockSubscription);

      const result = await stripeService.cancelSubscription('sub_123');

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: true,
      });

      expect(result.cancel_at_period_end).toBe(true);
    });

    test('should cancel subscription immediately', async () => {
      const mockSubscription = createStripeSubscription({
        cancel_at_period_end: false,
      });
      mockStripe.subscriptions.update.mockResolvedValue(mockSubscription);

      const result = await stripeService.cancelSubscription('sub_123', false);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        cancel_at_period_end: false,
      });
    });

    test('should handle cancellation errors', async () => {
      mockStripe.subscriptions.update.mockRejectedValue(
        new Error('Subscription not found')
      );

      await expect(
        stripeService.cancelSubscription('sub_invalid')
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel subscription',
        })
      );
    });
  });

  describe('createCheckoutSession', () => {
    test('should create checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        payment_status: 'unpaid',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const sessionData = {
        priceId: 'price_premium',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        customerId: 'cus_123',
        metadata: { userId: 'user-123' },
        trialPeriodDays: 7,
      };

      const result = await stripeService.createCheckoutSession(sessionData);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [{
          price: sessionData.priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: sessionData.successUrl,
        cancel_url: sessionData.cancelUrl,
        customer: sessionData.customerId,
        metadata: sessionData.metadata,
        subscription_data: {
          trial_period_days: sessionData.trialPeriodDays,
        },
      });

      expect(result).toEqual(mockSession);
    });

    test('should create checkout session without customer', async () => {
      const mockSession = { id: 'cs_test_123' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const sessionData = {
        priceId: 'price_premium',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      await stripeService.createCheckoutSession(sessionData);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          customer: expect.any(String),
        })
      );
    });

    test('should handle checkout session creation errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Invalid price ID')
      );

      const sessionData = {
        priceId: 'invalid_price',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      await expect(
        stripeService.createCheckoutSession(sessionData)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        })
      );
    });
  });

  describe('constructWebhookEvent', () => {
    beforeEach(() => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    });

    test('should construct webhook event successfully', async () => {
      const mockEvent = createStripeWebhookEvent(
        'customer.subscription.created',
        createStripeSubscription()
      );

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const payload = JSON.stringify(mockEvent);
      const signature = 'test_signature';

      const result = await stripeService.constructWebhookEvent(payload, signature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_test_secret'
      );

      expect(result).toEqual(mockEvent);
    });

    test('should handle invalid webhook signature', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const payload = 'invalid_payload';
      const signature = 'invalid_signature';

      await expect(
        stripeService.constructWebhookEvent(payload, signature)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Invalid webhook signature',
        })
      );
    });
  });

  describe('getPrices', () => {
    test('should retrieve active prices', async () => {
      const mockPrices = [
        { id: 'price_1', active: true, product: { name: 'Premium' } },
        { id: 'price_2', active: true, product: { name: 'Annual' } },
      ];

      mockStripe.prices.list.mockResolvedValue({ data: mockPrices });

      const result = await stripeService.getPrices();

      expect(mockStripe.prices.list).toHaveBeenCalledWith({
        active: true,
        expand: ['data.product'],
      });

      expect(result).toEqual(mockPrices);
    });

    test('should handle price retrieval errors', async () => {
      mockStripe.prices.list.mockRejectedValue(new Error('API error'));

      await expect(stripeService.getPrices()).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve prices',
        })
      );
    });
  });

  describe('getInvoices', () => {
    test('should retrieve customer invoices', async () => {
      const mockInvoices = [
        createStripeInvoice(),
        createStripeInvoice(),
      ];

      mockStripe.invoices.list.mockResolvedValue({ data: mockInvoices });

      const result = await stripeService.getInvoices('cus_123');

      expect(mockStripe.invoices.list).toHaveBeenCalledWith({
        customer: 'cus_123',
        limit: 10,
      });

      expect(result).toEqual(mockInvoices);
    });

    test('should handle invoice retrieval errors', async () => {
      mockStripe.invoices.list.mockRejectedValue(new Error('Customer not found'));

      await expect(stripeService.getInvoices('cus_invalid')).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve invoices',
        })
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle Stripe rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).code = 'rate_limit';

      mockStripe.customers.create.mockRejectedValue(rateLimitError);

      await expect(
        stripeService.createCustomer({
          email: 'test@example.com',
          name: 'Test User',
        })
      ).rejects.toThrow(TRPCError);
    });

    test('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as any).code = 'ECONNRESET';

      mockStripe.subscriptions.retrieve.mockRejectedValue(timeoutError);

      await expect(stripeService.getSubscription('sub_123')).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        })
      );
    });

    test('should handle malformed webhook payloads', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new SyntaxError('Unexpected token');
      });

      await expect(
        stripeService.constructWebhookEvent('malformed', 'sig')
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
        })
      );
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle subscription lifecycle', async () => {
      // Create customer
      const mockCustomer = createStripeCustomer();
      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      // Create subscription
      const mockSubscription = createStripeSubscription({
        customer: mockCustomer.id,
        status: 'active',
      });
      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      // Cancel subscription
      const canceledSubscription = createStripeSubscription({
        customer: mockCustomer.id,
        status: 'canceled',
        cancel_at_period_end: true,
      });
      mockStripe.subscriptions.update.mockResolvedValue(canceledSubscription);

      // Execute lifecycle
      const customer = await stripeService.createCustomer({
        email: 'test@example.com',
        name: 'Test User',
      });

      const subscription = await stripeService.createSubscription({
        customerId: customer.id,
        priceId: 'price_premium',
      });

      const canceled = await stripeService.cancelSubscription(subscription.id);

      expect(customer.id).toBe(mockCustomer.id);
      expect(subscription.customer).toBe(customer.id);
      expect(canceled.cancel_at_period_end).toBe(true);
    });

    test('should handle checkout to subscription flow', async () => {
      // Create checkout session
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        subscription: 'sub_123',
      };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      // Retrieve subscription after payment
      const mockSubscription = createStripeSubscription({
        id: 'sub_123',
        status: 'active',
      });
      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

      const session = await stripeService.createCheckoutSession({
        priceId: 'price_premium',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      });

      const subscription = await stripeService.getSubscription('sub_123');

      expect(session.url).toContain('checkout.stripe.com');
      expect(subscription.status).toBe('active');
    });
  });
});