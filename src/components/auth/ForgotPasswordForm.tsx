import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation } from '../../lib/auth/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => authValidation.isValidEmail(email), {
      message: 'Please enter a valid email address',
    }),
})

const ForgotPasswordForm: React.FC<{ onBackToLogin }> = ({ onBackToLogin }) => {
  const { resetPassword, loading, error, clearError } = useAuth()
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      clearError()
      clearErrors()

      await resetPassword(data.email)
      setUserEmail(data.email)
      setIsEmailSent(true)
    } catch (error) {
      // Handle specific validation errors
      if (error.message?.includes('User not found')) {
        setError('email', {
          type: 'manual',
          message: 'No account found with this email address. Please check and try again.',
        })
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setError('root', {
          type: 'manual',
          message:
            'Too many password reset attempts. Please wait a few minutes before trying again.',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Failed to send password reset email. Please try again.',
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

  // Show success message after email is sent
  if (isEmailSent) {
    return (
      <Card className="mx-auto w-full max-w-md p-6">
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Check Your Email
          </h2>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-gray-900 dark:text-white">{userEmail}</span>. Click
            the link in your email to reset your password.
          </p>

          <div className="space-y-3">
            <Button onClick={onBackToLogin} className="w-full">
              Back to Sign In
            </Button>

            <button
              onClick={() => setIsEmailSent(false)}
              className="w-full text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Didn&apos;t receive the email? Try again
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> The reset link will expire in 1 hour for security reasons. If
              you don&apos;t see the email, check your spam folder.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
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

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
              onChange={(e) => {
                register('email').onChange(e)
                handleInputChange()
              }}
              disabled={loading || isSubmitting}
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
          {loading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset email...
            </>
          ) : (
            'Send Reset Email'
          )}
        </Button>
      </form>

      {/* Additional help */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Having trouble?</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li>• Make sure you enter the email address associated with your account</li>
          <li>• Check your spam or junk folder if you don&apos;t receive the email</li>
          <li>• The reset link expires in 1 hour for security</li>
          <li>• Contact support if you continue to have issues</li>
        </ul>
      </div>
    </Card>
  )
}

export default ForgotPasswordForm
