import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, Lock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
  redirectTo = '/login',
  fallback = null,
}) => {
  const location = useLocation()
  const { isAuthenticated, loading, role: _role, hasRole, hasPermission } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  // Check authentication
  if (!isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4"
        >
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mb-6 text-gray-600">
              You don&apos;t have permission to access this page. Required role: {requiredRole}
            </p>
            <button
              onClick={() => window.history.back()}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-150 hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4"
        >
          <div className="rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Insufficient Permissions</h2>
            <p className="mb-6 text-gray-600">
              You need additional permissions to access this feature.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-150 hover:bg-blue-700"
              >
                Go Back
              </button>
              <button
                onClick={() => (window.location.href = '/profile/permissions')}
                className="w-full rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition duration-150 hover:bg-gray-300"
              >
                Request Access
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // All checks passed, render children
  return children
}

// HOC for easier usage
export const withProtectedRoute = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Role-specific route components
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
)

export const InstructorRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="instructor" {...props}>
    {children}
  </ProtectedRoute>
)

export const StudentRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="student" {...props}>
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute
