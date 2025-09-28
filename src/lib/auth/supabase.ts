import { createClient } from '@supabase/supabase-js'
import { logger } from '../../services/logger'

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// In development mode, use mock/placeholder credentials to allow app to run without Supabase
const isDevelopment = import.meta.env.MODE === 'development'
const useMockCredentials = isDevelopment && (!supabaseUrl || !supabaseAnonKey)

if (useMockCredentials) {
  console.warn(
    '⚠️ Development Mode: Using mock Supabase credentials. Authentication features will be disabled.'
  )
}

// Use real credentials or mock ones for development
const finalSupabaseUrl = supabaseUrl || 'https://mock-project.supabase.co'
const finalSupabaseAnonKey =
  supabaseAnonKey || 'mock-anon-key-for-development-only'

// Only throw error in production when credentials are missing
if (!useMockCredentials && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    // Configure auth settings
    storage: localStorage, // Use localStorage for persistence
    storageKey: 'pmp-auth-token', // Custom storage key
    autoRefreshToken: true, // Auto refresh tokens
    persistSession: true, // Persist session across browser refreshes
    detectSessionInUrl: true, // Handle OAuth redirects
    flowType: 'pkce', // Use PKCE flow for enhanced security
  },
  global: {
    headers: {
      'X-Client-Info': 'pmp-learning-management/1.0.0',
    },
  },
})

// Enhanced auth helper functions
export const authHelpers = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    return !error && session !== null
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return user
  },

  /**
   * Get current session
   */
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return session
  },

  /**
   * Sign up with email and password
   */
  signUp: async ({ email, password, userData = {} }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          app_name: import.meta.env.VITE_APP_NAME,
        },
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/#/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Sign in with email and password
   */
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${import.meta.env.VITE_APP_URL}/#/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Sign out user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/#/auth/reset-password`,
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Update user password
   */
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      throw error
    }
    return data
  },

  /**
   * Refresh session manually
   */
  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      throw error
    }
    return data
  },

  /**
   * Get user role from metadata
   */
  getUserRole: async () => {
    const user = await authHelpers.getCurrentUser()
    if (!user) {
      return 'guest'
    }

    return user.user_metadata?.role || user.app_metadata?.role || 'student'
  },

  /**
   * Check if user has specific permission
   */
  hasPermission: async (permission) => {
    const role = await authHelpers.getUserRole()
    return checkRolePermission(role, permission)
  },

  /**
   * Check permission for a specific user ID
   */
  hasUserPermission: async (userId, permission) => {
    const { data, error } = await supabase.rpc('check_permission', {
      user_id: userId,
      permission_name: permission,
    })

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error checking permission:', error)
      }
      return false
    }

    return data
  },
}

// Role-based access control - import from constants/roles.js instead of re-exporting
// This avoids circular dependency and tree-shaking issues in production builds
import { ROLES, PERMISSIONS } from '../../constants/roles'

// Role permission mapping
const rolePermissions = {
  [ROLES.ADMIN]: [...Object.values(PERMISSIONS)],
  [ROLES.INSTRUCTOR]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_EXAMS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.CREATE_STUDY_GROUPS,
    PERMISSIONS.PARTICIPATE_DISCUSSIONS,
    PERMISSIONS.SHARE_NOTES,
    PERMISSIONS.CREATE_EXAMS,
    PERMISSIONS.GRADE_EXAMS,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.TAKE_EXAMS,
    PERMISSIONS.VIEW_PROGRESS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.CREATE_STUDY_GROUPS,
    PERMISSIONS.PARTICIPATE_DISCUSSIONS,
    PERMISSIONS.SHARE_NOTES,
  ],
  [ROLES.GUEST]: [PERMISSIONS.VIEW_CONTENT],
}

/**
 * Check if role has specific permission
 */
export const checkRolePermission = (role, permission) => {
  const permissions = rolePermissions[role] || []
  return permissions.includes(permission)
}

// Auth event handlers
export const setupAuthListeners = (onAuthStateChange) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    // Handle auth state changes
    switch (event) {
      case 'SIGNED_IN':
        if (process.env.NODE_ENV === 'development') {
          logger.debug('User signed in:', session?.user?.email)
        }
        break
      case 'SIGNED_OUT':
        if (process.env.NODE_ENV === 'development') {
          logger.debug('User signed out')
        }
        // Clear any cached data
        localStorage.removeItem('pmp-user-preferences')
        break
      case 'TOKEN_REFRESHED':
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Token refreshed')
        }
        break
      case 'USER_UPDATED':
        if (process.env.NODE_ENV === 'development') {
          logger.debug('User updated')
        }
        break
      case 'PASSWORD_RECOVERY':
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Password recovery initiated')
        }
        break
      default:
        break
    }

    // Call the provided callback
    if (onAuthStateChange) {
      onAuthStateChange(event, session)
    }
  })

  return subscription
}

// Utility functions for form validation
// Session management
export const sessionManager = {
  /**
   * Start session monitoring
   */
  startSessionMonitoring: (callback) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (callback) {
        callback(event, session)
      }

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          if (process.env.NODE_ENV === 'development') {
            logger.debug('User signed in')
          }
          break
        case 'SIGNED_OUT':
          if (process.env.NODE_ENV === 'development') {
            logger.debug('User signed out')
          }
          // Clear any cached data
          localStorage.removeItem('user_profile')
          localStorage.removeItem('user_role')
          localStorage.removeItem('pmp-user-preferences')
          break
        case 'TOKEN_REFRESHED':
          if (process.env.NODE_ENV === 'development') {
            logger.debug('Token refreshed')
          }
          break
        case 'USER_UPDATED':
          if (process.env.NODE_ENV === 'development') {
            logger.debug('User updated')
          }
          break
        default:
          break
      }
    })

    return subscription
  },

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring: (subscription) => {
    if (subscription) {
      subscription.unsubscribe()
    }
  },

  /**
   * Check session expiry
   */
  isSessionExpired: async () => {
    try {
      const session = await authHelpers.getCurrentSession()
      if (!session) {
        return true
      }

      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)

      return now >= expiresAt
    } catch {
      return true
    }
  },

  /**
   * Auto refresh token before expiry
   */
  setupAutoRefresh: () => {
    setInterval(async () => {
      const expired = await sessionManager.isSessionExpired()
      if (!expired) {
        const session = await authHelpers.getCurrentSession()
        if (session) {
          const expiresAt = session.expires_at
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = (expiresAt - now) * 1000

          // Refresh if less than 5 minutes until expiry
          if (timeUntilExpiry < 300000) {
            await authHelpers.refreshSession()
          }
        }
      }
    }, 60000) // Check every minute
  },
}

// Utility functions for form validation
export const authValidation = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    const minLength = parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8

    return {
      isValid:
        password.length >= minLength &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password),
      requirements: {
        minLength: password.length >= minLength,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
      },
    }
  },

  /**
   * Generate password strength score
   */
  getPasswordStrength: (password) => {
    let score = 0
    const checks = authValidation.isValidPassword(password)

    if (checks.requirements.minLength) {
      score += 25
    }
    if (checks.requirements.hasLowercase) {
      score += 25
    }
    if (checks.requirements.hasUppercase) {
      score += 25
    }
    if (checks.requirements.hasNumber) {
      score += 25
    }

    // Additional points for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 10
    }

    // Additional points for length beyond minimum
    if (password.length > 12) {
      score += 10
    }

    return Math.min(score, 100)
  },
}

export default supabase
