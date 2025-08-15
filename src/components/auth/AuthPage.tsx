import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { Button } from '../ui/button'
import { ArrowLeft, Github } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '../../services/logger'

const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, signInWithOAuth, loading } = useAuth()

  // Get mode from URL params, default to 'login'
  const mode = searchParams.get('mode') || 'login'
  const [currentMode, setCurrentMode] = useState(mode)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams.get('returnTo') || '/'
      navigate(returnTo)
    }
  }, [isAuthenticated, navigate, searchParams])

  // Update URL when mode changes
  const handleModeChange = (newMode) => {
    setCurrentMode(newMode)
    setSearchParams({ mode: newMode })
  }

  const handleOAuthSignIn = async (provider) => {
    try {
      await signInWithOAuth(provider)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('OAuth sign in error:', error)
      }
    }
  }

  const renderAuthForm: React.FC = () => {
    switch (currentMode) {
      case 'register':
        return <RegisterForm onToggleMode={() => handleModeChange('login')} />
      case 'forgot-password':
        return <ForgotPasswordForm onBackToLogin={() => handleModeChange('login')} />
      case 'login':
      default:
        return (
          <LoginForm
            onToggleMode={() => handleModeChange('register')}
            onForgotPassword={() => handleModeChange('forgot-password')}
          />
        )
    }
  }

  const _getPageTitle: React.FC = () => {
    switch (currentMode) {
      case 'register':
        return 'Create Your Account'
      case 'forgot-password':
        return 'Reset Password'
      case 'login':
      default:
        return 'Welcome Back'
    }
  }

  if (isAuthenticated) {
    return null // Will redirect above
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md">
        {/* Back button for non-login modes */}
        {currentMode !== 'login' && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => handleModeChange('login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </motion.button>
        )}

        {/* Main form container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderAuthForm()}
          </motion.div>
        </AnimatePresence>

        {/* OAuth providers - only show for login and register */}
        {(currentMode === 'login' || currentMode === 'register') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="w-full"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
                className="w-full"
              >
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#/terms" className="text-primary underline hover:text-primary/80">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#/privacy" className="text-primary underline hover:text-primary/80">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage
