/**
 * Visualization Error Boundary
 * @description Error boundary specifically designed for visualization components
 * Provides fallback UI and error logging for D3.js and chart components
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { logger } from '../../utils/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary for Visualization Components
 *
 * Catches errors in D3 visualizations, charts, and complex UI components
 * Provides a user-friendly fallback interface with retry functionality
 */
class VisualizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName } = this.props

    // Log the error to our logging service
    logger.error(
      `Error in visualization component${componentName ? `: ${componentName}` : ''}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        componentName,
        errorMessage: error.message,
        errorStack: error.stack,
      }
    )

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  handleReset = () => {
    const { onReset } = this.props

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Call custom reset handler if provided
    if (onReset) {
      onReset()
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, componentName } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <Card className="mx-auto my-8 max-w-2xl border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-6 w-6" />
              Visualization Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-white p-4">
              <h3 className="mb-2 font-semibold text-gray-900">
                {componentName
                  ? `An error occurred in ${componentName}`
                  : 'An error occurred while rendering the visualization'}
              </h3>
              {process.env.NODE_ENV === 'development' && error && (
                <div className="mt-4 space-y-2">
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-700">Error Details</summary>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-red-800">
                      {error.toString()}
                    </pre>
                  </details>
                  {errorInfo && (
                    <details className="cursor-pointer">
                      <summary className="font-medium text-gray-700">Component Stack</summary>
                      <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-700">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-2 font-semibold text-yellow-900">Troubleshooting Tips:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
                <li>Try refreshing the visualization using the button below</li>
                <li>Check your browser console for additional error information</li>
                <li>Ensure your browser supports modern JavaScript features</li>
                <li>Try clearing your browser cache and reloading the page</li>
                <li>If the problem persists, please report this issue</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={this.handleReset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Visualization
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'production' && (
              <p className="text-sm text-gray-600">
                Error ID: {Date.now().toString(36)}
                <span className="ml-2 text-xs text-gray-500">
                  (Include this when reporting the issue)
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )
    }

    return children
  }
}

export default VisualizationErrorBoundary

/**
 * Hook-based wrapper for functional components
 */
export const useVisualizationErrorBoundary = (componentName?: string) => {
  const [hasError, setHasError] = React.useState(false)

  const resetError = React.useCallback(() => {
    setHasError(false)
  }, [])

  return {
    hasError,
    setHasError,
    resetError,
    ErrorBoundary: ({ children }: { children: ReactNode }) => (
      <VisualizationErrorBoundary componentName={componentName} onReset={resetError}>
        {children}
      </VisualizationErrorBoundary>
    ),
  }
}