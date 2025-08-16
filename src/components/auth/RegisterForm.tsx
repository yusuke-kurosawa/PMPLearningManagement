import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation, ROLES } from '../../lib/auth/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'

// Form validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .refine((email) => authValidation.isValidEmail(email), {
        message: 'Please enter a valid email address',
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((password) => authValidation.isValidPassword(password).isValid, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum([ROLES.STUDENT, ROLES.INSTRUCTOR], {
      required_error: 'Please select a role',
    }),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const RegisterForm: React.FC<{ onToggleMode }> = ({ onToggleMode }) => {
  const { signUp, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isRegistered, setIsRegistered] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ROLES.STUDENT,
      agreedToTerms: false,
    },
    mode: 'onChange',
  })

  const watchPassword = watch('password')

  // Update password strength when password changes
  React.useEffect(() => {
    if (watchPassword) {
      const strength = authValidation.getPasswordStrength(watchPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [watchPassword])

  const onSubmit = async (data) => {
    try {
      clearError()
      clearErrors()

      const result = await signUp({
        email: data.email,
        password: data.password,
        userData: {
          name: data.name,
          full_name: data.name,
          role: data.role,
        },
      })

      if (result.requiresConfirmation) {
        setIsRegistered(true)
      }
      // If no confirmation required, user will be automatically signed in
    } catch (error) {
      // Handle specific validation errors
      if (error.message?.includes('User already registered')) {
        setError('email', {
          type: 'manual',
          message: 'An account with this email already exists. Try signing in instead.',
        })
      } else if (error.message?.includes('Password should be at least')) {
        setError('password', {
          type: 'manual',
          message: 'Password is too weak. Please choose a stronger password.',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Failed to create account. Please try again.',
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

  // Show success message after registration
  if (isRegistered) {
    return (
      <Card className="mx-auto w-full max-w-md p-6">
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Account Created!
          </h2>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            We&apos;ve sent a confirmation email to your inbox. Please click the link in the email
            to verify your account before signing in.
          </p>
          <Button onClick={onToggleMode} className="w-full">
            Go to Sign In
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start your PMP learning journey
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

        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
              {...register('name')}
              onChange={(e) => {
                register('name').onChange(e)
                handleInputChange()
              }}
              disabled={loading || isSubmitting}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

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
              placeholder="Enter your email"
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
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Role selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">I am a</Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="role-student"
                type="radio"
                value={ROLES.STUDENT}
                {...register('role')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                disabled={loading || isSubmitting}
              />
              <Label htmlFor="role-student" className="ml-2 text-sm">
                Student - Learning PMP concepts
              </Label>
            </div>
            <div className="flex items-center">
              <input
                id="role-instructor"
                type="radio"
                value={ROLES.INSTRUCTOR}
                {...register('role')}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                disabled={loading || isSubmitting}
              />
              <Label htmlFor="role-instructor" className="ml-2 text-sm">
                Instructor - Teaching PMP concepts
              </Label>
            </div>
          </div>
          {errors.role && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
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
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
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

        {/* Terms and conditions */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="agreedToTerms"
              type="checkbox"
              {...register('agreedToTerms')}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={loading || isSubmitting}
            />
            <Label
              htmlFor="agreedToTerms"
              className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            >
              I agree to the{' '}
              <a href="#/terms" className="text-primary underline hover:text-primary/80">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#/privacy" className="text-primary underline hover:text-primary/80">
                Privacy Policy
              </a>
            </Label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.agreedToTerms.message}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
          {loading || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onToggleMode}
            className="font-medium text-primary hover:text-primary/80"
            disabled={loading || isSubmitting}
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}

export default RegisterForm
