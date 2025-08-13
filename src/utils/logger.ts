/**
 * Logger Utility
 * 環境に応じたログ出力を提供し、本番環境でのconsole出力を制御
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  isDevelopment: boolean
  logLevel: LogLevel
}

class Logger {
  private config: LoggerConfig

  constructor() {
    this.config = {
      isDevelopment: import.meta.env.DEV || process.env.NODE_ENV === 'development',
      logLevel: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.isDevelopment && level === 'debug') {
      return false
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.logLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, message, ...args)
        }
        break
      case 'info':
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') {
          console.info(prefix, message, ...args)
        }
        break
      case 'warn':
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') {
          console.warn(prefix, message, ...args)
        }
        break
      case 'error':
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') {
          console.error(prefix, message, ...args)
        }
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args)
  }

  // 特殊なケース用のメソッド
  table(data: unknown): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data)
    }
  }

  time(label: string): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line no-console
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line no-console
      console.timeEnd(label)
    }
  }

  group(label: string): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  }
}

// シングルトンインスタンスをエクスポート
export const logger = new Logger()

// デフォルトエクスポート
export default logger
