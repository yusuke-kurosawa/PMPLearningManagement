import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Github, Chrome } from 'lucide-react'
import { motion } from 'framer-motion'
import { logger } from '../../services/logger'
// import toast from 'react-hot-toast' // TODO: Implement toast notifications

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    signIn,
    signInWithOAuth,
    isAuthenticated,
    loading: authLoading,
    authError,
    clearError,
  } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      if (clearError) {clearError()}
    }
  }, [clearError])

  // Validate form
  const validateForm: React.FC = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signIn(formData.email, formData.password)

      // Remember me functionality
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Login error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle OAuth login
  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`${provider} login error:`, error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail')
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }))
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Lock className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue your PMP learning journey
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div className="text-sm text-red-700">{authError}</div>
            </motion.div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full appearance-none border py-2 pl-10 pr-3 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg transition duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full appearance-none border py-2 pl-10 pr-10 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg transition duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 transition duration-150 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition duration-150 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading || authLoading}
                className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Chrome className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading || authLoading}
                className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Github className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('microsoft')}
                disabled={loading || authLoading}
                className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 11.4H2.6V2.6h8.8v8.8zm10 0h-8.8V2.6h8.8v8.8zM11.4 21.4H2.6v-8.8h8.8v8.8zm10 0h-8.8v-8.8h8.8v8.8z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 transition duration-150 hover:text-blue-500"
              >
                Sign up
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
