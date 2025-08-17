import React from 'react'
import { Loader2, BookOpen, Network, Grid, Brain } from 'lucide-react'

// Main App Loading Spinner
export const LoadingSpinner = ({ message = '読み込み中...' }) => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="font-medium text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
)

// Content Loading Placeholder
export const ContentLoader = ({ message = 'コンテンツを読み込んでいます...' }) => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  </div>
)

// Skeleton Components
export const SkeletonCard = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-white shadow dark:bg-gray-800 ${className}`}>
    <div className="p-6">
      <div className="mb-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
    {/* Table Header */}
    <div className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-4 gap-4 p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
        ))}
      </div>
    </div>

    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b last:border-b-0 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

export const SkeletonList = ({ items = 5 }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800"
      >
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    ))}
  </div>
)

// Feature-specific loaders
export const MatrixLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center space-y-4">
      <Grid className="h-16 w-16 animate-pulse text-blue-500" />
      <p className="font-medium text-gray-600 dark:text-gray-400">
        PMBOKマトリックスを読み込んでいます...
      </p>
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
    </div>
  </div>
)

export const NetworkLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center space-y-4">
      <Network className="h-16 w-16 animate-pulse text-green-500" />
      <p className="font-medium text-gray-600 dark:text-gray-400">
        ネットワーク図を構築しています...
      </p>
      <div className="h-2 w-48 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-2 animate-pulse rounded-full bg-green-500" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
)

export const ExamLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center space-y-4">
      <BookOpen className="h-16 w-16 animate-pulse text-purple-500" />
      <p className="font-medium text-gray-600 dark:text-gray-400">模擬試験を準備しています...</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-3 w-3 animate-pulse rounded bg-purple-300"></div>
        <div
          className="h-3 w-3 animate-pulse rounded bg-purple-400"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="h-3 w-3 animate-pulse rounded bg-purple-500"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  </div>
)

export const FlashcardLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center space-y-4">
      <Brain className="h-16 w-16 animate-pulse text-indigo-500" />
      <p className="font-medium text-gray-600 dark:text-gray-400">
        フラッシュカードを読み込んでいます...
      </p>
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-12 animate-pulse rounded bg-indigo-300"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    </div>
  </div>
)

// Error States
export const ErrorBoundaryFallback = ({ error, resetError }) => (
  <div className="flex min-h-[400px] items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="mx-auto max-w-md p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        エラーが発生しました
      </h3>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        申し訳ありませんが、予期しないエラーが発生しました。ページを再読み込みしてお試しください。
      </p>
      <button
        onClick={resetError}
        className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
      >
        再試行
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">エラー詳細</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-800">
            {error?.message || 'Unknown error'}
          </pre>
        </details>
      )}
    </div>
  </div>
)

// Progress Indicator
export const ProgressIndicator = ({ progress, message }) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex w-full max-w-xs flex-col items-center space-y-4">
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500">{progress}% 完了</div>
    </div>
  </div>
)
