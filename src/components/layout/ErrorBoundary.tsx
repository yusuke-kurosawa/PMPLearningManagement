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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
                <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              予期しないエラーが発生しました
            </h1>

            {/* Error Description */}
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              申し訳ございません。アプリケーションの実行中に問題が発生しました。
              <br />
              以下のボタンから操作を選択してください。
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                再試行
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                <Home className="w-5 h-5" />
                ホームに戻る
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white mb-4">
                  エラー詳細（開発モードのみ表示）
                </summary>

                <div className="space-y-4">
                  {/* Error Message */}
                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                      エラーメッセージ:
                    </h3>
                    <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-auto text-sm text-gray-800 dark:text-gray-200">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error.stack && (
                    <div>
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        スタックトレース:
                      </h3>
                      <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-auto text-xs text-gray-800 dark:text-gray-200">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        コンポーネントスタック:
                      </h3>
                      <pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-auto text-xs text-gray-800 dark:text-gray-200">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Information */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
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