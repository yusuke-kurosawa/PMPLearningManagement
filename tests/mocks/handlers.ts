import { http, HttpResponse } from 'msw'
import { createUser, createAdminUser, createPremiumUser } from '../factories/userFactory'
import { createLearningProgress, createExamResult } from '../factories/progressFactory'
import { createStripeSubscription, createStripeCustomer } from '../factories/subscriptionFactory'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Auth handlers
const authHandlers = [
  // Login
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: createUser({ email: body.email }),
        token: 'mock-jwt-token',
      })
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  // Register
  http.post(`${API_URL}/api/auth/register`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      user: createUser({
        email: body.email,
        name: body.name,
      }),
      token: 'mock-jwt-token',
    })
  }),

  // Session
  http.get(`${API_URL}/api/auth/session`, () => {
    return HttpResponse.json({
      user: createUser(),
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
  }),

  // Logout
  http.post(`${API_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),
]

// User handlers
const userHandlers = [
  // Get users
  http.get(`${API_URL}/api/users`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const users = Array.from({ length: limit }, () => createUser())

    return HttpResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total: 100,
        totalPages: 10,
      },
    })
  }),

  // Get user by ID
  http.get(`${API_URL}/api/users/:id`, ({ params }) => {
    const { id } = params

    if (id === 'admin') {
      return HttpResponse.json(createAdminUser())
    }

    if (id === 'premium') {
      return HttpResponse.json(createPremiumUser())
    }

    return HttpResponse.json(createUser({ id: id as string }))
  }),

  // Update user
  http.patch(`${API_URL}/api/users/:id`, async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as any

    return HttpResponse.json(
      createUser({
        id: id as string,
        ...body,
      })
    )
  }),

  // Delete user
  http.delete(`${API_URL}/api/users/:id`, ({ params }) => {
    return HttpResponse.json({ success: true })
  }),
]

// Learning progress handlers
const learningHandlers = [
  // Get user progress
  http.get(`${API_URL}/api/learning/progress`, () => {
    const progress = Array.from({ length: 49 }, () => createLearningProgress())

    return HttpResponse.json({
      progress,
      statistics: {
        totalProcesses: 49,
        completedProcesses: 25,
        inProgressProcesses: 10,
        notStartedProcesses: 14,
        averageScore: 78.5,
        totalStudyTime: 12500,
      },
    })
  }),

  // Update progress
  http.post(`${API_URL}/api/learning/progress`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(createLearningProgress(body))
  }),

  // Get exam results
  http.get(`${API_URL}/api/learning/exams`, () => {
    const results = Array.from({ length: 5 }, () => createExamResult())

    return HttpResponse.json({
      results,
      statistics: {
        totalExams: 5,
        averageScore: 72.3,
        passRate: 60,
        bestScore: 85,
      },
    })
  }),

  // Submit exam
  http.post(`${API_URL}/api/learning/exams`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json(
      createExamResult({
        score: body.score || 75,
        totalQuestions: body.answers?.length || 180,
      })
    )
  }),
]

// Payment handlers
const paymentHandlers = [
  // Create checkout session
  http.post(`${API_URL}/api/payments/create-checkout-session`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    })
  }),

  // Get subscription
  http.get(`${API_URL}/api/payments/subscription`, () => {
    return HttpResponse.json({
      subscription: createStripeSubscription(),
      customer: createStripeCustomer(),
    })
  }),

  // Cancel subscription
  http.post(`${API_URL}/api/payments/cancel-subscription`, () => {
    return HttpResponse.json({
      success: true,
      subscription: createStripeSubscription({
        cancel_at_period_end: true,
      }),
    })
  }),

  // Webhook
  http.post(`${API_URL}/api/webhooks/stripe`, async ({ request }) => {
    return HttpResponse.json({ received: true })
  }),
]

// Notification handlers
const notificationHandlers = [
  // Get notifications
  http.get(`${API_URL}/api/notifications`, () => {
    return HttpResponse.json({
      notifications: [
        {
          id: '1',
          type: 'info',
          title: 'Welcome!',
          message: 'Welcome to PMP Learning Management',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'success',
          title: 'Progress Updated',
          message: 'Your learning progress has been saved',
          read: true,
          createdAt: new Date().toISOString(),
        },
      ],
    })
  }),

  // Mark as read
  http.patch(`${API_URL}/api/notifications/:id/read`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Send notification
  http.post(`${API_URL}/api/notifications/send`, async ({ request }) => {
    return HttpResponse.json({ success: true })
  }),
]

// Health check handlers
const healthHandlers = [
  http.get(`${API_URL}/api/health`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        stripe: 'connected',
      },
    })
  }),

  http.get(`${API_URL}/api/health/ready`, () => {
    return HttpResponse.json({ ready: true })
  }),

  http.get(`${API_URL}/api/health/live`, () => {
    return HttpResponse.json({ alive: true })
  }),
]

// tRPC handlers
const trpcHandlers = [
  // User router
  http.post(`${API_URL}/api/trpc/user.getById`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      result: {
        data: createUser({ id: body.input }),
      },
    })
  }),

  http.post(`${API_URL}/api/trpc/user.list`, () => {
    return HttpResponse.json({
      result: {
        data: {
          users: Array.from({ length: 10 }, () => createUser()),
          totalCount: 100,
        },
      },
    })
  }),

  // Learning router
  http.post(`${API_URL}/api/trpc/learning.getProgress`, () => {
    return HttpResponse.json({
      result: {
        data: {
          progress: Array.from({ length: 49 }, () => createLearningProgress()),
        },
      },
    })
  }),

  http.post(`${API_URL}/api/trpc/learning.updateProgress`, async ({ request }) => {
    const body = (await request.json()) as any

    return HttpResponse.json({
      result: {
        data: createLearningProgress(body.input),
      },
    })
  }),
]

// Export all handlers
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...learningHandlers,
  ...paymentHandlers,
  ...notificationHandlers,
  ...healthHandlers,
  ...trpcHandlers,
]

// Handler overrides for specific tests
export const errorHandlers = {
  serverError: http.get(`${API_URL}/api/*`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }),

  unauthorized: http.get(`${API_URL}/api/*`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }),

  networkError: http.get(`${API_URL}/api/*`, () => {
    return HttpResponse.error()
  }),
}
