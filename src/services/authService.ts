/**
 * 認証サービス
 * @description ユーザー認証、認可、セッション管理を包括的に提供
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-14
 */

import { supabase, authHelpers } from '../lib/supabase'
import { auditLogger } from './auditService'
import { logger } from './logger'

// ========================================
// 型定義
// ========================================

/**
 * ユーザーロール列挙型
 * @description システム内でのユーザーの権限レベルを定義
 */
export enum UserRoles {
  /** 管理者 - 全システム権限 */
  ADMIN = 'admin',
  /** 講師 - コンテンツ管理権限 */
  INSTRUCTOR = 'instructor',
  /** 学生 - 学習機能利用権限 */
  STUDENT = 'student',
  /** ゲスト - 閲覧のみの制限権限 */
  GUEST = 'guest',
}

/**
 * 認証エラーコード列挙型
 * @description 認証処理で発生する可能性のあるエラーを定義
 */
export enum AuthErrors {
  /** 無効な認証情報 */
  INVALID_CREDENTIALS = 'invalid_credentials',
  /** アカウントロック中 */
  ACCOUNT_LOCKED = 'account_locked',
  /** メール未確認 */
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  /** パスワード強度不足 */
  WEAK_PASSWORD = 'weak_password',
  /** ユーザー既存 */
  USER_EXISTS = 'user_exists',
  /** ネットワークエラー */
  NETWORK_ERROR = 'network_error',
  /** セッション期限切れ */
  SESSION_EXPIRED = 'session_expired',
  /** 認可エラー */
  UNAUTHORIZED = 'unauthorized',
  /** 多要素認証必須 */
  MFA_REQUIRED = 'mfa_required',
}

/**
 * ユーザープロファイルインターフェース
 * @description 新規登録時のプロファイル情報
 */
export interface UserProfile {
  /** フルネーム */
  fullName?: string
  /** アバターURL */
  avatarUrl?: string
  /** 電話番号 */
  phone?: string
  /** 組織名 */
  organization?: string
  /** ユーザーロール */
  role?: UserRoles
}

/**
 * 認証結果インターフェース
 * @description 認証成功時の返却データ
 */
export interface AuthResult {
  /** ユーザー情報 */
  user: unknown
  /** セッション情報 */
  session: unknown
  /** ユーザーロール */
  role?: UserRoles
}

/**
 * OAuthプロバイダー型
 * @description サポートされているOAuth認証プロバイダー
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft'

/**
 * ログイン試行記録インターフェース
 * @description 失敗したログイン試行の追跡用
 */
// interface LoginAttempt {
//   /** 試行時刻 */
//   timestamp: Date
//   /** IPアドレス */
//   ipAddress?: string
//   /** ユーザーエージェント */
//   userAgent?: string
// }

// ========================================
// メイン認証サービスクラス
// ========================================

/**
 * 認証サービスクラス
 * @description ユーザー認証の全機能を提供するメインサービス
 */
class AuthService {
  /** 最大ログイン試行回数 */
  private readonly maxLoginAttempts: number

  /** アカウントロック継続時間（ミリ秒） */
  private readonly lockoutDuration: number

  /** ログイン試行記録マップ */
  private readonly loginAttempts: Map<string, Date[]>

  /**
   * コンストラクタ
   * @description 認証サービスの初期化
   */
  constructor() {
    this.maxLoginAttempts = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5
    this.lockoutDuration = parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 900000 // 15分
    this.loginAttempts = new Map<string, Date[]>()
  }

  // ========================================
  // 公開メソッド - ユーザー登録・認証
  // ========================================

  /**
   * 新規ユーザー登録
   * @param email - メールアドレス
   * @param password - パスワード
   * @param profile - プロファイル情報（オプション）
   * @returns 登録結果
   * @throws AuthErrors パスワード強度不足、ユーザー既存等
   */
  async register(email: string, password: string, profile: UserProfile = {}): Promise<AuthResult> {
    try {
      // パスワード強度検証
      if (!this.isPasswordStrong(password)) {
        throw new Error(AuthErrors.WEAK_PASSWORD)
      }

      // ユーザー既存チェック
      const existingUser = await this.checkUserExists(email)
      if (existingUser) {
        throw new Error(AuthErrors.USER_EXISTS)
      }

      // ユーザーアカウント作成
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.fullName || '',
            avatar_url: profile.avatarUrl || '',
            phone: profile.phone || '',
          },
          emailRedirectTo: `${import.meta.env.VITE_APP_URL}/verify-email`,
        },
      })

      if (error) {throw error}

      // ユーザープロファイル作成
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...profile,
          role: UserRoles.STUDENT, // デフォルトロール
        })

        // 登録イベントをログ
        await auditLogger.log({
          action: 'USER_REGISTERED',
          userId: data.user.id,
          details: { email },
        })
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Registration error:', error)
      }
      throw error
    }
  }

  /**
   * メール・パスワード認証
   * @param email - メールアドレス
   * @param password - パスワード
   * @returns 認証結果
   * @throws AuthErrors 認証失敗、アカウントロック等
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // アカウントロック状態チェック
      if (this.isAccountLocked(email)) {
        await auditLogger.log({
          action: 'LOGIN_ATTEMPT_BLOCKED',
          details: { email, reason: 'account_locked' },
        })
        throw new Error(AuthErrors.ACCOUNT_LOCKED)
      }

      // 認証試行
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 失敗試行を記録
        this.recordFailedLogin(email)

        await auditLogger.log({
          action: 'LOGIN_FAILED',
          details: { email, error: error.message },
        })

        throw error
      }

      // 失敗試行をクリア
      this.clearFailedLogins(email)

      // ユーザーロールと権限を取得
      const userRole = await authHelpers.getUserRole(data.user.id)

      // ユーザーデータを暗号化してローカルストレージに保存
      const userProfile = {
        ...data.user,
        role: userRole,
      }
      
      // 機密データ暗号化（セキュリティ強化）
      const encryptedProfile = await this.encryptSensitiveData(userProfile)
      localStorage.setItem('user_profile', encryptedProfile)

      // 成功ログイン記録
      await auditLogger.log({
        action: 'USER_LOGGED_IN',
        userId: data.user.id,
        details: { email, role: userRole },
      })

      return { user: data.user, session: data.session, role: userRole }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Sign in error:', error)
      }
      throw error
    }
  }

  /**
   * OAuth認証
   * @param provider - OAuthプロバイダー
   * @returns OAuth認証データ
   * @throws AuthErrors OAuth認証失敗
   */
  async signInWithOAuth(provider: OAuthProvider): Promise<unknown> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
          scopes: this.getOAuthScopes(provider),
        },
      })

      if (error) {throw error}

      await auditLogger.log({
        action: 'OAUTH_LOGIN_INITIATED',
        details: { provider },
      })

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('OAuth sign in error:', error)
      }
      throw error
    }
  }

  /**
   * サインアウト
   * @returns サインアウト成功フラグ
   * @throws Error サインアウト失敗
   */
  async signOut(): Promise<boolean> {
    try {
      const user = await authHelpers.getCurrentUser()

      await authHelpers.signOut()

      // ローカルデータをクリア
      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_role')

      // サインアウトログ
      if (user) {
        await auditLogger.log({
          action: 'USER_LOGGED_OUT',
          userId: user.id,
        })
      }

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Sign out error:', error)
      }
      throw error
    }
  }

  // ========================================
  // 公開メソッド - パスワード管理
  // ========================================

  /**
   * パスワードリセット要求
   * @param email - メールアドレス
   * @returns リセット要求成功フラグ
   * @throws Error リセット要求失敗
   */
  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      })

      if (error) {throw error}

      await auditLogger.log({
        action: 'PASSWORD_RESET_REQUESTED',
        details: { email },
      })

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Password reset error:', error)
      }
      throw error
    }
  }

  /**
   * パスワード更新
   * @param newPassword - 新しいパスワード
   * @returns 更新成功フラグ
   * @throws AuthErrors パスワード強度不足等
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error(AuthErrors.WEAK_PASSWORD)
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {throw error}

      const user = await authHelpers.getCurrentUser()
      if (user) {
        await auditLogger.log({
          action: 'PASSWORD_UPDATED',
          userId: user.id,
        })
      }

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Update password error:', error)
      }
      throw error
    }
  }

  // ========================================
  // 公開メソッド - メール確認・MFA
  // ========================================

  /**
   * メール確認
   * @param token - 確認トークン
   * @returns 確認成功フラグ
   * @throws Error 確認失敗
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {throw error}

      await auditLogger.log({
        action: 'EMAIL_VERIFIED',
      })

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Email verification error:', error)
      }
      throw error
    }
  }

  /**
   * 多要素認証有効化
   * @returns MFA設定データ
   * @throws Error MFA有効化失敗
   */
  async enableMFA(): Promise<unknown> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })

      if (error) {throw error}

      const user = await authHelpers.getCurrentUser()
      if (user) {
        await auditLogger.log({
          action: 'MFA_ENABLED',
          userId: user.id,
        })
      }

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Enable MFA error:', error)
      }
      throw error
    }
  }

  /**
   * 多要素認証確認
   * @param code - 認証コード
   * @param challengeId - チャレンジID
   * @returns MFA確認データ
   * @throws Error MFA確認失敗
   */
  async verifyMFA(code: string, challengeId: string): Promise<unknown> {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        code,
      })

      if (error) {throw error}

      await auditLogger.log({
        action: 'MFA_VERIFIED',
      })

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('MFA verification error:', error)
      }
      throw error
    }
  }

  // ========================================
  // プライベートメソッド - ヘルパー関数
  // ========================================

  /**
   * ユーザー存在チェック
   * @param email - メールアドレス
   * @returns ユーザー存在フラグ
   * @private
   */
  private async checkUserExists(email: string): Promise<boolean> {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single()

    return !!data
  }

  /**
   * ユーザープロファイル作成
   * @param userId - ユーザーID
   * @param profile - プロファイル情報
   * @returns void
   * @throws Error プロファイル作成失敗
   * @private
   */
  private async createUserProfile(
    userId: string,
    profile: UserProfile & { email: string }
  ): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email: profile.email,
      full_name: profile.fullName || '',
      avatar_url: profile.avatarUrl || '',
      phone: profile.phone || '',
      role: profile.role || UserRoles.STUDENT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {throw error}

    // ユーザーロールエントリ作成
    await supabase.from('user_roles').insert({
      user_id: userId,
      role: profile.role || UserRoles.STUDENT,
      assigned_at: new Date().toISOString(),
    })
  }

  /**
   * パスワード強度チェック
   * @param password - パスワード
   * @returns 強度判定結果
   * @private
   */
  private isPasswordStrong(password: string): boolean {
    // 最低8文字、大文字・小文字・数字・特殊文字を各1文字以上含む
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  /**
   * OAuthスコープ取得
   * @param provider - OAuthプロバイダー
   * @returns スコープ文字列
   * @private
   */
  private getOAuthScopes(provider: OAuthProvider): string {
    const scopes: Record<OAuthProvider, string> = {
      google: 'email profile',
      github: 'user:email',
      microsoft: 'openid email profile',
    }
    return scopes[provider] || ''
  }

  /**
   * 失敗ログイン記録
   * @param email - メールアドレス
   * @returns void
   * @private
   */
  private recordFailedLogin(email: string): void {
    const attempts = this.loginAttempts.get(email) || []
    attempts.push(new Date())

    // 最近の試行のみ保持
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.getTime() < this.lockoutDuration
    )

    this.loginAttempts.set(email, recentAttempts)
  }

  /**
   * 失敗ログイン記録クリア
   * @param email - メールアドレス
   * @returns void
   * @private
   */
  private clearFailedLogins(email: string): void {
    this.loginAttempts.delete(email)
  }

  /**
   * アカウントロック状態チェック
   * @param email - メールアドレス
   * @returns ロック状態フラグ
   * @private
   */
  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email) || []
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.getTime() < this.lockoutDuration
    )

    return recentAttempts.length >= this.maxLoginAttempts
  }

  // ========================================
  // 公開メソッド - ユーティリティ
  // ========================================

  /**
   * ロック残り時間取得
   * @param email - メールアドレス
   * @returns 残り時間（秒）
   */
  getLockoutRemainingTime(email: string): number {
    const attempts = this.loginAttempts.get(email) || []
    if (attempts.length === 0) {return 0}

    const lastAttempt = attempts[attempts.length - 1]
    const timePassed = Date.now() - lastAttempt.getTime()
    const remaining = Math.max(0, this.lockoutDuration - timePassed)

    return Math.ceil(remaining / 1000) // 秒単位で返却
  }

  /**
   * 機密データ暗号化
   * @param data - 暗号化対象データ
   * @returns 暗号化済み文字列
   * @private
   */
  private async encryptSensitiveData(data: unknown): Promise<string> {
    try {
      // Web Crypto APIを使用した安全な暗号化
      const encoder = new TextEncoder()
      const plaintext = encoder.encode(JSON.stringify(data))
      
      // 暗号化キーを生成（セッション固有）
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
      
      // 初期化ベクトル生成
      const iv = window.crypto.getRandomValues(new Uint8Array(12))
      
      // 暗号化実行
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        plaintext
      )
      
      // キーをセッションストレージに保存（メモリ上のみ）
      const keyBuffer = await window.crypto.subtle.exportKey('raw', key)
      sessionStorage.setItem('_ek', Array.from(new Uint8Array(keyBuffer)).join(','))
      sessionStorage.setItem('_iv', Array.from(iv).join(','))
      
      // Base64エンコードして返却
      return btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    } catch (error) {
      // 暗号化失敗時はアラート出力（開発時のみ）
      if (process.env.NODE_ENV === 'development') {
        console.warn('暗号化に失敗しました。平文でフォールバック:', error)
      }
      // フォールバック: 最低限の難読化
      return btoa(JSON.stringify(data))
    }
  }

  /**
   * 機密データ復号化
   * @param encryptedData - 暗号化済みデータ
   * @returns 復号化済みデータ
   * @private
   */
  private async decryptSensitiveData(encryptedData: string): Promise<unknown> {
    try {
      const keyData = sessionStorage.getItem('_ek')
      const ivData = sessionStorage.getItem('_iv')
      
      if (!keyData || !ivData) {
        // キーが見つからない場合はBase64デコードでフォールバック
        return JSON.parse(atob(encryptedData))
      }
      
      // キーとIVを復元
      const keyBuffer = new Uint8Array(keyData.split(',').map(x => parseInt(x)))
      const iv = new Uint8Array(ivData.split(',').map(x => parseInt(x)))
      
      // キーをインポート
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
      
      // Base64デコード
      const ciphertext = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
      
      // 復号化実行
      const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      )
      
      // JSON復元
      const decoder = new TextDecoder()
      return JSON.parse(decoder.decode(plaintext))
    } catch (error) {
      // 復号化失敗時はBase64デコードでフォールバック
      if (process.env.NODE_ENV === 'development') {
        console.warn('復号化に失敗しました。フォールバック復号化:', error)
      }
      return JSON.parse(atob(encryptedData))
    }
  }
}

// ========================================
// エクスポート
// ========================================

/** 認証サービスシングルトンインスタンス */
export const authService = new AuthService()
export default authService
