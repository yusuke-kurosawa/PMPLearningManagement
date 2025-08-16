/**
 * RBAC (Role-Based Access Control) システムのテスト
 * Developer 1: 包括的認可システム（RBAC）実装のテスト
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  create
  requirePermission,
  requireOwnership,
  Permission,
  Resource,
  Action,
  SubscriptionPlan,
  UserContext,
  getPermissionDebugInfo,
} from '../rbac'
import { UserRole } from '@prisma/client'

describe('RBAC システム', () => {
  describe('', () => {
    let adminUser: UserContext
    let instructorUser: UserContext
    let premiumUser: UserContext
    let freeUser: UserContext

    beforeEach(() => {
      adminUser = {
        id: 'admin123',
        role: UserRole.ADMIN,
        subscriptionPlan: SubscriptionPlan.ENTERPRISE,
        subscriptionActive: true,
        profileComplete: true,
      }

      instructorUser = {
        id: 'instructor123',
        role: 'instructor' as UserRole,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      premiumUser = {
        id: 'user123',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      freeUser = {
        id: 'user456',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        subscriptionActive: false,
        profileComplete: true,
      }
    })

    describe('基本権限チェック', () => {
      it('管理者は全ての権限を持つ', () => {
        const checker = create(adminUser)

        expect(checker.hasPermission(Permission.USER_ADMIN)).toBe(true)
        expect(checker.hasPermission(Permission.SYSTEM_ADMIN)).toBe(true)
        expect(checker.hasPermission(Permission.AI_UNLIMITED)).toBe(true)
        expect(checker.hasPermission(Permission.ANALYTICS_ADMIN)).toBe(true)
      })

      it('インストラクターは適切な権限を持つ', () => {
        const checker = create(instructorUser)

        expect(checker.hasPermission(Permission.LEARNING_ANALYTICS)).toBe(true)
        expect(checker.hasPermission(Permission.EXAM_CREATE)).toBe(true)
        expect(checker.hasPermission(Permission.COLLAB_MODERATE)).toBe(true)
        expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(true)

        // 管理者専用権限は持たない
        expect(checker.hasPermission(Permission.SYSTEM_ADMIN)).toBe(false)
        expect(checker.hasPermission(Permission.USER_ADMIN)).toBe(false)
      })

      it('プレミアムユーザーは限定された権限を持つ', () => {
        const checker = create(premiumUser)

        expect(checker.hasPermission(Permission.LEARNING_READ)).toBe(true)
        expect(checker.hasPermission(Permission.LEARNING_ANALYTICS)).toBe(true)
        expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(true)
        expect(checker.hasPermission(Permission.ANALYTICS_ADVANCED)).toBe(true)

        // 管理機能は持たない
        expect(checker.hasPermission(Permission.EXAM_CREATE)).toBe(false)
        expect(checker.hasPermission(Permission.CONTENT_WRITE)).toBe(false)
      })

      it('無料ユーザーは基本権限のみを持つ', () => {
        const checker = create(freeUser)

        expect(checker.hasPermission(Permission.LEARNING_READ)).toBe(true)
        expect(checker.hasPermission(Permission.CONTENT_READ)).toBe(true)
        expect(checker.hasPermission(Permission.EXAM_TAKE)).toBe(true)

        // プレミアム機能は持たない
        expect(checker.hasPermission(Permission.AI_BASIC)).toBe(false)
        expect(checker.hasPermission(Permission.LEARNING_ANALYTICS)).toBe(false)
        expect(checker.hasPermission(Permission.LEARNING_EXPORT)).toBe(false)
      })
    })

    describe('複数権限チェック', () => {
      it('全ての権限が必要な場合（AND条件）', () => {
        const checker = create(instructorUser)

        const requiredPermissions = [
          Permission.LEARNING_READ,
          Permission.LEARNING_WRITE,
          Permission.EXAM_CREATE,
        ]

        expect(checker.hasAllPermissions(requiredPermissions)).toBe(true)

        const impossiblePermissions = [
          Permission.LEARNING_READ,
          Permission.SYSTEM_ADMIN, // インストラクターには無い権限
        ]

        expect(checker.hasAllPermissions(impossiblePermissions)).toBe(false)
      })

      it('いずれかの権限があれば良い場合（OR条件）', () => {
        const checker = create(freeUser)

        const anyPermissions = [
          Permission.AI_UNLIMITED, // 持っていない
          Permission.CONTENT_READ, // 持っている
          Permission.SYSTEM_ADMIN, // 持っていない
        ]

        expect(checker.hasAnyPermission(anyPermissions)).toBe(true)

        const noPermissions = [
          Permission.AI_UNLIMITED,
          Permission.SYSTEM_ADMIN,
          Permission.ANALYTICS_ADMIN,
        ]

        expect(checker.hasAnyPermission(noPermissions)).toBe(false)
      })
    })

    describe('リソース・アクションベースアクセス', () => {
      it('リソースとアクションの組み合わせで権限チェック', () => {
        const checker = create(instructorUser)

        expect(checker.canAccess(Resource.LEARNING, Action.READ)).toBe(true)
        expect(checker.canAccess(Resource.LEARNING, Action.UPDATE)).toBe(true)
        expect(checker.canAccess(Resource.EXAM, Action.CREATE)).toBe(true)
        expect(checker.canAccess(Resource.SYSTEM, Action.ADMIN)).toBe(false)
      })
    })

    describe('条件付き権限チェック', () => {
      it('カスタム条件を含む権限チェック', () => {
        const checker = create(premiumUser)

        const profileCompleteCondition = (ctx: UserContext) => ctx.profileComplete
        const profileIncompleteCondition = (ctx: UserContext) => !ctx.profileComplete

        expect(
          checker.canAccessWithCondition(Permission.LEARNING_ANALYTICS, profileCompleteCondition)
        ).toBe(true)

        expect(
          checker.canAccessWithCondition(Permission.LEARNING_ANALYTICS, profileIncompleteCondition)
        ).toBe(false)
      })
    })

    describe('リソース所有権チェック', () => {
      it('自分のリソースにはアクセス可能', () => {
        const checker = create(freeUser)

        expect(checker.canAccessOwnResource(freeUser.id)).toBe(true)
        expect(checker.canAccessOwnResource('other-user-id')).toBe(false)
      })

      it('管理者は他人のリソースにもアクセス可能', () => {
        const checker = create(adminUser)

        expect(checker.canAccessOwnResource('any-user-id')).toBe(true)
        expect(checker.canAccessOwnResource('another-user-id')).toBe(true)
      })
    })

    describe('特別なロールチェック', () => {
      it('管理者ロールの判定', () => {
        expect(createPermissionChecker(adminUser).isAdmin()).toBe(true)
        expect(create(instructorUser).isAdmin()).toBe(false)
        expect(create(premiumUser).isAdmin()).toBe(false)
      })

      it('インストラクターロールの判定', () => {
        expect(createPermissionChecker(adminUser).isInstructor()).toBe(true) // 管理者もインストラクター権限
        expect(create(instructorUser).isInstructor()).toBe(true)
        expect(create(premiumUser).isInstructor()).toBe(false)
      })

      it('プレミアムユーザーの判定', () => {
        expect(createPermissionChecker(premiumUser).isPremiumUser()).toBe(true)
        expect(create(adminUser).isPremiumUser()).toBe(true) // エンタープライズもプレミアム
        expect(create(freeUser).isPremiumUser()).toBe(false)
      })

      it('エンタープライズユーザーの判定', () => {
        expect(createPermissionChecker(adminUser).isEnterpriseUser()).toBe(true)
        expect(create(premiumUser).isEnterpriseUser()).toBe(false)
        expect(create(freeUser).isEnterpriseUser()).toBe(false)
      })
    })

    describe('AI機能使用権限', () => {
      it('基本AI機能の使用権限', () => {
        const basicUser = {
          ...freeUser,
          subscriptionPlan: SubscriptionPlan.BASIC,
          subscriptionActive: true,
        }
        const checker = createPermissionChecker(basicUser)

        expect(checker.canUseAI('basic')).toBe(true)
        expect(checker.canUseAI('advanced')).toBe(false)
        expect(checker.canUseAI('unlimited')).toBe(false)
      })

      it('高度なAI機能の使用権限', () => {
        const checker = create(premiumUser)

        expect(checker.canUseAI('basic')).toBe(true)
        expect(checker.canUseAI('advanced')).toBe(true)
        expect(checker.canUseAI('unlimited')).toBe(false)
      })

      it('無制限AI機能の使用権限', () => {
        const checker = create(adminUser)

        expect(checker.canUseAI('basic')).toBe(true)
        expect(checker.canUseAI('advanced')).toBe(true)
        expect(checker.canUseAI('unlimited')).toBe(true)
      })
    })

    describe('利用可能権限の取得', () => {
      it('ユーザーの利用可能権限リストを正しく取得', () => {
        const checker = create(premiumUser)
        const availablePermissions = checker.getAvailablePermissions()

        expect(availablePermissions).toContain(Permission.LEARNING_READ)
        expect(availablePermissions).toContain(Permission.AI_ADVANCED)
        expect(availablePermissions).toContain(Permission.ANALYTICS_ADVANCED)
        expect(availablePermissions).not.toContain(Permission.SYSTEM_ADMIN)
        expect(availablePermissions).not.toContain(Permission.AI_UNLIMITED)
      })
    })
  })

  describe('ヘルパー関数', () => {
    describe('requirePermission', () => {
      const testUser: UserContext = {
        id: 'user123',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      it('権限がある場合は成功', () => {
        const checker = requirePermission(Permission.LEARNING_READ)

        expect(() => checker(testUser)).not.toThrow()
      })

      it('権限がない場合はエラー', () => {
        const checker = requirePermission(Permission.SYSTEM_ADMIN)

        expect(() => checker(testUser)).toThrow('権限が不足しています')
      })

      it('複数権限のAND条件チェック', () => {
        const checker = requirePermission([Permission.LEARNING_READ, Permission.AI_ADVANCED], {
          mode: 'all',
        })

        expect(() => checker(testUser)).not.toThrow()
      })

      it('複数権限のOR条件チェック', () => {
        const checker = requirePermission(
          [
            Permission.SYSTEM_ADMIN, // 持っていない
            Permission.LEARNING_READ, // 持っている
          ],
          { mode: 'any' }
        )

        expect(() => checker(testUser)).not.toThrow()
      })

      it('未認証ユーザーは常にエラー', () => {
        const checker = requirePermission(Permission.LEARNING_READ)

        expect(() => checker(null)).toThrow('認証が必要です')
      })

      it('カスタムチェック機能', () => {
        const checker = requirePermission(Permission.LEARNING_READ, {
          customCheck: (ctx) => ctx.profileComplete,
        })

        expect(() => checker(testUser)).not.toThrow()

        const incompleteUser = { ...testUser, profileComplete: false }
        expect(() => checker(incompleteUser)).toThrow('カスタム権限チェックに失敗しました')
      })
    })

    describe('requireOwnership', () => {
      const testUser: UserContext = {
        id: 'user123',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        subscriptionActive: false,
        profileComplete: true,
      }

      it('自分のリソースへのアクセスは成功', () => {
        const checker = requireOwnership('user123')

        expect(() => checker(testUser)).not.toThrow()
      })

      it('他人のリソースへのアクセスはエラー', () => {
        const checker = requireOwnership('other-user')

        expect(() => checker(testUser)).toThrow('リソースへのアクセス権限がありません')
      })

      it('管理者は他人のリソースにもアクセス可能', () => {
        const adminUser: UserContext = {
          id: 'admin123',
          role: UserRole.ADMIN,
          subscriptionPlan: SubscriptionPlan.ENTERPRISE,
          subscriptionActive: true,
          profileComplete: true,
        }

        const checker = requireOwnership('any-user')

        expect(() => checker(adminUser)).not.toThrow()
      })
    })
  })

  describe('デバッグ情報', () => {
    it('権限デバッグ情報を正しく生成', () => {
      const testUser: UserContext = {
        id: 'user123',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      const debugInfo = getPermissionDebugInfo(testUser)

      expect(debugInfo.user.id).toBe('user123')
      expect(debugInfo.user.role).toBe(UserRole.USER)
      expect(debugInfo.user.subscriptionPlan).toBe(SubscriptionPlan.PREMIUM)
      expect(debugInfo.availablePermissions).toBeInstanceOf(Array)
      expect(debugInfo.rolePermissions).toBeInstanceOf(Array)
      expect(debugInfo.subscriptionPermissions).toBeInstanceOf(Array)
      expect(debugInfo.specialRoles).toHaveProperty('isAdmin')
      expect(debugInfo.specialRoles).toHaveProperty('isPremiumUser')
    })
  })

  describe('サブスクリプション無効時の動作', () => {
    it('サブスクリプションが無効な場合はFREEプランの権限のみ', () => {
      const inactiveUser: UserContext = {
        id: 'user123',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: false, // 無効
        profileComplete: true,
      }

      const checker = createPermissionChecker(inactiveUser)

      // 基本権限のみ
      expect(checker.hasPermission(Permission.LEARNING_READ)).toBe(true)
      expect(checker.hasPermission(Permission.CONTENT_READ)).toBe(true)

      // プレミアム機能は無効
      expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(false)
      expect(checker.hasPermission(Permission.ANALYTICS_ADVANCED)).toBe(false)
    })
  })
})
