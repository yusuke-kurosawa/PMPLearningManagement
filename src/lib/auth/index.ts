/**
 * Authentication Module Exports
 * Centralized exports for authentication-related functionality
 */

// Main exports from supabase.ts
export {
  supabase,
  supabase as default,
  authHelpers,
  sessionManager,
  checkRolePermission,
  setupAuthListeners,
  authValidation,
} from './supabase'

// Re-export ROLES and PERMISSIONS from their dedicated constants file
// This prevents circular dependency and tree-shaking issues
export { ROLES, PERMISSIONS } from '../../constants/roles'
