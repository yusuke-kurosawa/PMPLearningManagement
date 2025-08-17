/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * Context creation for tRPC
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts
  const session = await getServerSession()

  return {
    prisma,
    session,
    req,
    res,
  }
}

/**
 * Initialization of tRPC backend
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a router
 */
export const router = t.router

/**
 * Public procedure
 */
export const publicProcedure = t.procedure

/**
 * Middleware for timing procedures
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  const result = await next()

  const duration = Date.now() - start
  console.log(`[tRPC] ${path} took ${duration}ms`)

  return result
})

/**
 * Protected procedure (requires authentication)
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Admin procedure (requires admin role)
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Premium procedure (requires premium or admin role)
 */
export const premiumProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  if (!['PREMIUM', 'ADMIN'].includes(ctx.session.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Premium access required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Rate limited procedure
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const rateLimitedProcedure = t.procedure.use(async ({ ctx, next, path }) => {
  const identifier = ctx.session?.user?.id || ctx.req.headers['x-forwarded-for'] || 'anonymous'
  const key = `${identifier}:${path}`

  const limit = 100 // requests
  const window = 60 * 1000 // 1 minute

  const now = Date.now()
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window })
  } else {
    if (userLimit.count >= limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetTime - now) / 1000)} seconds.`,
      })
    }
    userLimit.count++
  }

  return next()
})

/**
 * Logged procedure (logs all calls)
 */
export const loggedProcedure = t.procedure.use(timingMiddleware)
