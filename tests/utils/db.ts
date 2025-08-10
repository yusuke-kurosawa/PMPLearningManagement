import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { vi } from 'vitest'

// Prisma mock client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Reset database mock
export const resetDb = () => {
  mockReset(prismaMock)
}

// Database test utilities
export class TestDatabase {
  private data: Map<string, Map<string, any>> = new Map()

  constructor() {
    this.reset()
  }

  reset() {
    this.data.clear()
    this.initializeCollections()
  }

  private initializeCollections() {
    const collections = [
      'user',
      'session',
      'account',
      'learningProgress',
      'subscription',
      'payment',
      'notification',
      'examResult',
      'flashcardProgress',
    ]

    collections.forEach((collection) => {
      this.data.set(collection, new Map())
    })
  }

  create(collection: string, data: any) {
    const id = data.id || this.generateId()
    const record = {
      ...data,
      id,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    }

    this.getCollection(collection).set(id, record)
    return record
  }

  findUnique(collection: string, where: { id?: string; email?: string }) {
    const coll = this.getCollection(collection)

    if (where.id) {
      return coll.get(where.id) || null
    }

    if (where.email) {
      for (const record of coll.values()) {
        if (record.email === where.email) {
          return record
        }
      }
    }

    return null
  }

  findMany(collection: string, where?: any) {
    const coll = this.getCollection(collection)
    const records = Array.from(coll.values())

    if (!where) return records

    return records.filter((record) => {
      return Object.entries(where).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle nested conditions
          if ('in' in value) {
            return (value as any).in.includes(record[key])
          }
          if ('contains' in value) {
            return record[key]?.includes((value as any).contains)
          }
          if ('gte' in value) {
            return record[key] >= (value as any).gte
          }
          if ('lte' in value) {
            return record[key] <= (value as any).lte
          }
        }
        return record[key] === value
      })
    })
  }

  update(collection: string, where: { id: string }, data: any) {
    const record = this.findUnique(collection, where)
    if (!record) throw new Error('Record not found')

    const updated = {
      ...record,
      ...data,
      updatedAt: new Date(),
    }

    this.getCollection(collection).set(where.id, updated)
    return updated
  }

  delete(collection: string, where: { id: string }) {
    const record = this.findUnique(collection, where)
    if (!record) throw new Error('Record not found')

    this.getCollection(collection).delete(where.id)
    return record
  }

  count(collection: string, where?: any) {
    if (!where) {
      return this.getCollection(collection).size
    }
    return this.findMany(collection, where).length
  }

  private getCollection(name: string): Map<string, any> {
    const collection = this.data.get(name)
    if (!collection) {
      throw new Error(`Collection "${name}" not found`)
    }
    return collection
  }

  private generateId(): string {
    return 'test-' + Math.random().toString(36).substr(2, 9)
  }
}

// Global test database instance
export const testDb = new TestDatabase()

// Mock Prisma client with test database
export function mockPrismaClient() {
  const mock = {
    user: {
      create: vi.fn((args: any) => testDb.create('user', args.data)),
      findUnique: vi.fn((args: any) => testDb.findUnique('user', args.where)),
      findMany: vi.fn((args: any) => testDb.findMany('user', args.where)),
      update: vi.fn((args: any) => testDb.update('user', args.where, args.data)),
      delete: vi.fn((args: any) => testDb.delete('user', args.where)),
      count: vi.fn((args: any) => testDb.count('user', args.where)),
    },
    session: {
      create: vi.fn((args: any) => testDb.create('session', args.data)),
      findUnique: vi.fn((args: any) => testDb.findUnique('session', args.where)),
      findMany: vi.fn((args: any) => testDb.findMany('session', args.where)),
      update: vi.fn((args: any) => testDb.update('session', args.where, args.data)),
      delete: vi.fn((args: any) => testDb.delete('session', args.where)),
    },
    learningProgress: {
      create: vi.fn((args: any) => testDb.create('learningProgress', args.data)),
      findUnique: vi.fn((args: any) => testDb.findUnique('learningProgress', args.where)),
      findMany: vi.fn((args: any) => testDb.findMany('learningProgress', args.where)),
      update: vi.fn((args: any) => testDb.update('learningProgress', args.where, args.data)),
      upsert: vi.fn((args: any) => {
        const existing = testDb.findUnique('learningProgress', args.where)
        if (existing) {
          return testDb.update('learningProgress', args.where, args.update)
        }
        return testDb.create('learningProgress', args.create)
      }),
    },
    subscription: {
      create: vi.fn((args: any) => testDb.create('subscription', args.data)),
      findUnique: vi.fn((args: any) => testDb.findUnique('subscription', args.where)),
      findMany: vi.fn((args: any) => testDb.findMany('subscription', args.where)),
      update: vi.fn((args: any) => testDb.update('subscription', args.where, args.data)),
    },
    notification: {
      create: vi.fn((args: any) => testDb.create('notification', args.data)),
      findMany: vi.fn((args: any) => testDb.findMany('notification', args.where)),
      updateMany: vi.fn((args: any) => {
        const records = testDb.findMany('notification', args.where)
        return {
          count: records.length,
          records: records.map((r) => testDb.update('notification', { id: r.id }, args.data)),
        }
      }),
    },
    $transaction: vi.fn(async (callback: any) => {
      if (Array.isArray(callback)) {
        return Promise.all(callback)
      }
      return callback(mock)
    }),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  }

  return mock
}

// Seed test data
export async function seedTestData() {
  // Create test users
  const users = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User One',
      role: 'USER',
      emailVerified: new Date(),
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      name: 'User Two',
      role: 'PREMIUM',
      emailVerified: new Date(),
    },
    {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  ]

  users.forEach((user) => testDb.create('user', user))

  // Create test subscriptions
  testDb.create('subscription', {
    id: 'sub-1',
    userId: 'user-2',
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
    status: 'active',
    plan: 'PREMIUM',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  // Create test learning progress
  testDb.create('learningProgress', {
    id: 'progress-1',
    userId: 'user-1',
    processId: 'process-1',
    knowledgeArea: 'INTEGRATION',
    processGroup: 'INITIATING',
    status: 'COMPLETED',
    completedAt: new Date(),
    score: 85,
  })

  return {
    users,
  }
}

// Transaction helper
export async function withTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
  const tx = mockPrismaClient()
  try {
    const result = await callback(tx)
    return result
  } catch (error) {
    // Rollback would happen here in real implementation
    throw error
  }
}

// Query builder mock
export class QueryBuilder {
  private conditions: any[] = []
  private orderByClause: any = {}
  private limitValue?: number
  private offsetValue?: number

  where(condition: any) {
    this.conditions.push(condition)
    return this
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.orderByClause[field] = direction
    return this
  }

  limit(value: number) {
    this.limitValue = value
    return this
  }

  offset(value: number) {
    this.offsetValue = value
    return this
  }

  build() {
    return {
      where: this.conditions.length === 1 ? this.conditions[0] : { AND: this.conditions },
      orderBy: this.orderByClause,
      take: this.limitValue,
      skip: this.offsetValue,
    }
  }
}
