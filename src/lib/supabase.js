import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration is missing. Authentication features will not work.')
}

// Create Supabase client with enhanced security options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for enhanced security
    storage: {
      getItem: (key) => {
        // Implement secure storage with encryption
        const item = localStorage.getItem(key)
        if (item) {
          try {
            // Add decryption logic here if needed
            return JSON.parse(item)
          } catch {
            return item
          }
        }
        return null
      },
      setItem: (key, value) => {
        // Implement secure storage with encryption
        const valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
        // Add encryption logic here if needed
        localStorage.setItem(key, valueToStore)
      },
      removeItem: (key) => {
        localStorage.removeItem(key)
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'pmp-learning-management',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Auth helper functions
export const authHelpers = {
  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get current session
  getCurrentSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Refresh session
  refreshSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession()
    if (error) throw error
    return session
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const user = await authHelpers.getCurrentUser()
      return !!user
    } catch {
      return false
    }
  },

  // Get user role
  getUserRole: async (userId) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return 'guest'
    }

    return data?.role || 'student'
  },

  // Check permission
  hasPermission: async (userId, permission) => {
    const { data, error } = await supabase.rpc('check_permission', {
      user_id: userId,
      permission_name: permission,
    })

    if (error) {
      console.error('Error checking permission:', error)
      return false
    }

    return data
  },
}

// Session management
export const sessionManager = {
  // Start session monitoring
  startSessionMonitoring: (callback) => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (callback) callback(event, session)

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in')
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          // Clear any cached data
          localStorage.removeItem('user_profile')
          localStorage.removeItem('user_role')
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User updated')
          break
        default:
          break
      }
    })

    return authListener
  },

  // Stop session monitoring
  stopSessionMonitoring: (subscription) => {
    if (subscription) {
      subscription.unsubscribe()
    }
  },

  // Check session expiry
  isSessionExpired: async () => {
    try {
      const session = await authHelpers.getCurrentSession()
      if (!session) return true

      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)

      return now >= expiresAt
    } catch {
      return true
    }
  },

  // Auto refresh token before expiry
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

export default supabase
