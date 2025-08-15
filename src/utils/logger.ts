// import { logger } from '../services/logger'

/**
 * Logger Utility
 * Provides environment-aware logging with structured output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      logger.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.isTest) {
      logger.info(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.isTest) {
      logger.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const fullMessage = error ? `${message}: ${errorMessage}` : message

    if (!this.isTest) {
      logger.error(this.formatMessage('error', fullMessage, context))

      if (error instanceof Error && error.stack && this.isDevelopment) {
        logger.error(error.stack)
      }
    }

    // In production, you might want to send errors to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }

  /**
   * Log with a specific condition
   */
  logIf(condition: boolean, level: LogLevel, message: string, context?: LogContext): void {
    if (condition) {
      this[level](message, context)
    }
  }

  /**
   * Create a child logger with a specific context
   */
  child(defaultContext: LogContext): Logger {
    return {
      isDevelopment: this.isDevelopment,
      isTest: this.isTest,
      formatMessage: this.formatMessage.bind(this),
      debug: (message: string, context?: LogContext) => {
        this.debug(message, { ...defaultContext, ...context })
      },
      info: (message: string, context?: LogContext) => {
        this.info(message, { ...defaultContext, ...context })
      },
      warn: (message: string, context?: LogContext) => {
        this.warn(message, { ...defaultContext, ...context })
      },
      error: (message: string, error?: Error | unknown, context?: LogContext) => {
        this.error(message, error, { ...defaultContext, ...context })
      },
      logIf: this.logIf.bind(this),
      child: this.child.bind(this),
    } as Logger
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for use in other modules
export default logger
