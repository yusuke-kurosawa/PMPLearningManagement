import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { authService, UserRoles } from '../services/authService'
import { supabase, authHelpers, sessionManager } from '../lib/supabase'
import { auditLogger } from '../services/auditService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { logger } from '../services/logger'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  created_at: string
  updated_at: string
}

interface Session {
  access_token: string
  refresh_token: string
  user: User
  expires_at: number
}

interface AuthContextType {
  user: User | null
  session: Session | null
  role: string
  permissions: string[]
  loading: boolean
  authError: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (
    email: string,
    password: string,
    userData?: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>
  hasRole: (requiredRole: string) => boolean
  hasPermission: (permission: string) => boolean
  refreshSession: () => Promise<void>
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  let navigate: ReturnType<typeof useNavigate> | null = null
  try {
    navigate = useNavigate()
  } catch (_error) {
    // useNavigate may not be available in test environment
  }
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string>(UserRoles.GUEST)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    let authSubscription

    const initializeAuth = async () => {
      try {
        // Get current session
        const currentSession = await authHelpers.getCurrentSession()

        if (currentSession) {
          setSession(currentSession)

          // Get user details
          const currentUser = await authHelpers.getCurrentUser()
          setUser(currentUser)

          // Get user role
          if (currentUser) {
            const userRole = await authHelpers.getUserRole(currentUser.id)
            setRole(userRole)

            // Load permissions for role
            await loadPermissions(userRole)
          }
        }

        // Start session monitoring
        authSubscription = sessionManager.startSessionMonitoring((event, session) => {
          handleAuthStateChange(event, session)
        })

        // Setup auto-refresh
        sessionManager.setupAutoRefresh()
      } catch (error) {
        // Silently handle initialization errors in production
        if (process.env.NODE_ENV === 'development') {
          logger.error('Auth initialization error:', error)
        }
        setAuthError(error?.message || 'Authentication initialization failed')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Cleanup
    return () => {
      if (authSubscription) {
        sessionManager.stopSessionMonitoring(authSubscription)
      }
    }
  }, [])

  // Handle auth state changes
  const handleAuthStateChange = async (event, session) => {
    // Log auth state changes in development only
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Auth state changed:', event)
    }

    switch (event) {
      case 'SIGNED_IN':
        setSession(session)
        if (session?.user) {
          setUser(session.user)
          const userRole = await authHelpers.getUserRole(session.user.id)
          setRole(userRole)
          await loadPermissions(userRole)
        }
        break

      case 'SIGNED_OUT':
        setUser(null)
        setSession(null)
        setRole(UserRoles.GUEST)
        setPermissions([])
        if (navigate) {
          navigate('/login')
        }
        break

      case 'TOKEN_REFRESHED':
        setSession(session)
        break

      case 'USER_UPDATED':
        if (session?.user) {
          setUser(session.user)
        }
        break

      default:
        break
    }
  }

  // Load permissions for role
  const loadPermissions = async (userRole) => {
    try {
      // Define permissions based on role
      const rolePermissions = {
        [UserRoles.ADMIN]: [
          'view_all_content',
          'edit_all_content',
          'delete_all_content',
          'manage_users',
          'view_audit_logs',
          'manage_settings',
          'export_data',
          'import_data',
        ],
        [UserRoles.INSTRUCTOR]: [
          'view_all_content',
          'edit_own_content',
          'create_content',
          'view_student_progress',
          'grade_exams',
          'manage_groups',
          'export_data',
        ],
        [UserRoles.STUDENT]: [
          'view_content',
          'take_exams',
          'view_own_progress',
          'join_groups',
          'create_notes',
          'export_own_data',
        ],
        [UserRoles.GUEST]: ['view_public_content'],
      }

      setPermissions(rolePermissions[userRole] || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Load permissions error:', error)
      }
    }
  }

  // Sign up
  const signUp = useCallback(
    async (email, password, profile) => {
      setLoading(true)
      setAuthError(null)

      try {
        const result = await authService.register(email, password, profile)

        if (result.user) {
          toast.success('Registration successful! Please check your email to verify your account.')
          navigate('/verify-email')
        }

        return result
      } catch (error) {
        setAuthError(error.message)
        toast.error(error.message || 'Registration failed')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [navigate]
  )

  // Sign in
  const signIn = useCallback(
    async (email, password) => {
      setLoading(true)
      setAuthError(null)

      try {
        const result = await authService.signIn(email, password)

        if (result.user) {
          setUser(result.user)
          setSession(result.session)
          setRole(result.role)
          await loadPermissions(result.role)

          toast.success('Welcome back!')
          navigate('/')
        }

        return result
      } catch (error) {
        setAuthError(error.message)

        // Handle specific errors
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in')
        } else if (error.message === 'account_locked') {
          const remainingTime = authService.getLockoutRemainingTime(email)
          toast.error(`Account locked. Try again in ${Math.ceil(remainingTime / 60)} minutes`)
        } else {
          toast.error(error.message || 'Sign in failed')
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [navigate]
  )

  // Sign in with OAuth
  const _signInWithOAuth = useCallback(async (provider) => {
    setLoading(true)
    setAuthError(null)

    try {
      await authService.signInWithOAuth(provider)
      // OAuth will redirect, so no need to handle success here
    } catch (error) {
      setAuthError(error.message)
      toast.error(`${provider} sign in failed`)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true)

    try {
      await authService.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Sign out error:', error)
      }
      toast.error('Sign out failed')
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setLoading(true)
    setAuthError(null)

    try {
      await authService.resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
      return true
    } catch (error) {
      setAuthError(error.message)
      toast.error('Password reset failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Update password
  const _updatePassword = useCallback(async (newPassword) => {
    setLoading(true)
    setAuthError(null)

    try {
      await authService.updatePassword(newPassword)
      toast.success('Password updated successfully')
      return true
    } catch (error) {
      setAuthError(error.message)
      toast.error(error.message || 'Password update failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Check permission
  const hasPermission = useCallback(
    (permission) => {
      return permissions.includes(permission)
    },
    [permissions]
  )

  // Check role
  const hasRole = useCallback(
    (requiredRole) => {
      const roleHierarchy = {
        [UserRoles.ADMIN]: 4,
        [UserRoles.INSTRUCTOR]: 3,
        [UserRoles.STUDENT]: 2,
        [UserRoles.GUEST]: 1,
      }

      return roleHierarchy[role] >= roleHierarchy[requiredRole]
    },
    [role]
  )

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) {
        throw error
      }

      setUser(data.user)
      toast.success('Profile updated successfully')

      await auditLogger.log({
        action: 'USER_UPDATED',
        userId: data.user.id,
        details: { updates },
      })

      return data.user
    } catch (error) {
      toast.error('Profile update failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Context value
  const value: AuthContextType = {
    // State
    user,
    session,
    role,
    permissions,
    loading,
    authError,
    isAuthenticated: !!user,

    // Methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasPermission,
    hasRole,
    refreshSession: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession()
        if (error) {
          throw error
        }
        if (data.session) {
          setSession(data.session)
        }
      } catch (error) {
        logger.error('Failed to refresh session:', error)
        setAuthError('Session refresh failed')
      }
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// HOC for protected components
export const withAuth = (Component, requiredRole = null) => {
  const WrappedComponent = (props) => {
    const { isAuthenticated, role, loading, hasRole } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        navigate('/login')
      } else if (!loading && requiredRole && hasRole && !hasRole(requiredRole)) {
        navigate('/unauthorized')
      }
    }, [isAuthenticated, role, loading, navigate, hasRole])

    if (loading) {
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return null
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

export default AuthContext
