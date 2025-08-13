import { supabase, authHelpers } from '../lib/supabase'
import { auditLogger } from './auditService'

// User roles enum
export const UserRoles = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  GUEST: 'guest',
}

// Auth error codes
export const AuthErrors = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  ACCOUNT_LOCKED: 'account_locked',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  WEAK_PASSWORD: 'weak_password',
  USER_EXISTS: 'user_exists',
  NETWORK_ERROR: 'network_error',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  MFA_REQUIRED: 'mfa_required',
}

class AuthService {
  constructor() {
    this.maxLoginAttempts = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5
    this.lockoutDuration = parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 900000 // 15 minutes
    this.loginAttempts = new Map()
  }

  // Register new user
  async register(email, password, profile = {}) {
    try {
      // Validate password strength
      if (!this.isPasswordStrong(password)) {
        throw new Error(AuthErrors.WEAK_PASSWORD)
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(email)
      if (existingUser) {
        throw new Error(AuthErrors.USER_EXISTS)
      }

      // Create user account
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

      if (error) throw error

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email,
          ...profile,
          role: UserRoles.STUDENT, // Default role
        })

        // Log registration event
        await auditLogger.log({
          action: 'USER_REGISTERED',
          userId: data.user.id,
          details: { email },
        })
      }

      return { user: data.user, session: data.session }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error)
      }
      throw error
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      // Check account lockout
      if (this.isAccountLocked(email)) {
        await auditLogger.log({
          action: 'LOGIN_ATTEMPT_BLOCKED',
          details: { email, reason: 'account_locked' },
        })
        throw new Error(AuthErrors.ACCOUNT_LOCKED)
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Track failed login attempt
        this.recordFailedLogin(email)

        await auditLogger.log({
          action: 'LOGIN_FAILED',
          details: { email, error: error.message },
        })

        throw error
      }

      // Clear failed login attempts
      this.clearFailedLogins(email)

      // Get user role and permissions
      const userRole = await authHelpers.getUserRole(data.user.id)

      // Store user data
      localStorage.setItem(
        'user_profile',
        JSON.stringify({
          ...data.user,
          role: userRole,
        })
      )

      // Log successful login
      await auditLogger.log({
        action: 'USER_LOGGED_IN',
        userId: data.user.id,
        details: { email, role: userRole },
      })

      return { user: data.user, session: data.session, role: userRole }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in error:', error)
      }
      throw error
    }
  }

  // OAuth sign in
  async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
          scopes: this.getOAuthScopes(provider),
        },
      })

      if (error) throw error

      await auditLogger.log({
        action: 'OAUTH_LOGIN_INITIATED',
        details: { provider },
      })

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OAuth sign in error:', error)
      }
      throw error
    }
  }

  // Sign out
  async signOut() {
    try {
      const user = await authHelpers.getCurrentUser()

      await authHelpers.signOut()

      // Clear stored data
      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_role')

      // Log sign out
      if (user) {
        await auditLogger.log({
          action: 'USER_LOGGED_OUT',
          userId: user.id,
        })
      }

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out error:', error)
      }
      throw error
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      })

      if (error) throw error

      await auditLogger.log({
        action: 'PASSWORD_RESET_REQUESTED',
        details: { email },
      })

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password reset error:', error)
      }
      throw error
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      if (!this.isPasswordStrong(newPassword)) {
        throw new Error(AuthErrors.WEAK_PASSWORD)
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

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
        console.error('Update password error:', error)
      }
      throw error
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) throw error

      await auditLogger.log({
        action: 'EMAIL_VERIFIED',
      })

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email verification error:', error)
      }
      throw error
    }
  }

  // Enable MFA
  async enableMFA() {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })

      if (error) throw error

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
        console.error('Enable MFA error:', error)
      }
      throw error
    }
  }

  // Verify MFA
  async verifyMFA(code, challengeId) {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        code,
      })

      if (error) throw error

      await auditLogger.log({
        action: 'MFA_VERIFIED',
      })

      return data
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('MFA verification error:', error)
      }
      throw error
    }
  }

  // Helper: Check if user exists
  async checkUserExists(email) {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single()

    return !!data
  }

  // Helper: Create user profile
  async createUserProfile(userId, profile) {
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

    if (error) throw error

    // Create user role entry
    await supabase.from('user_roles').insert({
      user_id: userId,
      role: profile.role || UserRoles.STUDENT,
      assigned_at: new Date().toISOString(),
    })
  }

  // Helper: Check password strength
  isPasswordStrong(password) {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Helper: Get OAuth scopes
  getOAuthScopes(provider) {
    const scopes = {
      google: 'email profile',
      github: 'user:email',
      microsoft: 'openid email profile',
    }
    return scopes[provider] || ''
  }

  // Helper: Record failed login attempt
  recordFailedLogin(email) {
    const attempts = this.loginAttempts.get(email) || []
    attempts.push(new Date())

    // Keep only recent attempts
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.getTime() < this.lockoutDuration
    )

    this.loginAttempts.set(email, recentAttempts)
  }

  // Helper: Clear failed login attempts
  clearFailedLogins(email) {
    this.loginAttempts.delete(email)
  }

  // Helper: Check if account is locked
  isAccountLocked(email) {
    const attempts = this.loginAttempts.get(email) || []
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.getTime() < this.lockoutDuration
    )

    return recentAttempts.length >= this.maxLoginAttempts
  }

  // Get lockout remaining time
  getLockoutRemainingTime(email) {
    const attempts = this.loginAttempts.get(email) || []
    if (attempts.length === 0) return 0

    const lastAttempt = attempts[attempts.length - 1]
    const timePassed = Date.now() - lastAttempt.getTime()
    const remaining = Math.max(0, this.lockoutDuration - timePassed)

    return Math.ceil(remaining / 1000) // Return in seconds
  }
}

export const authService = new AuthService()
export default authService
