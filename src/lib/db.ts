import { PrismaClient } from '@prisma/client'

declare global {
  const prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Middleware for soft deletes (if needed)
prisma.$use(async (params, next) => {
  // You can add custom middleware here
  // For example, automatic soft deletes, logging, etc.

  const result = await next(params)
  return result
})

// Helper functions for common database operations
export const _db = {
  // Transaction helper
  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient)
    })
  },

  // Pagination helper
  async paginate<T>(
    model: unknown,
    {
      page = 1,
      limit = 10,
      where = {},
      orderBy = {},
      include = {},
    }: {
      page?: number
      limit?: number
      where?: unknown
      orderBy?: unknown
      include?: unknown
    }
  ) {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        include,
        skip,
        take: limit,
      }),
      model.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    }
  },

  // Batch operations helper
  async batchCreate<T>(model: unknown, data: T[], chunkSize = 100) {
    const results = []

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      const created = await model.createMany({ data: chunk })
      results.push(created)
    }

    return results
  },

  // Soft delete helper (if using soft deletes)
  async softDelete(model: unknown, id: string) {
    return await model.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  },

  // Restore soft deleted record
  async restore(model: unknown, id: string) {
    return await model.update({
      where: { id },
      data: { deletedAt: null },
    })
  },

  // Check database connection
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', message: 'Database connection successful' }
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed', error }
    }
  },
}

// Export Prisma types for use in other files
export type {
  User,
  LearningProgress,
  PMBOKProcess,
  ExamQuestion,
  ExamAttempt,
  StudyGroup,
  Note,
  Achievement,
} from '@prisma/client'
