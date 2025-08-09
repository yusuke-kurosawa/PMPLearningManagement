import { faker } from '@faker-js/faker';

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'Basic PMBOK access',
      '5 practice exams per month',
      'Limited flashcards',
      'Basic progress tracking',
    ],
    limits: {
      examsPerMonth: 5,
      flashcardsPerDay: 20,
      studyGroups: 0,
      downloadableContent: false,
    },
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 2980,
    interval: 'month',
    stripePriceId: 'price_premium_monthly',
    features: [
      'Full PMBOK access',
      'Unlimited practice exams',
      'All flashcards with spaced repetition',
      'Advanced progress analytics',
      'Study groups',
      'Downloadable content',
      'Priority support',
    ],
    limits: {
      examsPerMonth: -1, // unlimited
      flashcardsPerDay: -1,
      studyGroups: 5,
      downloadableContent: true,
    },
  },
  PREMIUM_ANNUAL: {
    id: 'premium_annual',
    name: 'Premium Annual',
    price: 29800,
    interval: 'year',
    stripePriceId: 'price_premium_annual',
    features: [
      'All Premium features',
      '2 months free',
      'Exclusive webinars',
      'Personal study coach',
    ],
    limits: {
      examsPerMonth: -1,
      flashcardsPerDay: -1,
      studyGroups: 10,
      downloadableContent: true,
    },
  },
};

// Stripe subscription factory
export function createStripeSubscription(overrides?: any) {
  const plan = faker.helpers.arrayElement(['PREMIUM', 'PREMIUM_ANNUAL']);
  const status = faker.helpers.arrayElement([
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'trialing',
  ]);
  
  return {
    id: `sub_${faker.string.alphanumeric(24)}`,
    object: 'subscription',
    customer: `cus_${faker.string.alphanumeric(14)}`,
    status,
    current_period_start: Math.floor(Date.now() / 1000) - 86400 * 15,
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 15,
    created: Math.floor(Date.now() / 1000) - 86400 * 30,
    start_date: Math.floor(Date.now() / 1000) - 86400 * 30,
    billing_cycle_anchor: Math.floor(Date.now() / 1000) - 86400 * 30,
    cancel_at_period_end: faker.datatype.boolean(),
    canceled_at: status === 'canceled' ? Math.floor(Date.now() / 1000) : null,
    trial_start: null,
    trial_end: null,
    items: {
      object: 'list',
      data: [{
        id: `si_${faker.string.alphanumeric(14)}`,
        object: 'subscription_item',
        price: {
          id: SUBSCRIPTION_PLANS[plan].stripePriceId,
          object: 'price',
          currency: 'jpy',
          unit_amount: SUBSCRIPTION_PLANS[plan].price,
          recurring: {
            interval: SUBSCRIPTION_PLANS[plan].interval,
            interval_count: 1,
          },
        },
        quantity: 1,
      }],
    },
    metadata: {
      userId: faker.string.uuid(),
      plan,
    },
    ...overrides,
  };
}

// Stripe customer factory
export function createStripeCustomer(overrides?: any) {
  return {
    id: `cus_${faker.string.alphanumeric(14)}`,
    object: 'customer',
    email: faker.internet.email(),
    name: faker.person.fullName(),
    description: null,
    created: Math.floor(Date.now() / 1000) - 86400 * 30,
    currency: 'jpy',
    default_source: `card_${faker.string.alphanumeric(24)}`,
    sources: {
      object: 'list',
      data: [{
        id: `card_${faker.string.alphanumeric(24)}`,
        object: 'card',
        brand: faker.helpers.arrayElement(['Visa', 'Mastercard', 'Amex']),
        last4: faker.string.numeric(4),
        exp_month: faker.number.int({ min: 1, max: 12 }),
        exp_year: faker.number.int({ min: 2025, max: 2030 }),
      }],
    },
    subscriptions: {
      object: 'list',
      data: [],
    },
    metadata: {
      userId: faker.string.uuid(),
    },
    ...overrides,
  };
}

// Stripe payment method factory
export function createStripePaymentMethod(overrides?: any) {
  return {
    id: `pm_${faker.string.alphanumeric(24)}`,
    object: 'payment_method',
    type: 'card',
    card: {
      brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
      last4: faker.string.numeric(4),
      exp_month: faker.number.int({ min: 1, max: 12 }),
      exp_year: faker.number.int({ min: 2025, max: 2030 }),
      funding: 'credit',
      country: 'JP',
    },
    billing_details: {
      address: {
        city: faker.location.city(),
        country: 'JP',
        line1: faker.location.streetAddress(),
        line2: null,
        postal_code: faker.location.zipCode(),
        state: faker.location.state(),
      },
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    },
    created: Math.floor(Date.now() / 1000),
    customer: `cus_${faker.string.alphanumeric(14)}`,
    livemode: false,
    metadata: {},
    ...overrides,
  };
}

// Stripe invoice factory
export function createStripeInvoice(overrides?: any) {
  const amount = faker.number.int({ min: 1000, max: 50000 });
  
  return {
    id: `in_${faker.string.alphanumeric(24)}`,
    object: 'invoice',
    amount_due: amount,
    amount_paid: amount,
    amount_remaining: 0,
    currency: 'jpy',
    customer: `cus_${faker.string.alphanumeric(14)}`,
    subscription: `sub_${faker.string.alphanumeric(24)}`,
    status: faker.helpers.arrayElement(['draft', 'open', 'paid', 'void']),
    created: Math.floor(Date.now() / 1000),
    due_date: Math.floor(Date.now() / 1000) + 86400 * 30,
    paid: true,
    paid_at: Math.floor(Date.now() / 1000),
    period_start: Math.floor(Date.now() / 1000) - 86400 * 30,
    period_end: Math.floor(Date.now() / 1000),
    lines: {
      object: 'list',
      data: [{
        id: `il_${faker.string.alphanumeric(24)}`,
        object: 'line_item',
        amount: amount,
        currency: 'jpy',
        description: 'Premium subscription',
        period: {
          start: Math.floor(Date.now() / 1000) - 86400 * 30,
          end: Math.floor(Date.now() / 1000),
        },
      }],
    },
    payment_intent: `pi_${faker.string.alphanumeric(24)}`,
    hosted_invoice_url: faker.internet.url(),
    invoice_pdf: faker.internet.url(),
    ...overrides,
  };
}

// Stripe webhook event factory
export function createStripeWebhookEvent(type: string, data: any) {
  return {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: data,
      previous_attributes: {},
    },
    livemode: false,
    pending_webhooks: 0,
    request: {
      id: `req_${faker.string.alphanumeric(16)}`,
      idempotency_key: faker.string.uuid(),
    },
  };
}

// Payment history factory
export function createPaymentHistory(userId: string, count: number = 5) {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    userId,
    stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
    amount: faker.number.int({ min: 1000, max: 50000 }),
    currency: 'jpy',
    status: faker.helpers.arrayElement(['succeeded', 'processing', 'failed']),
    description: faker.lorem.sentence(),
    receiptUrl: faker.internet.url(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));
}

// Subscription with full details
export function createFullSubscription(userId: string) {
  const customer = createStripeCustomer({ metadata: { userId } });
  const subscription = createStripeSubscription({
    customer: customer.id,
    metadata: { userId },
  });
  const paymentMethod = createStripePaymentMethod({ customer: customer.id });
  const invoices = Array.from({ length: 3 }, () => 
    createStripeInvoice({
      customer: customer.id,
      subscription: subscription.id,
    })
  );
  
  return {
    id: faker.string.uuid(),
    userId,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    status: subscription.status,
    plan: subscription.metadata.plan,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    canceledAt: subscription.canceled_at 
      ? new Date(subscription.canceled_at * 1000) 
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialEnd: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000) 
      : null,
    metadata: subscription.metadata,
    stripeCustomer: customer,
    stripeSubscription: subscription,
    paymentMethod,
    invoices,
    paymentHistory: createPaymentHistory(userId),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}

// Coupon factory
export function createCoupon(overrides?: any) {
  return {
    id: faker.string.uuid(),
    code: faker.string.alphanumeric(8).toUpperCase(),
    discountType: faker.helpers.arrayElement(['percentage', 'fixed']),
    discountAmount: faker.number.int({ min: 10, max: 50 }),
    validFrom: faker.date.recent(),
    validUntil: faker.date.future(),
    maxUses: faker.number.int({ min: 1, max: 100 }),
    currentUses: faker.number.int({ min: 0, max: 50 }),
    applicablePlans: ['PREMIUM', 'PREMIUM_ANNUAL'],
    metadata: {},
    active: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}