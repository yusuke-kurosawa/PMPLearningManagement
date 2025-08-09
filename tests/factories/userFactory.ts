import { faker } from '@faker-js/faker'
import { User, Role, Subscription } from '@prisma/client'

// User factory
export function createUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    emailVerified: faker.date.past(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
    role: 'USER' as Role,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    lastLoginAt: faker.date.recent(),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'ja',
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
    },
    profile: {
      bio: faker.lorem.paragraph(),
      location: faker.location.city(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      linkedIn: faker.internet.url(),
      twitter: faker.internet.userName(),
    },
    ...overrides,
  } as User
}

// Batch create users
export function createUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, () => createUser(overrides))
}

// Create user with specific role
export function createAdminUser(overrides?: Partial<User>): User {
  return createUser({
    role: 'ADMIN' as Role,
    email: `admin-${faker.string.alphanumeric(6)}@example.com`,
    ...overrides,
  })
}

export function createPremiumUser(overrides?: Partial<User>): User {
  return createUser({
    role: 'PREMIUM' as Role,
    email: `premium-${faker.string.alphanumeric(6)}@example.com`,
    ...overrides,
  })
}

// User with subscription
export interface UserWithSubscription extends User {
  subscription: Subscription | null
}

export function createUserWithSubscription(
  userOverrides?: Partial<User>,
  subscriptionOverrides?: Partial<Subscription>
): UserWithSubscription {
  const user = createPremiumUser(userOverrides)
  const subscription = createSubscription({
    userId: user.id,
    ...subscriptionOverrides,
  })

  return {
    ...user,
    subscription,
  }
}

// Subscription factory
export function createSubscription(overrides?: Partial<Subscription>): Subscription {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
    stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
    stripePriceId: `price_${faker.string.alphanumeric(14)}`,
    status: 'active',
    plan: 'PREMIUM',
    currentPeriodStart: faker.date.recent(),
    currentPeriodEnd: faker.date.future(),
    canceledAt: null,
    cancelAtPeriodEnd: false,
    trialEnd: null,
    metadata: {},
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  } as Subscription
}

// Account factory (OAuth accounts)
export function createAccount(userId: string, provider: string = 'google') {
  return {
    id: faker.string.uuid(),
    userId,
    type: 'oauth',
    provider,
    providerAccountId: faker.string.alphanumeric(16),
    refresh_token: faker.string.alphanumeric(64),
    access_token: faker.string.alphanumeric(64),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'Bearer',
    scope: 'openid email profile',
    id_token: faker.string.alphanumeric(128),
    session_state: faker.string.alphanumeric(32),
  }
}

// Session factory
export function createSession(userId: string) {
  return {
    id: faker.string.uuid(),
    sessionToken: faker.string.alphanumeric(64),
    userId,
    expires: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  }
}

// User statistics factory
export function createUserStats(userId: string) {
  return {
    userId,
    totalStudyTime: faker.number.int({ min: 0, max: 10000 }),
    completedProcesses: faker.number.int({ min: 0, max: 49 }),
    totalProcesses: 49,
    examsTaken: faker.number.int({ min: 0, max: 20 }),
    averageScore: faker.number.float({ min: 60, max: 100, multipleOf: 0.1 }),
    flashcardsReviewed: faker.number.int({ min: 0, max: 1000 }),
    streak: faker.number.int({ min: 0, max: 365 }),
    lastActivityAt: faker.date.recent(),
    achievements: ['first_login', 'completed_first_process', 'perfect_score'],
  }
}

// User preferences factory
export function createUserPreferences(overrides?: any) {
  return {
    theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
    language: faker.helpers.arrayElement(['ja', 'en']),
    fontSize: faker.helpers.arrayElement(['small', 'medium', 'large']),
    notifications: {
      email: faker.datatype.boolean(),
      push: faker.datatype.boolean(),
      inApp: faker.datatype.boolean(),
      dailyReminder: faker.datatype.boolean(),
      weeklyReport: faker.datatype.boolean(),
      examReminder: faker.datatype.boolean(),
    },
    privacy: {
      showProfile: faker.datatype.boolean(),
      showProgress: faker.datatype.boolean(),
      allowMessages: faker.datatype.boolean(),
    },
    learning: {
      defaultView: faker.helpers.arrayElement(['matrix', 'network', 'list']),
      autoplayVideos: faker.datatype.boolean(),
      showHints: faker.datatype.boolean(),
      difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
    },
    ...overrides,
  }
}

// Test user seeds
export const TEST_USERS = {
  admin: createAdminUser({
    id: 'admin-001',
    email: 'admin@test.com',
    name: 'Test Admin',
  }),
  premium: createPremiumUser({
    id: 'premium-001',
    email: 'premium@test.com',
    name: 'Premium User',
  }),
  regular: createUser({
    id: 'user-001',
    email: 'user@test.com',
    name: 'Regular User',
  }),
  inactive: createUser({
    id: 'user-002',
    email: 'inactive@test.com',
    name: 'Inactive User',
    isActive: false,
  }),
  unverified: createUser({
    id: 'user-003',
    email: 'unverified@test.com',
    name: 'Unverified User',
    emailVerified: null,
  }),
}

// Batch operations
export function createUserBatch(config: {
  admins?: number
  premium?: number
  regular?: number
  inactive?: number
}) {
  const users: User[] = []

  if (config.admins) {
    users.push(...Array.from({ length: config.admins }, () => createAdminUser()))
  }

  if (config.premium) {
    users.push(...Array.from({ length: config.premium }, () => createPremiumUser()))
  }

  if (config.regular) {
    users.push(...Array.from({ length: config.regular }, () => createUser()))
  }

  if (config.inactive) {
    users.push(...Array.from({ length: config.inactive }, () => createUser({ isActive: false })))
  }

  return users
}
