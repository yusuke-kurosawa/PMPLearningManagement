import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation } from '../../lib/auth/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => authValidation.isValidEmail(email), {
      message: 'Please enter a valid email address',
    }),
  password: z.string().min(1, 'Password is required'),
})

const LoginForm = ({ onToggleMode, onForgotPassword }) => {
  const { signIn, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('pmp-remembered-email') || '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      clearError()
      clearErrors()

      await signIn({
        email: data.email,
        password: data.password,
      })

      // Remember email if checkbox is checked
      if (rememberMe) {
        localStorage.setItem('pmp-remembered-email', data.email)
      } else {
        localStorage.removeItem('pmp-remembered-email')
      }
    } catch (error) {
      // Handle specific validation errors
      if (error.message?.includes('Invalid login credentials')) {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password. Please check your credentials and try again.',
        })
      } else if (error.message?.includes('Email not confirmed')) {
        setError('root', {
          type: 'manual',
          message: 'Please check your email and click the confirmation link before signing in.',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Failed to sign in. Please try again.',
        })
      }
    }
  }

  const handleInputChange = () => {
    if (error || errors.root) {
      clearError()
      clearErrors()
    }
  }

  return (
    <Card className='mx-auto w-full max-w-md p-6'>
      <div className='mb-6 text-center'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Welcome Back</h2>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
          Sign in to your PMP Learning account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Global error message */}
        {(error || errors.root) && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
            <p className='text-sm text-red-600 dark:text-red-400'>
              {error || errors.root?.message}
            </p>
          </div>
        )}

        {/* Email field */}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-sm font-medium'>
            Email Address
          </Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
              onChange={(e) => {
                register('email').onChange(e)
                handleInputChange()
              }}
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.email && (
            <p className='text-sm text-red-600 dark:text-red-400'>{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className='space-y-2'>
          <Label htmlFor='password' className='text-sm font-medium'>
            Password
          </Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your password'
              className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              {...register('password')}
              onChange={(e) => {
                register('password').onChange(e)
                handleInputChange()
              }}
              disabled={loading || isSubmitting}
            />
            <button
              type='button'
              className='absolute right-3 top-3 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || isSubmitting}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </button>
          </div>
          {errors.password && (
            <p className='text-sm text-red-600 dark:text-red-400'>{errors.password.message}</p>
          )}
        </div>

        {/* Remember me and forgot password */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              id='remember-me'
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              disabled={loading || isSubmitting}
            />
            <Label htmlFor='remember-me' className='ml-2 text-sm text-gray-600 dark:text-gray-400'>
              Remember me
            </Label>
          </div>
          <button
            type='button'
            onClick={onForgotPassword}
            className='text-sm font-medium text-primary hover:text-primary/80'
            disabled={loading || isSubmitting}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit button */}
        <Button type='submit' className='w-full' disabled={loading || isSubmitting}>
          {loading || isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Sign up link */}
      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Don&apos;t have an account?{' '}
          <button
            onClick={onToggleMode}
            className='font-medium text-primary hover:text-primary/80'
            disabled={loading || isSubmitting}
          >
            Sign up for free
          </button>
        </p>
      </div>
    </Card>
  )
}

export default LoginForm
