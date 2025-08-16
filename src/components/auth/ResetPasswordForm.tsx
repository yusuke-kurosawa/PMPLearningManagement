import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation } from '../../lib/auth/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

// Form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((password) => authValidation.isValidPassword(password).isValid, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updatePassword, loading, error, clearError } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)

  // Check if we have the required parameters for password reset
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const watchPassword = watch('password')

  // Update password strength when password changes
  useEffect(() => {
    if (watchPassword) {
      const strength = authValidation.getPasswordStrength(watchPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [watchPassword])

  // Validate the reset token on component mount
  useEffect(() => {
    if (!accessToken || !refreshToken || type !== 'recovery') {
      setIsValidToken(false)
    }
  }, [accessToken, refreshToken, type])

  const onSubmit = async (data) => {
    try {
      clearError()
      clearErrors()

      // Update the password
      await updatePassword(data.password)
      setIsPasswordReset(true)
    } catch (error) {
      if (error.message?.includes('Password should be at least')) {
        setError('password', {
          type: 'manual',
          message: 'Password is too weak. Please choose a stronger password.',
        })
      } else if (error.message?.includes('Token expired')) {
        setError('root', {
          type: 'manual',
          message: 'The reset link has expired. Please request a new password reset.',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Failed to reset password. Please try again.',
        })
      }
    }
  }

  const handleInputChange: React.FC = () => {
    if (error || errors.root) {
      clearError()
      clearErrors()
    }
  }

  const getPasswordStrengthColor: React.FC = () => {
    if (passwordStrength < 30) {return 'bg-red-500'}
    if (passwordStrength < 60) {return 'bg-yellow-500'}
    if (passwordStrength < 80) {return 'bg-blue-500'}
    return 'bg-green-500'
  }

  const getPasswordStrengthText: React.FC = () => {
    if (passwordStrength < 30) {return 'Weak'}
    if (passwordStrength < 60) {return 'Fair'}
    if (passwordStrength < 80) {return 'Good'}
    return 'Strong'
  }

  // Show success message after password is reset
  if (isPasswordReset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="mx-auto w-full max-w-md p-6">
          <div className="text-center">
            <div className="mb-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Password Reset Successfully!
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Your password has been updated. You can now sign in with your new password.
            </p>

            <Button onClick={() => navigate('/#/auth?mode=login')} className="w-full">
              Continue to Sign In
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Show error message if token is invalid
  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="mx-auto w-full max-w-md p-6">
          <div className="text-center">
            <div className="mb-4">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Invalid Reset Link
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired. Please request a new password
              reset.
            </p>

            <div className="space-y-3">
              <Button onClick={() => navigate('/#/auth?mode=forgot-password')} className="w-full">
                Request New Reset Link
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/#/auth?mode=login')}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="mx-auto w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Global error message */}
          {(error || errors.root) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error || errors.root?.message}
              </p>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                {...register('password')}
                onChange={(e) => {
                  register('password').onChange(e)
                  handleInputChange()
                }}
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {watchPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span
                    className={`text-xs font-medium ${passwordStrength >= 60 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword')}
                onChange={(e) => {
                  register('confirmPassword').onChange(e)
                  handleInputChange()
                }}
                disabled={loading || isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading || isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>

        {/* Password requirements */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password Requirements:
          </h3>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>• At least 8 characters long</li>
            <li>• Contains at least one uppercase letter</li>
            <li>• Contains at least one lowercase letter</li>
            <li>• Contains at least one number</li>
            <li>• Special characters are recommended</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default ResetPasswordForm
