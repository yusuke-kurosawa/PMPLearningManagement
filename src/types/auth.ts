/**
 * Authentication Type Definitions
 * Centralizes all authentication-related types for the application
 */

import { ReactNode } from 'react'

// User roles type definition
export type UserRole = 'admin' | 'instructor' | 'student' | 'guest'

// User permissions type definition
export type UserPermission =
  | 'view_content'
  | 'take_exams'
  | 'view_progress'
  | 'export_data'
  | 'create_study_groups'
  | 'participate_discussions'
  | 'share_notes'
  | 'manage_users'
  | 'manage_content'
  | 'view_analytics'
  | 'manage_system'
  | 'create_exams'
  | 'grade_exams'
  | 'manage_courses'

// User profile interface
export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

// Auth state interface
export interface AuthState {
  user: UserProfile | null
  session: unknown | null
  loading: boolean
  error: string | null
}

// Auth context type
export interface AuthContextType {
  user: UserProfile | null
  session: unknown | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  hasPermission: (permission: UserPermission) => boolean
  hasRole: (role: UserRole) => boolean
}

// Protected route props
export interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  roles?: UserRole[]
  permissions?: UserPermission[]
  fallback?: ReactNode
}

// Sign in form data
export interface SignInFormData {
  email: string
  password: string
  rememberMe?: boolean
}

// Sign up form data
export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  name?: string
  acceptTerms: boolean
}

// Password reset form data
export interface PasswordResetFormData {
  email: string
}

// Auth validation result
export interface AuthValidationResult {
  isValid: boolean
  requirements: {
    minLength: boolean
    hasLowercase: boolean
    hasUppercase: boolean
    hasNumber: boolean
  }
}

// OAuth providers
export type OAuthProvider = 'google' | 'github' | 'discord'

// Auth error types
export type AuthErrorType =
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'network_error'
  | 'unknown_error'

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: string
}
