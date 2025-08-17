/**
 * 認証・ユーザー関連型定義
 * ユーザー管理、認証状態、権限管理の型安全性を提供
 */

import type { UserId, Timestamp, EntityMetadata } from '../common/base'
import type { LearningLevel, LearningPreferences } from '../learning/progress'

// ==================== 基本認証型 ====================

/**
 * 認証プロバイダー型
 */
export type AuthProvider = 'email' | 'google' | 'github' | 'microsoft' | 'apple'

/**
 * 認証状態型
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading' | 'error'

/**
 * ユーザーロール型
 */
export type UserRole = 'student' | 'instructor' | 'admin' | 'super-admin' | 'guest'

/**
 * アカウント状態型
 */
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted'

/**
 * 認証方法型
 */
export type AuthenticationMethod = 'password' | 'oauth' | 'sso' | 'mfa' | 'magic-link'

// ==================== ユーザー基本型 ====================

/**
 * 基本ユーザー型
 */
export type User = {
  id: UserId
  email: string
  username?: string
  firstName?: string
  lastName?: string
  displayName: string
  avatar?: string
  role: UserRole
  status: AccountStatus
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt?: Timestamp
}

/**
 * 詳細ユーザープロファイル型
 */
export type UserProfile = User &
  EntityMetadata & {
    // 個人情報
    personalInfo: PersonalInfo

    // 連絡先情報
    contactInfo: ContactInfo

    // 学習関連
    learningProfile: LearningProfile

    // 設定・環境設定
    preferences: UserPreferences

    // セキュリティ設定
    securitySettings: SecuritySettings

    // サブスクリプション・プラン
    subscription: UserSubscription

    // 統計・実績
    statistics: UserStatistics

    // ソーシャル機能
    socialProfile: SocialProfile
  }

/**
 * 個人情報型
 */
export type PersonalInfo = {
  dateOfBirth?: Timestamp
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  nationality?: string
  timeZone: string
  locale: string
  profession?: string
  organization?: string
  jobTitle?: string
  experience?: string
  education?: EducationBackground[]
  certifications?: Certification[]
}

/**
 * 教育背景型
 */
export type EducationBackground = {
  degree: string
  institution: string
  field: string
  graduationYear?: number
  isCompleted: boolean
}

/**
 * 資格認定型
 */
export type Certification = {
  name: string
  issuingOrganization: string
  issueDate: Timestamp
  expirationDate?: Timestamp
  credentialId?: string
  verificationUrl?: string
  isActive: boolean
}

/**
 * 連絡先情報型
 */
export type ContactInfo = {
  phone?: string
  alternateEmail?: string
  address?: Address
  emergencyContact?: EmergencyContact
  preferredContactMethod: 'email' | 'phone' | 'both'
  marketingConsent: boolean
}

/**
 * 住所型
 */
export type Address = {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

/**
 * 緊急連絡先型
 */
export type EmergencyContact = {
  name: string
  relationship: string
  phone: string
  email?: string
}

// ==================== 学習プロファイル型 ====================

/**
 * 学習プロファイル型
 */
export type LearningProfile = {
  currentLevel: LearningLevel
  targetCertifications: string[]
  learningGoals: string[]
  interests: string[]
  specializations: string[]
  preferences: LearningPreferences
  studySchedule: StudySchedule
  learningHistory: LearningHistory
  achievements: Achievement[]
}

/**
 * 学習スケジュール型
 */
export type StudySchedule = {
  weeklyHours: number
  preferredDays: number[] // 0-6 (Sunday-Saturday)
  preferredTimes: TimeSlot[]
  breakPreferences: BreakPreference
  isFlexible: boolean
}

/**
 * 時間スロット型
 */
export type TimeSlot = {
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  intensity: 'low' | 'medium' | 'high'
}

/**
 * 休憩設定型
 */
export type BreakPreference = {
  frequency: number // 分
  duration: number // 分
  type: 'short' | 'medium' | 'long'
}

/**
 * 学習履歴型
 */
export type LearningHistory = {
  coursesCompleted: string[]
  certificationsEarned: string[]
  skillsAcquired: string[]
  projectsCompleted: string[]
  totalStudyHours: number
  startDate: Timestamp
}

/**
 * 実績型
 */
export type Achievement = {
  id: string
  name: string
  description: string
  category: 'learning' | 'progress' | 'consistency' | 'performance' | 'social'
  icon: string
  earnedAt: Timestamp
  points: number
  isRare: boolean
  shareableUrl?: string
}

// ==================== ユーザー設定型 ====================

/**
 * ユーザー設定型
 */
export type UserPreferences = {
  // 外観設定
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: 'small' | 'medium' | 'large'
  colorScheme?: string

  // 通知設定
  notifications: NotificationPreferences

  // プライバシー設定
  privacy: PrivacySettings

  // アクセシビリティ
  accessibility: AccessibilitySettings

  // 統合設定
  integrations: IntegrationSettings
}

/**
 * 通知設定型
 */
export type NotificationPreferences = {
  email: EmailNotificationSettings
  push: PushNotificationSettings
  inApp: InAppNotificationSettings
  sms: SmsNotificationSettings
}

/**
 * メール通知設定型
 */
export type EmailNotificationSettings = {
  enabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  types: {
    studyReminders: boolean
    progressUpdates: boolean
    achievements: boolean
    announcements: boolean
    marketingEmails: boolean
  }
}

/**
 * プッシュ通知設定型
 */
export type PushNotificationSettings = {
  enabled: boolean
  deviceTokens: string[]
  types: {
    studyReminders: boolean
    achievements: boolean
    messages: boolean
    updates: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

/**
 * アプリ内通知設定型
 */
export type InAppNotificationSettings = {
  enabled: boolean
  sound: boolean
  badge: boolean
  types: {
    progress: boolean
    tips: boolean
    social: boolean
    system: boolean
  }
}

/**
 * SMS通知設定型
 */
export type SmsNotificationSettings = {
  enabled: boolean
  phoneNumber?: string
  types: {
    security: boolean
    reminders: boolean
    urgent: boolean
  }
}

/**
 * プライバシー設定型
 */
export type PrivacySettings = {
  profileVisibility: 'public' | 'friends' | 'private'
  showProgress: boolean
  showAchievements: boolean
  showStatistics: boolean
  allowMessages: boolean
  allowFriendRequests: boolean
  dataRetention: number // days
  analyticsOptOut: boolean
}

/**
 * アクセシビリティ設定型
 */
export type AccessibilitySettings = {
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  reduceMotion: boolean
  voiceNavigation: boolean
  subtitles: boolean
}

/**
 * 統合設定型
 */
export type IntegrationSettings = {
  googleCalendar: IntegrationConfig
  outlook: IntegrationConfig
  slack: IntegrationConfig
  discord: IntegrationConfig
  notion: IntegrationConfig
}

/**
 * 統合設定型
 */
export type IntegrationConfig = {
  enabled: boolean
  accessToken?: string
  refreshToken?: string
  settings: Record<string, unknown>
  lastSyncAt?: Timestamp
}

// ==================== セキュリティ設定型 ====================

/**
 * セキュリティ設定型
 */
export type SecuritySettings = {
  twoFactorAuth: TwoFactorAuthSettings
  loginSecurity: LoginSecuritySettings
  sessionManagement: SessionManagementSettings
  dataEncryption: DataEncryptionSettings
  auditLog: AuditLogSettings
}

/**
 * 二段階認証設定型
 */
export type TwoFactorAuthSettings = {
  enabled: boolean
  method: 'totp' | 'sms' | 'email' | 'hardware'
  backupCodes: string[]
  lastUsed?: Timestamp
  trustedDevices: TrustedDevice[]
}

/**
 * 信頼デバイス型
 */
export type TrustedDevice = {
  id: string
  name: string
  userAgent: string
  ipAddress: string
  addedAt: Timestamp
  lastUsed: Timestamp
  isActive: boolean
}

/**
 * ログインセキュリティ設定型
 */
export type LoginSecuritySettings = {
  passwordPolicy: PasswordPolicy
  sessionTimeout: number // minutes
  maxFailedAttempts: number
  lockoutDuration: number // minutes
  deviceRemembering: boolean
  locationTracking: boolean
  suspiciousActivityAlerts: boolean
}

/**
 * パスワードポリシー型
 */
export type PasswordPolicy = {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
  expirationDays?: number
}

/**
 * セッション管理設定型
 */
export type SessionManagementSettings = {
  maxConcurrentSessions: number
  sessionTimeout: number
  idleTimeout: number
  rememberMe: boolean
  logoutOnClose: boolean
}

/**
 * データ暗号化設定型
 */
export type DataEncryptionSettings = {
  encryptionEnabled: boolean
  keyRotationInterval: number // days
  backupEncryption: boolean
  transitEncryption: boolean
}

/**
 * 監査ログ設定型
 */
export type AuditLogSettings = {
  enabled: boolean
  retentionPeriod: number // days
  detailLevel: 'basic' | 'detailed' | 'verbose'
  includeIpAddress: boolean
  includeUserAgent: boolean
}

// ==================== サブスクリプション型 ====================

/**
 * サブスクリプション型
 */
export type UserSubscription = {
  planId: string
  planName: string
  tier: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'suspended'
  startDate: Timestamp
  endDate?: Timestamp
  trialEndDate?: Timestamp
  autoRenew: boolean
  paymentMethod?: PaymentMethod
  features: SubscriptionFeature[]
  usage: UsageMetrics
  billing: BillingInfo
}

/**
 * 支払い方法型
 */
export type PaymentMethod = {
  id: string
  type: 'credit-card' | 'debit-card' | 'paypal' | 'bank-transfer'
  lastFour: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

/**
 * サブスクリプション機能型
 */
export type SubscriptionFeature = {
  name: string
  description: string
  isEnabled: boolean
  limit?: number
  used?: number
}

/**
 * 使用量メトリクス型
 */
export type UsageMetrics = {
  studyHours: number
  testsCompleted: number
  storageUsed: number // MB
  apiCalls: number
  resetDate: Timestamp
}

/**
 * 請求情報型
 */
export type BillingInfo = {
  lastPaymentDate?: Timestamp
  nextPaymentDate?: Timestamp
  amount: number
  currency: string
  invoices: Invoice[]
}

/**
 * 請求書型
 */
export type Invoice = {
  id: string
  date: Timestamp
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  downloadUrl?: string
}

// ==================== ユーザー統計型 ====================

/**
 * ユーザー統計型
 */
export type UserStatistics = {
  // 学習統計
  totalStudyTime: number // minutes
  dailyAverage: number // minutes
  weeklyAverage: number // minutes
  currentStreak: number // days
  longestStreak: number // days

  // 進捗統計
  coursesCompleted: number
  testsCompleted: number
  averageScore: number
  improvementRate: number

  // エンゲージメント
  loginFrequency: number
  sessionDuration: number // minutes
  featureUsage: Record<string, number>

  // ソーシャル統計
  friends: number
  studyGroups: number
  helpfulVotes: number
  contributionScore: number
}

// ==================== ソーシャルプロファイル型 ====================

/**
 * ソーシャルプロファイル型
 */
export type SocialProfile = {
  friends: Friend[]
  studyGroups: string[]
  followedInstructors: string[]
  blockedUsers: string[]
  socialLinks: SocialLink[]
  reputation: ReputationScore
  contributions: Contribution[]
}

/**
 * 友達型
 */
export type Friend = {
  userId: UserId
  displayName: string
  avatar?: string
  friendSince: Timestamp
  mutualFriends: number
  sharedInterests: string[]
  status: 'online' | 'offline' | 'studying'
}

/**
 * ソーシャルリンク型
 */
export type SocialLink = {
  platform: 'linkedin' | 'twitter' | 'github' | 'personal'
  url: string
  isPublic: boolean
}

/**
 * 評判スコア型
 */
export type ReputationScore = {
  total: number
  breakdown: {
    helpfulness: number
    accuracy: number
    engagement: number
    leadership: number
  }
  level: 'novice' | 'contributor' | 'expert' | 'mentor' | 'leader'
  badges: string[]
}

/**
 * 貢献型
 */
export type Contribution = {
  type: 'answer' | 'question' | 'resource' | 'feedback' | 'moderation'
  title: string
  date: Timestamp
  votes: number
  impact: 'low' | 'medium' | 'high'
}

// ==================== 認証セッション型 ====================

/**
 * 認証セッション型
 */
export type AuthSession = {
  id: string
  userId: UserId
  token: string
  refreshToken?: string
  provider: AuthProvider
  expiresAt: Timestamp
  createdAt: Timestamp
  ipAddress: string
  userAgent: string
  isActive: boolean
  lastActivityAt: Timestamp
}

/**
 * 認証状態型
 */
export type AuthState = {
  status: AuthStatus
  user: User | null
  session: AuthSession | null
  permissions: string[]
  error: string | null
  isLoading: boolean
  lastChecked: Timestamp
}

// ==================== 権限管理型 ====================

/**
 * 権限型
 */
export type Permission = {
  id: string
  name: string
  description: string
  resource: string
  action: string
  conditions?: PermissionCondition[]
}

/**
 * 権限条件型
 */
export type PermissionCondition = {
  type: 'time' | 'location' | 'device' | 'subscription' | 'custom'
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'in' | 'not-in'
  value: unknown
}

/**
 * ロール権限型
 */
export type RolePermissions = {
  role: UserRole
  permissions: Permission[]
  inherits?: UserRole[]
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * 認証済み判定
 */
export const isAuthenticated = (authState: AuthState): boolean => {
  return authState.status === 'authenticated' && authState.user !== null
}

/**
 * 管理者判定
 */
export const isAdmin = (user: User): boolean => {
  return user.role === 'admin' || user.role === 'super-admin'
}

/**
 * アクティブアカウント判定
 */
export const isActiveAccount = (user: User): boolean => {
  return user.status === 'active' && user.emailVerified
}

/**
 * 有効サブスクリプション判定
 */
export const hasActiveSubscription = (subscription: UserSubscription): boolean => {
  return subscription.status === 'active' || subscription.status === 'trial'
}

/**
 * 権限チェック
 */
export const hasPermission = (permissions: string[], requiredPermission: string): boolean => {
  return permissions.includes(requiredPermission)
}

// ==================== エクスポート統合 ====================

/**
 * 認証・ユーザー型定義の統合エクスポート
 */
export type AuthTypes = {
  User: User
  UserProfile: UserProfile
  AuthState: AuthState
  AuthSession: AuthSession
  UserPreferences: UserPreferences
  SecuritySettings: SecuritySettings
  UserSubscription: UserSubscription
  UserStatistics: UserStatistics
  SocialProfile: SocialProfile
  Permission: Permission
  RolePermissions: RolePermissions
}
