import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logger } from '../../services/logger'
import {
  User,
  Mail,
  Shield,
  Camera,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authValidation, ROLES } from '../../lib/auth/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import ProtectedRoute from './ProtectedRoute'

// Profile form validation schema
const profileSchema = z.object({
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
})

// Password change form validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((password) => authValidation.isValidPassword(password).isValid, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const UserProfile = () => {
  const { user, role, updateProfile, updatePassword, loading, error, clearError } = useAuth()

  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.user_metadata?.name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
    },
  })

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const watchNewPassword = passwordForm.watch('newPassword')

  // Update password strength when new password changes
  React.useEffect(() => {
    if (watchNewPassword) {
      const strength = authValidation.getPasswordStrength(watchNewPassword)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [watchNewPassword])

  const onProfileSubmit = async (data) => {
    try {
      clearError()
      setSuccessMessage('')

      await updateProfile({
        name: data.name,
        full_name: data.name,
      })

      setSuccessMessage('Profile updated successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Profile update error:', error)
      }
    }
  }

  const onPasswordSubmit = async (data) => {
    try {
      clearError()
      setSuccessMessage('')

      // Note: In a real implementation, you would verify the current password
      // This is a limitation of Supabase client-side SDK
      await updatePassword(data.newPassword)

      setSuccessMessage('Password updated successfully!')
      passwordForm.reset()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Password update error:', error)
      }
    }
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert('File size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'bg-red-500'
    if (passwordStrength < 60) return 'bg-yellow-500'
    if (passwordStrength < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak'
    if (passwordStrength < 60) return 'Fair'
    if (passwordStrength < 80) return 'Good'
    return 'Strong'
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.INSTRUCTOR]: 'Instructor',
      [ROLES.STUDENT]: 'Student',
      [ROLES.GUEST]: 'Guest',
    }
    return roleNames[role] || role
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-center rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      {avatarPreview || user?.user_metadata?.avatar_url ? (
                        <img
                          src={avatarPreview || user?.user_metadata?.avatar_url}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Profile Picture
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a new profile picture. Max size: 5MB
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
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
                        className={`pl-10 ${profileForm.formState.errors.name ? 'border-red-500' : ''}`}
                        {...profileForm.register('name')}
                        disabled={loading}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email field (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        className="bg-gray-50 pl-10 dark:bg-gray-800"
                        {...profileForm.register('email')}
                        disabled={true}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email address cannot be changed. Contact support if you need to update it.
                    </p>
                  </div>

                  {/* Role (read-only) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        className="bg-gray-50 pl-10 dark:bg-gray-800"
                        value={getRoleDisplayName(role)}
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        className={`pl-10 pr-10 ${passwordForm.formState.errors.currentPassword ? 'border-red-500' : ''}`}
                        {...passwordForm.register('currentPassword')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={loading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        className={`pl-10 pr-10 ${passwordForm.formState.errors.newPassword ? 'border-red-500' : ''}`}
                        {...passwordForm.register('newPassword')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={loading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {watchNewPassword && (
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

                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
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
                        className={`pl-10 pr-10 ${passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                        {...passwordForm.register('confirmPassword')}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Account Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Additional settings and account information
                  </p>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account Created
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Sign In
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Confirmed
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user?.email_confirmed_at ? 'Yes' : 'No'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        User ID
                      </Label>
                      <p className="break-all font-mono text-sm text-gray-600 dark:text-gray-400">
                        {user?.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placeholder for future settings */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    More settings will be available here in the future.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

export default UserProfile
