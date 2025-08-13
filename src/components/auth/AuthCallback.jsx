import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/auth/supabase'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, user } = useAuth()

  const [status, setStatus] = useState('processing') // 'processing', 'success', 'error'
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Handle OAuth errors
        if (error) {
          setStatus('error')
          setError(errorDescription || error)
          setMessage('Authentication failed. Please try again.')
          return
        }

        // Handle different callback types
        switch (type) {
          case 'signup':
            // Email confirmation callback
            if (accessToken && refreshToken) {
              const { data: _data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })

              if (sessionError) {
                throw sessionError
              }

              setStatus('success')
              setMessage('Email confirmed successfully! You can now access your account.')

              // Redirect to dashboard after a short delay
              setTimeout(() => {
                navigate('/')
              }, 2000)
            } else {
              setStatus('success')
              setMessage('Email confirmed! Please sign in to continue.')

              setTimeout(() => {
                navigate('/#/auth?mode=login')
              }, 2000)
            }
            break

          case 'recovery':
            // Password reset callback
            if (accessToken && refreshToken) {
              // Set the session so the user can reset their password
              const { data: _data2, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })

              if (sessionError) {
                throw sessionError
              }

              // Redirect to reset password form
              navigate(
                `/#/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=recovery`
              )
            } else {
              throw new Error('Invalid password reset link')
            }
            break

          default: {
            // OAuth callback (Google, GitHub, etc.)
            const { data, error: authError } = await supabase.auth.getSession()

            if (authError) {
              throw authError
            }

            if (data.session) {
              setStatus('success')
              setMessage('Successfully authenticated! Redirecting to dashboard...')

              // Get return URL from session storage or default to home
              const returnTo = sessionStorage.getItem('auth_return_to') || '/'
              sessionStorage.removeItem('auth_return_to')

              setTimeout(() => {
                navigate(returnTo)
              }, 1000)
            } else {
              setStatus('success')
              setMessage('Authentication completed! Please sign in to continue.')

              setTimeout(() => {
                navigate('/#/auth?mode=login')
              }, 2000)
            }
            break
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setError(error.message)
        setMessage('Authentication failed. Please try again.')
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams])

  // If already authenticated and this is just a callback, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user && status === 'processing') {
      const returnTo = sessionStorage.getItem('auth_return_to') || '/'
      sessionStorage.removeItem('auth_return_to')
      navigate(returnTo)
    }
  }, [isAuthenticated, user, status, navigate])

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="text-center">
            <div className="mb-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Success!</h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            <div className="flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-4">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{message}</p>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={() => navigate('/#/auth?mode=login')} className="w-full">
                Back to Sign In
              </Button>

              <button
                onClick={() => window.location.reload()}
                className="w-full text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )

      case 'processing':
      default:
        return (
          <div className="text-center">
            <div className="mb-4">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Processing...</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we complete your authentication.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="mx-auto w-full max-w-md p-6">{renderContent()}</Card>
    </div>
  )
}

export default AuthCallback
