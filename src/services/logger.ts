/**
 * Logger Service
 * Centralized logging service for production-ready logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  log(message: string, context?: LogContext): void {
    this.info(message, context)
  }

  warn(message: string, context?: LogContext): void {
    if (!this.isTest) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const fullMessage = error ? `${message}: ${errorMessage}` : message
    
    if (!this.isTest) {
      console.error(this.formatMessage('error', fullMessage, context))
      
      if (error instanceof Error && error.stack && this.isDevelopment) {
        console.error(error.stack)
      }
    }

    // In production, send errors to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service like Sentry
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
  child(defaultContext: LogContext): LoggerService {
    const parentLogger = this
    return {
      isDevelopment: this.isDevelopment,
      isTest: this.isTest,
      formatMessage: this.formatMessage.bind(this),
      debug(message: string, context?: LogContext) {
        parentLogger.debug(message, { ...defaultContext, ...context })
      },
      info(message: string, context?: LogContext) {
        parentLogger.info(message, { ...defaultContext, ...context })
      },
      log(message: string, context?: LogContext) {
        parentLogger.log(message, { ...defaultContext, ...context })
      },
      warn(message: string, context?: LogContext) {
        parentLogger.warn(message, { ...defaultContext, ...context })
      },
      error(message: string, error?: Error | unknown, context?: LogContext) {
        parentLogger.error(message, error, { ...defaultContext, ...context })
      },
      logIf: parentLogger.logIf.bind(parentLogger),
      child: parentLogger.child.bind(parentLogger),
    } as LoggerService
  }
}

// Export singleton instance
export const logger = new LoggerService()

// Export for use in other modules
export default logger