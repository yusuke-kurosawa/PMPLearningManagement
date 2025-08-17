/**
 * Node.js CLI Operations Type Definitions
 * CLIスクリプト実行、ファイルシステム操作、プロセス管理の型定義
 */

import { Stats } from 'fs'
import { SpawnOptions } from 'child_process'

// CLI Arguments and Environment
export interface CLIArguments {
  readonly _: string[]
  readonly [key: string]: unknown
}

export interface ProcessEnvironment {
  readonly NODE_ENV?: 'development' | 'production' | 'test'
  readonly CI?: string
  readonly GITHUB_TOKEN?: string
  readonly GITHUB_REPOSITORY?: string
  readonly GITHUB_WORKSPACE?: string
  readonly GITHUB_SHA?: string
  readonly GITHUB_REF?: string
  readonly [key: string]: string | undefined
}

// File System Operations
export interface FileSystemOperation {
  readonly path: string
  readonly operation: 'read' | 'write' | 'delete' | 'copy' | 'move'
  readonly size?: number
  readonly lastModified?: Date
}

export interface DirectoryListing {
  readonly files: string[]
  readonly directories: string[]
  readonly total: number
}

export interface FileStats extends Stats {
  readonly relativePath: string
  readonly extension: string
}

// Process Execution
export interface ProcessExecutionOptions extends SpawnOptions {
  readonly timeout?: number
  readonly silent?: boolean
  readonly failOnError?: boolean
}

export interface ProcessExecutionResult {
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: number
  readonly duration: number
  readonly success: boolean
}

// Shell Command Execution
export interface ShellCommand {
  readonly command: string
  readonly args?: string[]
  readonly options?: ProcessExecutionOptions
}

export interface ShellExecutionResult extends ProcessExecutionResult {
  readonly command: string
  readonly pid?: number
}

// CLI Logging
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

export interface LogEntry {
  readonly level: LogLevel
  readonly message: string
  readonly timestamp: Date
  readonly metadata?: Record<string, unknown>
}

export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void
  info(message: string, metadata?: Record<string, unknown>): void
  warn(message: string, metadata?: Record<string, unknown>): void
  error(message: string | Error, metadata?: Record<string, unknown>): void
  success(message: string, metadata?: Record<string, unknown>): void
}

// Progress Tracking
export interface ProgressTracker {
  readonly total: number
  readonly current: number
  readonly percentage: number
  readonly estimatedTimeRemaining?: number
}

export interface TaskProgress {
  readonly taskId: string
  readonly name: string
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly progress: ProgressTracker
  readonly startTime?: Date
  readonly endTime?: Date
  readonly error?: Error
}

// Exit Codes
export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  MISUSE_ARGS = 2,
  EXECUTION_ERROR = 3,
  NETWORK_ERROR = 4,
  FILE_NOT_FOUND = 5,
  PERMISSION_DENIED = 6,
  TIMEOUT = 7,
  VALIDATION_ERROR = 8,
  CONFIG_ERROR = 9,
}

// CLI Configuration
export interface CLIConfig {
  readonly verbose?: boolean
  readonly dryRun?: boolean
  readonly force?: boolean
  readonly outputFormat?: 'json' | 'text' | 'table' | 'csv'
  readonly logLevel?: LogLevel
  readonly timeout?: number
}

// Error Handling
export interface CLIError extends Error {
  readonly exitCode: ExitCode
  readonly details?: Record<string, unknown>
  readonly suggestion?: string
}

export class CLIException extends Error implements CLIError {
  constructor(
    message: string,
    public readonly exitCode: ExitCode = ExitCode.GENERAL_ERROR,
    public readonly details?: Record<string, unknown>,
    public readonly suggestion?: string
  ) {
    super(message)
    this.name = 'CLIException'
  }
}
