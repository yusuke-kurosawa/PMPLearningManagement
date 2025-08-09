/**
 * Role-Based Access Control (RBAC) System
 * Permission management and authorization logic
 * 担当: 認証・セキュリティエンジニア
 */

import { UserRole } from '@prisma/client'
import { z } from 'zod'

// サブスクリプションプラン定義
export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

// 新しいユーザーロール（既存のPrismaに追加したいロール）
export enum ExtendedUserRole {
  USER = 'USER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

// 権限定義
export enum Permission {
  // ユーザー管理
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  USER_ADMIN = 'user:admin',

  // 学習機能
  LEARNING_READ = 'learning:read',
  LEARNING_WRITE = 'learning:write',
  LEARNING_PROGRESS = 'learning:progress',
  LEARNING_ANALYTICS = 'learning:analytics',
  LEARNING_EXPORT = 'learning:export',

  // 試験機能
  EXAM_TAKE = 'exam:take',
  EXAM_CREATE = 'exam:create',
  EXAM_ADMIN = 'exam:admin',
  EXAM_ANALYTICS = 'exam:analytics',

  // コラボレーション
  COLLAB_READ = 'collaboration:read',
  COLLAB_WRITE = 'collaboration:write',
  COLLAB_MODERATE = 'collaboration:moderate',
  COLLAB_ADMIN = 'collaboration:admin',

  // AI機能
  AI_BASIC = 'ai:basic',
  AI_ADVANCED = 'ai:advanced',
  AI_UNLIMITED = 'ai:unlimited',

  // 分析・レポート
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_ADVANCED = 'analytics:advanced',
  ANALYTICS_ADMIN = 'analytics:admin',

  // コンテンツ管理
  CONTENT_READ = 'content:read',
  CONTENT_WRITE = 'content:write',
  CONTENT_ADMIN = 'content:admin',

  // システム管理
  SYSTEM_HEALTH = 'system:health',
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_ADMIN = 'system:admin',

  // 決済・サブスクリプション
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_MANAGE = 'payment:manage',
  PAYMENT_ADMIN = 'payment:admin',
}

// リソース定義
export enum Resource {
  USER = 'user',
  PROFILE = 'profile',
  LEARNING = 'learning',
  EXAM = 'exam',
  COLLABORATION = 'collaboration',
  AI = 'ai',
  ANALYTICS = 'analytics',
  CONTENT = 'content',
  SYSTEM = 'system',
  PAYMENT = 'payment',
}

// アクション定義
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ADMIN = 'admin',
}

// 権限マッピング
const rolePermissions: Record<UserRole | 'INSTRUCTOR', Permission[]> = {
  [UserRole.ADMIN]: [
    // 全権限
    ...Object.values(Permission),
  ],

  ['INSTRUCTOR']: [
    // ユーザー管理
    Permission.USER_READ,

    // 学習機能
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
    Permission.LEARNING_PROGRESS,
    Permission.LEARNING_ANALYTICS,
    Permission.LEARNING_EXPORT,

    // 試験機能
    Permission.EXAM_TAKE,
    Permission.EXAM_CREATE,
    Permission.EXAM_ANALYTICS,

    // コラボレーション
    Permission.COLLAB_READ,
    Permission.COLLAB_WRITE,
    Permission.COLLAB_MODERATE,

    // AI機能
    Permission.AI_BASIC,
    Permission.AI_ADVANCED,

    // 分析・レポート
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_ADVANCED,

    // コンテンツ管理
    Permission.CONTENT_READ,
    Permission.CONTENT_WRITE,

    // システム
    Permission.SYSTEM_HEALTH,
  ],

  [UserRole.USER]: [
    // ユーザー管理
    Permission.USER_READ,

    // 学習機能
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
    Permission.LEARNING_PROGRESS,

    // 試験機能
    Permission.EXAM_TAKE,

    // コラボレーション
    Permission.COLLAB_READ,
    Permission.COLLAB_WRITE,

    // コンテンツ
    Permission.CONTENT_READ,
  ],
}

// サブスクリプション別権限
const subscriptionPermissions: Record<SubscriptionPlan, Permission[]> = {
  [SubscriptionPlan.FREE]: [
    // 基本機能のみ
    Permission.LEARNING_READ,
    Permission.LEARNING_WRITE,
    Permission.EXAM_TAKE,
    Permission.CONTENT_READ,
    Permission.COLLAB_READ,
  ],

  [SubscriptionPlan.BASIC]: [
    // 基本 + 分析機能
    ...subscriptionPermissions[SubscriptionPlan.FREE],
    Permission.LEARNING_ANALYTICS,
    Permission.LEARNING_EXPORT,
    Permission.ANALYTICS_VIEW,
    Permission.AI_BASIC,
    Permission.COLLAB_WRITE,
  ],

  [SubscriptionPlan.PREMIUM]: [
    // 基本 + 高度な機能
    ...subscriptionPermissions[SubscriptionPlan.BASIC],
    Permission.AI_ADVANCED,
    Permission.ANALYTICS_ADVANCED,
    Permission.EXAM_ANALYTICS,
    Permission.COLLAB_MODERATE,
  ],

  [SubscriptionPlan.ENTERPRISE]: [
    // プレミアム + 企業向け機能
    ...subscriptionPermissions[SubscriptionPlan.PREMIUM],
    Permission.AI_UNLIMITED,
    Permission.ANALYTICS_ADMIN,
    Permission.CONTENT_WRITE,
  ],
}

// ユーザーコンテキスト
export interface UserContext {
  id: string
  role: UserRole | 'INSTRUCTOR'
  subscriptionPlan: SubscriptionPlan
  subscriptionActive: boolean
  profileComplete: boolean
}

// 権限チェッククラス
export class PermissionChecker {
  private userContext: UserContext

  constructor(userContext: UserContext) {
    this.userContext = userContext
  }

  // 単一権限チェック
  hasPermission(permission: Permission): boolean {
    const rolePerms = rolePermissions[this.userContext.role] || []
    const subscriptionPerms = this.userContext.subscriptionActive
      ? subscriptionPermissions[this.userContext.subscriptionPlan] || []
      : subscriptionPermissions[SubscriptionPlan.FREE]

    return rolePerms.includes(permission) && subscriptionPerms.includes(permission)
  }

  // 複数権限チェック（AND条件）
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(permission))
  }

  // 複数権限チェック（OR条件）
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission))
  }

  // リソース・アクションベースの権限チェック
  canAccess(resource: Resource, action: Action): boolean {
    const permission = `${resource}:${action}` as Permission
    return this.hasPermission(permission)
  }

  // 条件付き権限チェック
  canAccessWithCondition(
    permission: Permission,
    condition: (context: UserContext) => boolean
  ): boolean {
    return this.hasPermission(permission) && condition(this.userContext)
  }

  // 自分のリソースアクセス権限
  canAccessOwnResource(resourceOwnerId: string): boolean {
    return this.userContext.id === resourceOwnerId || this.isAdmin()
  }

  // 管理者権限チェック
  isAdmin(): boolean {
    return this.userContext.role === UserRole.ADMIN
  }

  // インストラクター権限チェック
  isInstructor(): boolean {
    return (
      [UserRole.ADMIN].includes(this.userContext.role) ||
      this.userContext.role === ('INSTRUCTOR' as any)
    )
  }

  // プレミアムユーザーチェック
  isPremiumUser(): boolean {
    return (
      this.userContext.subscriptionActive &&
      [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE].includes(
        this.userContext.subscriptionPlan
      )
    )
  }

  // エンタープライズユーザーチェック
  isEnterpriseUser(): boolean {
    return (
      this.userContext.subscriptionActive &&
      this.userContext.subscriptionPlan === SubscriptionPlan.ENTERPRISE
    )
  }

  // AI機能使用可能チェック
  canUseAI(level: 'basic' | 'advanced' | 'unlimited' = 'basic'): boolean {
    const permissionMap = {
      basic: Permission.AI_BASIC,
      advanced: Permission.AI_ADVANCED,
      unlimited: Permission.AI_UNLIMITED,
    }

    return this.hasPermission(permissionMap[level])
  }

  // 使用可能な権限一覧取得
  getAvailablePermissions(): Permission[] {
    const rolePerms = rolePermissions[this.userContext.role] || []
    const subscriptionPerms = this.userContext.subscriptionActive
      ? subscriptionPermissions[this.userContext.subscriptionPlan] || []
      : subscriptionPermissions[SubscriptionPlan.FREE]

    return rolePerms.filter((perm) => subscriptionPerms.includes(perm))
  }
}

// 権限チェッカーファクトリー
export const createPermissionChecker = (userContext: UserContext): PermissionChecker => {
  return new PermissionChecker(userContext)
}

// Express/Next.js用のミドルウェアヘルパー
export const requirePermission = (
  permission: Permission | Permission[],
  options: {
    mode?: 'all' | 'any'
    customCheck?: (context: UserContext) => boolean
  } = {}
) => {
  return (userContext: UserContext | null): boolean => {
    if (!userContext) {
      throw new Error('認証が必要です')
    }

    const checker = createPermissionChecker(userContext)
    const permissions = Array.isArray(permission) ? permission : [permission]

    let hasPermission = false

    if (options.mode === 'any') {
      hasPermission = checker.hasAnyPermission(permissions)
    } else {
      hasPermission = checker.hasAllPermissions(permissions)
    }

    if (!hasPermission) {
      throw new Error('権限が不足しています')
    }

    if (options.customCheck && !options.customCheck(userContext)) {
      throw new Error('カスタム権限チェックに失敗しました')
    }

    return true
  }
}

// リソース所有者チェック
export const requireOwnership = (resourceOwnerId: string) => {
  return (userContext: UserContext | null): boolean => {
    if (!userContext) {
      throw new Error('認証が必要です')
    }

    const checker = createPermissionChecker(userContext)

    if (!checker.canAccessOwnResource(resourceOwnerId)) {
      throw new Error('リソースへのアクセス権限がありません')
    }

    return true
  }
}

// 権限検証スキーマ（API入力検証用）
export const permissionValidationSchema = z.object({
  action: z.nativeEnum(Action),
  resource: z.nativeEnum(Resource),
  resourceId: z.string().optional(),
  conditions: z.record(z.any()).optional(),
})

export type PermissionValidation = z.infer<typeof permissionValidationSchema>

// 権限エラー
export class PermissionError extends Error {
  constructor(
    message: string,
    public permission: Permission | Permission[],
    public userContext?: UserContext
  ) {
    super(message)
    this.name = 'PermissionError'
  }
}

// 権限デバッグ情報
export const getPermissionDebugInfo = (userContext: UserContext) => {
  const checker = createPermissionChecker(userContext)

  return {
    user: {
      id: userContext.id,
      role: userContext.role,
      subscriptionPlan: userContext.subscriptionPlan,
      subscriptionActive: userContext.subscriptionActive,
    },
    availablePermissions: checker.getAvailablePermissions(),
    rolePermissions: rolePermissions[userContext.role] || [],
    subscriptionPermissions: userContext.subscriptionActive
      ? subscriptionPermissions[userContext.subscriptionPlan] || []
      : subscriptionPermissions[SubscriptionPlan.FREE],
    specialRoles: {
      isAdmin: checker.isAdmin(),
      isInstructor: checker.isInstructor(),
      isPremiumUser: checker.isPremiumUser(),
      isEnterpriseUser: checker.isEnterpriseUser(),
    },
  }
}

export default PermissionChecker
