import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '../../services/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    logger.error('ErrorBoundary caught an error:', error, {
      componentStack: errorInfo.componentStack,
    })

    this.setState({
      error,
      errorInfo,
    })

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service like Sentry
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800'>
          <div className='w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800 md:p-12'>
            {/* Error Icon */}
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-red-100 p-4 dark:bg-red-900/20'>
                <AlertTriangle className='h-16 w-16 text-red-600 dark:text-red-400' />
              </div>
            </div>

            {/* Error Title */}
            <h1 className='mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white'>
              予期しないエラーが発生しました
            </h1>

            {/* Error Description */}
            <p className='mb-8 text-center text-gray-600 dark:text-gray-300'>
              申し訳ございません。アプリケーションの実行中に問題が発生しました。
              <br />
              以下のボタンから操作を選択してください。
            </p>

            {/* Action Buttons */}
            <div className='mb-8 flex flex-col justify-center gap-4 sm:flex-row'>
              <button
                onClick={this.handleReset}
                className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700'
              >
                <RefreshCw className='h-5 w-5' />
                再試行
              </button>

              <button
                onClick={this.handleGoHome}
                className='flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-gray-700'
              >
                <Home className='h-5 w-5' />
                ホームに戻る
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-8 rounded-lg bg-gray-100 p-6 dark:bg-gray-700'>
                <summary className='mb-4 cursor-pointer font-semibold text-gray-900 dark:text-white'>
                  エラー詳細（開発モードのみ表示）
                </summary>

                <div className='space-y-4'>
                  {/* Error Message */}
                  <div>
                    <h3 className='mb-2 font-semibold text-red-600 dark:text-red-400'>
                      エラーメッセージ:
                    </h3>
                    <pre className='overflow-auto rounded bg-white p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div>
                      <h3 className='mb-2 font-semibold text-red-600 dark:text-red-400'>
                        スタックトレース:
                      </h3>
                      <pre className='overflow-auto rounded bg-white p-4 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className='mb-2 font-semibold text-red-600 dark:text-red-400'>
                        コンポーネントスタック:
                      </h3>
                      <pre className='overflow-auto rounded bg-white p-4 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Information */}
            <div className='mt-8 border-t border-gray-200 pt-8 dark:border-gray-700'>
              <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
                問題が解決しない場合は、ブラウザのキャッシュをクリアするか、
                <br />
                開発チームにお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
