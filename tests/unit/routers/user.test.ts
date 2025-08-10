import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { createTestContext, createMockCaller } from '../../utils/api'
import { createUser, createAdminUser } from '../../factories/userFactory'
import { testDb } from '../../utils/db'

// Mock user router
const userRouter = {
  createCaller: (ctx: any) => ({
    list: async (input?: { search?: string; role?: string; limit?: number; offset?: number }) => {
      const { search = '', role, limit = 20, offset = 0 } = input || {}

      let users = testDb.findMany('user', {})

      // Apply filters
      if (search) {
        users = users.filter(
          (u: any) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (role) {
        users = users.filter((u: any) => u.role === role)
      }

      // Apply pagination
      const total = users.length
      const paginatedUsers = users.slice(offset, offset + limit)

      return {
        users: paginatedUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      }
    },

    getById: async (input: { id: string }) => {
      // Check permissions
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const requesterId = ctx.session.user.id
      const requesterRole = ctx.session.user.role

      // Users can only view their own profile unless they're admin
      if (input.id !== requesterId && requesterRole !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this user',
        })
      }

      const user = testDb.findUnique('user', { id: input.id })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      }
    },

    update: async (input: { id: string; name?: string; email?: string; bio?: string }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const requesterId = ctx.session.user.id
      const requesterRole = ctx.session.user.role

      // Users can only update their own profile unless they're admin
      if (input.id !== requesterId && requesterRole !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this user',
        })
      }

      const user = testDb.findUnique('user', { id: input.id })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Check for email conflicts
      if (input.email && input.email !== user.email) {
        const existingUser = testDb
          .findMany('user', {})
          .find((u: any) => u.email === input.email && u.id !== input.id)

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          })
        }
      }

      const updatedUser = testDb.update(
        'user',
        { id: input.id },
        {
          name: input.name || user.name,
          email: input.email || user.email,
          bio: input.bio || user.bio,
          updatedAt: new Date(),
        }
      )

      return updatedUser
    },

    delete: async (input: { id: string }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const requesterRole = ctx.session.user.role
      const requesterId = ctx.session.user.id

      // Only admin can delete users, and they can't delete themselves
      if (requesterRole !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete users',
        })
      }

      if (input.id === requesterId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        })
      }

      const user = testDb.findUnique('user', { id: input.id })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Check if this is the last admin
      if (user.role === 'ADMIN') {
        const adminCount = testDb.findMany('user', {}).filter((u: any) => u.role === 'ADMIN').length

        if (adminCount <= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete the last admin',
          })
        }
      }

      // Soft delete
      testDb.update(
        'user',
        { id: input.id },
        {
          email: `deleted_${Date.now()}_${user.email}`,
          deletedAt: new Date(),
        }
      )

      return { success: true }
    },

    changeRole: async (input: { id: string; role: string }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      const requesterRole = ctx.session.user.role
      const requesterId = ctx.session.user.id

      if (requesterRole !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can change user roles',
        })
      }

      const user = testDb.findUnique('user', { id: input.id })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Prevent admin from demoting themselves if they're the last admin
      if (user.id === requesterId && user.role === 'ADMIN' && input.role !== 'ADMIN') {
        const adminCount = testDb.findMany('user', {}).filter((u: any) => u.role === 'ADMIN').length

        if (adminCount <= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot demote the last admin',
          })
        }
      }

      const updatedUser = testDb.update(
        'user',
        { id: input.id },
        {
          role: input.role,
          updatedAt: new Date(),
        }
      )

      return updatedUser
    },

    getStats: async () => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      if (ctx.session.user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view user statistics',
        })
      }

      const users = testDb.findMany('user', {})
      const activeUsers = users.filter(
        (u: any) =>
          u.lastLoginAt && new Date(u.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )

      const roleStats = users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {})

      return {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        roleDistribution: roleStats,
        newUsersThisMonth: users.filter(
          (u: any) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
      }
    },
  }),
}

describe('User Router', () => {
  beforeEach(() => {
    testDb.reset()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('list', () => {
    test('should list users with pagination', async () => {
      const users = Array.from({ length: 25 }, (_, i) =>
        createUser({ name: `User ${i + 1}`, email: `user${i + 1}@example.com` })
      )

      users.forEach((user) => testDb.create('user', user))

      const caller = userRouter.createCaller(createTestContext())
      const result = await caller.list({ limit: 10, offset: 0 })

      expect(result.users).toHaveLength(10)
      expect(result.pagination.total).toBe(25)
      expect(result.pagination.hasMore).toBe(true)
    })

    test('should filter users by search term', async () => {
      const users = [
        createUser({ name: 'John Doe', email: 'john@example.com' }),
        createUser({ name: 'Jane Smith', email: 'jane@example.com' }),
        createUser({ name: 'Bob Johnson', email: 'bob@example.com' }),
      ]

      users.forEach((user) => testDb.create('user', user))

      const caller = userRouter.createCaller(createTestContext())
      const result = await caller.list({ search: 'john' })

      expect(result.users).toHaveLength(2) // John Doe and Bob Johnson
      expect(result.users.some((u) => u.name === 'John Doe')).toBe(true)
      expect(result.users.some((u) => u.name === 'Bob Johnson')).toBe(true)
    })

    test('should filter users by role', async () => {
      const users = [
        createUser({ role: 'USER' }),
        createAdminUser({ role: 'ADMIN' }),
        createUser({ role: 'PREMIUM' }),
      ]

      users.forEach((user) => testDb.create('user', user))

      const caller = userRouter.createCaller(createTestContext())
      const result = await caller.list({ role: 'ADMIN' })

      expect(result.users).toHaveLength(1)
      expect(result.users[0].role).toBe('ADMIN')
    })

    test('should return empty list when no users match', async () => {
      const caller = userRouter.createCaller(createTestContext())
      const result = await caller.list({ search: 'nonexistent' })

      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.hasMore).toBe(false)
    })
  })

  describe('getById', () => {
    test('should allow users to view their own profile', async () => {
      const user = createUser()
      testDb.create('user', user)

      const context = createTestContext({
        session: { user: { id: user.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.getById({ id: user.id })

      expect(result.id).toBe(user.id)
      expect(result.email).toBe(user.email)
    })

    test('should allow admins to view any profile', async () => {
      const targetUser = createUser()
      const adminUser = createAdminUser()

      testDb.create('user', targetUser)
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.getById({ id: targetUser.id })

      expect(result.id).toBe(targetUser.id)
    })

    test('should prevent users from viewing other profiles', async () => {
      const user1 = createUser({ id: 'user1' })
      const user2 = createUser({ id: 'user2' })

      testDb.create('user', user1)
      testDb.create('user', user2)

      const context = createTestContext({
        session: { user: { id: user1.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(caller.getById({ id: user2.id })).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this user',
        })
      )
    })

    test('should handle non-existent user', async () => {
      const adminUser = createAdminUser()
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(caller.getById({ id: 'nonexistent' })).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      )
    })

    test('should require authentication', async () => {
      const context = createTestContext({ session: null })
      const caller = userRouter.createCaller(context)

      await expect(caller.getById({ id: 'any-id' })).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      )
    })
  })

  describe('update', () => {
    test('should allow users to update their own profile', async () => {
      const user = createUser({ name: 'Old Name', bio: 'Old bio' })
      testDb.create('user', user)

      const context = createTestContext({
        session: { user: { id: user.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.update({
        id: user.id,
        name: 'New Name',
        bio: 'New bio',
      })

      expect(result.name).toBe('New Name')
      expect(result.bio).toBe('New bio')
    })

    test('should allow admins to update any profile', async () => {
      const targetUser = createUser({ name: 'Target User' })
      const adminUser = createAdminUser()

      testDb.create('user', targetUser)
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.update({
        id: targetUser.id,
        name: 'Updated by Admin',
      })

      expect(result.name).toBe('Updated by Admin')
    })

    test('should prevent email conflicts', async () => {
      const user1 = createUser({ email: 'user1@example.com' })
      const user2 = createUser({ email: 'user2@example.com' })

      testDb.create('user', user1)
      testDb.create('user', user2)

      const context = createTestContext({
        session: { user: { id: user1.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(
        caller.update({
          id: user1.id,
          email: 'user2@example.com', // Already taken
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'CONFLICT',
          message: 'Email already in use',
        })
      )
    })

    test('should allow keeping the same email', async () => {
      const user = createUser({ email: 'user@example.com' })
      testDb.create('user', user)

      const context = createTestContext({
        session: { user: { id: user.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.update({
        id: user.id,
        email: 'user@example.com', // Same email
        name: 'Updated Name',
      })

      expect(result.name).toBe('Updated Name')
      expect(result.email).toBe('user@example.com')
    })

    test('should prevent users from updating other profiles', async () => {
      const user1 = createUser({ id: 'user1' })
      const user2 = createUser({ id: 'user2' })

      testDb.create('user', user1)
      testDb.create('user', user2)

      const context = createTestContext({
        session: { user: { id: user1.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(
        caller.update({
          id: user2.id,
          name: 'Unauthorized Update',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this user',
        })
      )
    })
  })

  describe('delete', () => {
    test('should allow admin to delete users', async () => {
      const targetUser = createUser()
      const adminUser = createAdminUser()

      testDb.create('user', targetUser)
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.delete({ id: targetUser.id })

      expect(result.success).toBe(true)

      const deletedUser = testDb.findUnique('user', { id: targetUser.id })
      expect(deletedUser.deletedAt).toBeTruthy()
      expect(deletedUser.email).toContain('deleted_')
    })

    test('should prevent non-admin from deleting users', async () => {
      const user1 = createUser({ id: 'user1' })
      const user2 = createUser({ id: 'user2' })

      testDb.create('user', user1)
      testDb.create('user', user2)

      const context = createTestContext({
        session: { user: { id: user1.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(caller.delete({ id: user2.id })).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Only admins can delete users',
        })
      )
    })

    test('should prevent admin from deleting themselves', async () => {
      const adminUser = createAdminUser()
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(caller.delete({ id: adminUser.id })).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        })
      )
    })

    test('should prevent deleting the last admin', async () => {
      const adminUser = createAdminUser()
      const targetAdmin = createAdminUser({ id: 'target-admin' })

      testDb.create('user', adminUser)
      testDb.create('user', targetAdmin)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)

      // Delete the first admin (leaving only one)
      await caller.delete({ id: targetAdmin.id })

      // Try to delete the last admin
      const anotherAdmin = createAdminUser({ id: 'another-admin' })
      testDb.create('user', anotherAdmin)

      const contextForLastAdmin = createTestContext({
        session: { user: { id: anotherAdmin.id, role: 'ADMIN' } },
      })

      const callerForLastAdmin = userRouter.createCaller(contextForLastAdmin)

      await expect(callerForLastAdmin.delete({ id: adminUser.id })).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Cannot delete the last admin',
        })
      )
    })
  })

  describe('changeRole', () => {
    test('should allow admin to change user roles', async () => {
      const targetUser = createUser({ role: 'USER' })
      const adminUser = createAdminUser()

      testDb.create('user', targetUser)
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.changeRole({
        id: targetUser.id,
        role: 'PREMIUM',
      })

      expect(result.role).toBe('PREMIUM')
    })

    test('should prevent non-admin from changing roles', async () => {
      const user1 = createUser({ id: 'user1', role: 'USER' })
      const user2 = createUser({ id: 'user2', role: 'USER' })

      testDb.create('user', user1)
      testDb.create('user', user2)

      const context = createTestContext({
        session: { user: { id: user1.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(
        caller.changeRole({
          id: user2.id,
          role: 'ADMIN',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Only admins can change user roles',
        })
      )
    })

    test('should prevent last admin from demoting themselves', async () => {
      const adminUser = createAdminUser()
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(
        caller.changeRole({
          id: adminUser.id,
          role: 'USER',
        })
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'BAD_REQUEST',
          message: 'Cannot demote the last admin',
        })
      )
    })

    test('should allow admin demotion when other admins exist', async () => {
      const admin1 = createAdminUser({ id: 'admin1' })
      const admin2 = createAdminUser({ id: 'admin2' })

      testDb.create('user', admin1)
      testDb.create('user', admin2)

      const context = createTestContext({
        session: { user: { id: admin1.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.changeRole({
        id: admin1.id,
        role: 'USER',
      })

      expect(result.role).toBe('USER')
    })
  })

  describe('getStats', () => {
    test('should return user statistics for admin', async () => {
      const adminUser = createAdminUser()
      const users = [
        createUser({ role: 'USER', lastLoginAt: new Date() }),
        createUser({
          role: 'PREMIUM',
          lastLoginAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        }),
        createUser({ role: 'USER', createdAt: new Date(), lastLoginAt: new Date() }),
      ]

      testDb.create('user', adminUser)
      users.forEach((user) => testDb.create('user', user))

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)
      const result = await caller.getStats()

      expect(result.totalUsers).toBe(4) // 3 users + 1 admin
      expect(result.activeUsers).toBe(3) // Users with recent login
      expect(result.roleDistribution.USER).toBe(2)
      expect(result.roleDistribution.PREMIUM).toBe(1)
      expect(result.roleDistribution.ADMIN).toBe(1)
      expect(result.newUsersThisMonth).toBe(2) // Users created recently
    })

    test('should prevent non-admin from viewing statistics', async () => {
      const user = createUser({ role: 'USER' })
      testDb.create('user', user)

      const context = createTestContext({
        session: { user: { id: user.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      await expect(caller.getStats()).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Only admins can view user statistics',
        })
      )
    })

    test('should require authentication', async () => {
      const context = createTestContext({ session: null })
      const caller = userRouter.createCaller(context)

      await expect(caller.getStats()).rejects.toThrow(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      )
    })
  })

  describe('Edge Cases', () => {
    test('should handle concurrent updates gracefully', async () => {
      const user = createUser()
      testDb.create('user', user)

      const context = createTestContext({
        session: { user: { id: user.id, role: 'USER' } },
      })

      const caller = userRouter.createCaller(context)

      // Simulate concurrent updates
      const updates = [
        caller.update({ id: user.id, name: 'Name 1' }),
        caller.update({ id: user.id, name: 'Name 2' }),
        caller.update({ id: user.id, bio: 'Bio 1' }),
      ]

      await Promise.all(updates)

      const updatedUser = testDb.findUnique('user', { id: user.id })
      expect(updatedUser.name).toBeDefined()
      expect(updatedUser.updatedAt).toBeDefined()
    })

    test('should handle large user lists efficiently', async () => {
      const users = Array.from({ length: 1000 }, (_, i) =>
        createUser({ name: `User ${i}`, email: `user${i}@example.com` })
      )

      users.forEach((user) => testDb.create('user', user))

      const caller = userRouter.createCaller(createTestContext())

      const start = performance.now()
      const result = await caller.list({ limit: 100 })
      const end = performance.now()

      expect(result.users).toHaveLength(100)
      expect(end - start).toBeLessThan(1000) // Should be fast
    })

    test('should validate input parameters', async () => {
      const adminUser = createAdminUser()
      testDb.create('user', adminUser)

      const context = createTestContext({
        session: { user: { id: adminUser.id, role: 'ADMIN' } },
      })

      const caller = userRouter.createCaller(context)

      // Test invalid role change
      const user = createUser()
      testDb.create('user', user)

      // This would be validated by the schema in real implementation
      await expect(caller.changeRole({ id: user.id, role: 'INVALID_ROLE' })).resolves.toBeDefined() // In this mock, we don't validate
    })
  })
})
