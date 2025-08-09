import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rbacService } from '@/server/auth/rbac'
import { authMiddleware } from '@/server/auth/middleware'
import { prisma } from '@/tests/setup/globalSetup'
import { createRequest, createResponse } from 'node-mocks-http'

/**
 * 高度なRBAC（Role-Based Access Control）テスト
 * 担当：認証・セキュリティチーム
 *
 * テストカバレッジ：
 * - ロールベース権限制御
 * - 動的権限管理
 * - リソース単位アクセス制御
 * - 階層権限システム
 * - コンテキストベース認可
 */

describe('RBAC - Role Management', () => {
  const testRoles = {
    ADMIN: {
      permissions: ['*'], // 全権限
      hierarchy: 100,
    },
    INSTRUCTOR: {
      permissions: [
        'course.create',
        'course.edit',
        'course.delete',
        'student.view',
        'progress.view',
        'analytics.view',
      ],
      hierarchy: 80,
    },
    PREMIUM_USER: {
      permissions: [
        'course.access',
        'exam.take',
        'progress.edit',
        'notes.create',
        'discussions.participate',
      ],
      hierarchy: 60,
    },
    FREE_USER: {
      permissions: ['course.view_limited', 'exam.take_limited', 'progress.view'],
      hierarchy: 20,
    },
    GUEST: {
      permissions: ['course.preview'],
      hierarchy: 0,
    },
  }

  beforeEach(async () => {
    // テスト用ロールデータ作成
    await prisma.role.createMany({
      data: Object.entries(testRoles).map(([name, config]) => ({
        name,
        permissions: config.permissions,
        hierarchy: config.hierarchy,
        isActive: true,
      })),
    })
  })

  describe('Permission Checking', () => {
    it('should grant access for exact permission match', async () => {
      const user = { role: 'PREMIUM_USER' }
      const hasPermission = await rbacService.hasPermission(user, 'course.access')

      expect(hasPermission).toBe(true)
    })

    it('should deny access for missing permission', async () => {
      const user = { role: 'FREE_USER' }
      const hasPermission = await rbacService.hasPermission(user, 'course.create')

      expect(hasPermission).toBe(false)
    })

    it('should handle wildcard permissions for admin', async () => {
      const user = { role: 'ADMIN' }
      const testPermissions = [
        'course.create',
        'user.delete',
        'system.config',
        'analytics.export',
        'billing.manage',
      ]

      for (const permission of testPermissions) {
        const hasPermission = await rbacService.hasPermission(user, permission)
        expect(hasPermission).toBe(true)
      }
    })

    it('should respect permission hierarchy', async () => {
      const instructorUser = { role: 'INSTRUCTOR' }
      const freeUser = { role: 'FREE_USER' }

      // Instructorは下位権限も行使可能
      const canViewProgress = await rbacService.hasPermission(instructorUser, 'progress.view')
      expect(canViewProgress).toBe(true)

      // Free userは上位権限を行使不可
      const canCreateCourse = await rbacService.hasPermission(freeUser, 'course.create')
      expect(canCreateCourse).toBe(false)
    })

    it('should handle contextual permissions', async () => {
      const user = { id: 'user-1', role: 'PREMIUM_USER' }
      const context = { resourceOwnerId: 'user-1', courseId: 'course-123' }

      // 自分のリソースにはアクセス可能
      const canEditOwnNotes = await rbacService.hasPermission(user, 'notes.edit', context)
      expect(canEditOwnNotes).toBe(true)

      // 他人のリソースにはアクセス不可
      const otherContext = { resourceOwnerId: 'user-2', courseId: 'course-123' }
      const canEditOthersNotes = await rbacService.hasPermission(user, 'notes.edit', otherContext)
      expect(canEditOthersNotes).toBe(false)
    })

    it('should handle time-based permissions', async () => {
      const user = { role: 'PREMIUM_USER', subscriptionExpiry: new Date(Date.now() + 86400000) }

      // サブスクリプション有効時
      const canAccessPremium = await rbacService.hasPermission(user, 'course.premium_access')
      expect(canAccessPremium).toBe(true)

      // サブスクリプション期限切れ
      const expiredUser = { ...user, subscriptionExpiry: new Date(Date.now() - 86400000) }
      const canAccessExpired = await rbacService.hasPermission(expiredUser, 'course.premium_access')
      expect(canAccessExpired).toBe(false)
    })

    it('should handle resource quotas', async () => {
      const user = { id: 'user-1', role: 'FREE_USER' }

      // 制限回数分は実行可能
      for (let i = 0; i < 3; i++) {
        const canTakeExam = await rbacService.hasPermission(user, 'exam.take_limited', {
          quotaCheck: true,
        })
        expect(canTakeExam).toBe(true)

        // 使用回数を記録
        await rbacService.consumeQuota(user.id, 'exam.take_limited')
      }

      // 制限を超えた場合
      const canTakeMoreExams = await rbacService.hasPermission(user, 'exam.take_limited', {
        quotaCheck: true,
      })
      expect(canTakeMoreExams).toBe(false)
    })
  })

  describe('Role Inheritance', () => {
    it('should inherit permissions from parent roles', async () => {
      // 役職階層を設定
      await rbacService.setRoleInheritance('SENIOR_INSTRUCTOR', ['INSTRUCTOR', 'PREMIUM_USER'])

      const user = { role: 'SENIOR_INSTRUCTOR' }

      // INSTRUCTOR権限
      expect(await rbacService.hasPermission(user, 'course.create')).toBe(true)
      // PREMIUM_USER権限
      expect(await rbacService.hasPermission(user, 'discussions.participate')).toBe(true)
    })

    it('should handle circular inheritance protection', async () => {
      expect(async () => {
        await rbacService.setRoleInheritance('ROLE_A', ['ROLE_B'])
        await rbacService.setRoleInheritance('ROLE_B', ['ROLE_C'])
        await rbacService.setRoleInheritance('ROLE_C', ['ROLE_A']) // 循環
      }).rejects.toThrow('Circular role inheritance detected')
    })

    it('should resolve complex inheritance chains', async () => {
      await rbacService.setRoleInheritance('SUPER_ADMIN', ['ADMIN'])
      await rbacService.setRoleInheritance('ADMIN', ['INSTRUCTOR'])
      await rbacService.setRoleInheritance('INSTRUCTOR', ['PREMIUM_USER'])

      const user = { role: 'SUPER_ADMIN' }

      // 全階層の権限を持つ
      expect(await rbacService.hasPermission(user, 'course.create')).toBe(true) // INSTRUCTOR
      expect(await rbacService.hasPermission(user, 'course.access')).toBe(true) // PREMIUM_USER
      expect(await rbacService.hasPermission(user, 'system.admin')).toBe(true) // ADMIN
    })
  })

  describe('Dynamic Permission Management', () => {
    it('should add permissions at runtime', async () => {
      const user = { role: 'PREMIUM_USER' }

      // 最初は権限なし
      expect(await rbacService.hasPermission(user, 'beta.feature')).toBe(false)

      // 動的に権限追加
      await rbacService.addPermissionToRole('PREMIUM_USER', 'beta.feature')

      // 権限が追加される
      expect(await rbacService.hasPermission(user, 'beta.feature')).toBe(true)
    })

    it('should revoke permissions at runtime', async () => {
      const user = { role: 'PREMIUM_USER' }

      // 最初は権限あり
      expect(await rbacService.hasPermission(user, 'course.access')).toBe(true)

      // 権限を削除
      await rbacService.removePermissionFromRole('PREMIUM_USER', 'course.access')

      // 権限が削除される
      expect(await rbacService.hasPermission(user, 'course.access')).toBe(false)
    })

    it('should handle temporary permission grants', async () => {
      const user = { role: 'FREE_USER' }
      const expiryTime = new Date(Date.now() + 3600000) // 1時間後

      // 一時的な権限付与
      await rbacService.grantTemporaryPermission(user.id, 'course.premium_access', expiryTime)

      // 権限が一時的に使用可能
      expect(await rbacService.hasPermission(user, 'course.premium_access')).toBe(true)

      // 期限切れシミュレーション
      await rbacService.expireTemporaryPermissions()

      // 権限が自動的に削除
      expect(await rbacService.hasPermission(user, 'course.premium_access')).toBe(false)
    })
  })

  describe('Resource-Level Authorization', () => {
    beforeEach(async () => {
      // テスト用リソース作成
      await prisma.course.createMany({
        data: [
          { id: 'course-1', title: 'Public Course', visibility: 'PUBLIC', ownerId: 'instructor-1' },
          {
            id: 'course-2',
            title: 'Private Course',
            visibility: 'PRIVATE',
            ownerId: 'instructor-1',
          },
          {
            id: 'course-3',
            title: 'Premium Course',
            visibility: 'PREMIUM',
            ownerId: 'instructor-2',
          },
        ],
      })
    })

    it('should authorize access based on resource visibility', async () => {
      const freeUser = { role: 'FREE_USER' }
      const premiumUser = { role: 'PREMIUM_USER' }

      // パブリックコース - 全ユーザーアクセス可
      expect(await rbacService.canAccessResource(freeUser, 'course', 'course-1')).toBe(true)
      expect(await rbacService.canAccessResource(premiumUser, 'course', 'course-1')).toBe(true)

      // プレミアムコース - プレミアムユーザーのみ
      expect(await rbacService.canAccessResource(freeUser, 'course', 'course-3')).toBe(false)
      expect(await rbacService.canAccessResource(premiumUser, 'course', 'course-3')).toBe(true)
    })

    it('should authorize access based on resource ownership', async () => {
      const instructor = { id: 'instructor-1', role: 'INSTRUCTOR' }
      const otherInstructor = { id: 'instructor-2', role: 'INSTRUCTOR' }

      // 所有者は編集可能
      expect(await rbacService.canModifyResource(instructor, 'course', 'course-1')).toBe(true)

      // 非所有者は編集不可
      expect(await rbacService.canModifyResource(otherInstructor, 'course', 'course-1')).toBe(false)
    })

    it('should handle shared resource access', async () => {
      const user1 = { id: 'user-1', role: 'PREMIUM_USER' }
      const user2 = { id: 'user-2', role: 'PREMIUM_USER' }

      // リソース共有設定
      await rbacService.shareResource('course', 'course-1', 'instructor-1', ['user-1'])

      // 共有されたユーザーはアクセス可能
      expect(await rbacService.canAccessResource(user1, 'course', 'course-1')).toBe(true)

      // 共有されていないユーザーはアクセス不可
      expect(await rbacService.canAccessResource(user2, 'course', 'course-1')).toBe(false)
    })

    it('should handle attribute-based access control (ABAC)', async () => {
      const user = {
        id: 'user-1',
        role: 'PREMIUM_USER',
        attributes: {
          department: 'engineering',
          clearanceLevel: 'confidential',
          location: 'tokyo',
        },
      }

      const resource = {
        id: 'document-1',
        type: 'document',
        attributes: {
          classification: 'confidential',
          department: 'engineering',
          region: 'asia',
        },
      }

      // 属性ベースのアクセス制御ルール
      const policy = {
        rules: [
          'user.clearanceLevel >= resource.classification',
          'user.department == resource.department',
          'user.location in resource.allowedLocations || resource.region == "asia"',
        ],
      }

      const hasAccess = await rbacService.evaluateABACPolicy(user, resource, policy)
      expect(hasAccess).toBe(true)
    })
  })
})

describe('RBAC - Middleware Integration', () => {
  describe('Authentication Middleware', () => {
    it('should authenticate valid JWT token', async () => {
      const validToken = 'valid-jwt-token'
      const mockUser = { id: 'user-1', role: 'PREMIUM_USER' }

      vi.mocked(authService.verifyAccessToken).mockReturnValue({
        success: true,
        payload: mockUser,
      })

      const req = createRequest({
        headers: { authorization: `Bearer ${validToken}` },
      })
      const res = createResponse()
      const next = vi.fn()

      await authMiddleware.authenticate(req, res, next)

      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should reject invalid JWT token', async () => {
      const invalidToken = 'invalid-jwt-token'

      vi.mocked(authService.verifyAccessToken).mockReturnValue({
        success: false,
        error: 'INVALID_TOKEN',
      })

      const req = createRequest({
        headers: { authorization: `Bearer ${invalidToken}` },
      })
      const res = createResponse()
      const next = vi.fn()

      await authMiddleware.authenticate(req, res, next)

      expect(res.statusCode).toBe(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle missing authorization header', async () => {
      const req = createRequest()
      const res = createResponse()
      const next = vi.fn()

      await authMiddleware.authenticate(req, res, next)

      expect(res.statusCode).toBe(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should refresh expired tokens automatically', async () => {
      const expiredToken = 'expired-jwt-token'
      const refreshToken = 'valid-refresh-token'
      const newToken = 'new-jwt-token'

      vi.mocked(authService.verifyAccessToken).mockReturnValue({
        success: false,
        error: 'TOKEN_EXPIRED',
      })

      vi.mocked(authService.refreshAccessToken).mockReturnValue({
        success: true,
        newToken,
        newRefreshToken: 'new-refresh-token',
      })

      const req = createRequest({
        headers: {
          authorization: `Bearer ${expiredToken}`,
          'x-refresh-token': refreshToken,
        },
      })
      const res = createResponse()
      const next = vi.fn()

      await authMiddleware.authenticateWithRefresh(req, res, next)

      expect(res.getHeader('x-new-access-token')).toBe(newToken)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Authorization Middleware', () => {
    it('should authorize user with required permission', async () => {
      const user = { role: 'INSTRUCTOR' }
      const requiredPermission = 'course.create'

      vi.mocked(rbacService.hasPermission).mockResolvedValue(true)

      const req = createRequest()
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requirePermission(requiredPermission)
      await middleware(req, res, next)

      expect(rbacService.hasPermission).toHaveBeenCalledWith(user, requiredPermission, undefined)
      expect(next).toHaveBeenCalled()
    })

    it('should reject user without required permission', async () => {
      const user = { role: 'FREE_USER' }
      const requiredPermission = 'course.create'

      vi.mocked(rbacService.hasPermission).mockResolvedValue(false)

      const req = createRequest()
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requirePermission(requiredPermission)
      await middleware(req, res, next)

      expect(res.statusCode).toBe(403)
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle multiple permission requirements (OR)', async () => {
      const user = { role: 'PREMIUM_USER' }
      const requiredPermissions = ['admin.access', 'premium.access'] // OR条件

      vi.mocked(rbacService.hasPermission)
        .mockResolvedValueOnce(false) // admin.access = false
        .mockResolvedValueOnce(true) // premium.access = true

      const req = createRequest()
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requireAnyPermission(requiredPermissions)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalled() // 一つでもtrueならOK
    })

    it('should handle multiple permission requirements (AND)', async () => {
      const user = { role: 'INSTRUCTOR' }
      const requiredPermissions = ['course.create', 'course.publish'] // AND条件

      vi.mocked(rbacService.hasPermission)
        .mockResolvedValueOnce(true) // course.create = true
        .mockResolvedValueOnce(true) // course.publish = true

      const req = createRequest()
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requireAllPermissions(requiredPermissions)
      await middleware(req, res, next)

      expect(next).toHaveBeenCalled() // 全部trueならOK
    })

    it('should handle resource-specific authorization', async () => {
      const user = { id: 'user-1', role: 'INSTRUCTOR' }
      const courseId = 'course-123'

      vi.mocked(rbacService.canModifyResource).mockResolvedValue(true)

      const req = createRequest({
        params: { courseId },
      })
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requireResourceAccess('course', 'modify')
      await middleware(req, res, next)

      expect(rbacService.canModifyResource).toHaveBeenCalledWith(user, 'course', courseId)
      expect(next).toHaveBeenCalled()
    })

    it('should handle role hierarchy authorization', async () => {
      const user = { role: 'ADMIN' }
      const minimumRole = 'INSTRUCTOR'

      vi.mocked(rbacService.hasRoleOrHigher).mockResolvedValue(true)

      const req = createRequest()
      req.user = user
      const res = createResponse()
      const next = vi.fn()

      const middleware = authMiddleware.requireMinimumRole(minimumRole)
      await middleware(req, res, next)

      expect(rbacService.hasRoleOrHigher).toHaveBeenCalledWith(user.role, minimumRole)
      expect(next).toHaveBeenCalled()
    })
  })
})
