// アクセシビリティ修正用のコンポーネントとユーティリティ
// WCAG 2.1 AA準拠のためのヘルパー関数とコンポーネント

import React, { useEffect, useState, useCallback, RefObject } from 'react'

// ==================== Type Definitions ====================

interface BaseFormProps {
  id?: string
  label: string
  className?: string
  darkMode?: boolean
  required?: boolean
  ariaDescribedBy?: string
}

interface AccessibleInputProps extends BaseFormProps {
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

interface AccessibleTextareaProps extends BaseFormProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
}

interface SelectOption {
  value: string
  label: string
}

interface AccessibleSelectProps extends BaseFormProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options?: SelectOption[]
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode
}

interface SkipLinkProps {
  href?: string
  text?: string
}

interface AriaLiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: string
}

interface FormErrorProps {
  id: string
  message: string
  visible?: boolean
}

interface AccessibleLoadingProps {
  text?: string
}

interface KeyboardNavigationReturn {
  focusedIndex: number
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>
}

interface AnnounceReturn {
  announcement: string
  announce: (message: string) => void
}

// ==================== Components ====================

/**
 * アクセシブルなフォーム入力コンポーネント
 * WCAG 1.3.1 - フォーム要素の適切なラベル付けを保証
 */
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  className,
  darkMode = false,
  required = false,
  ariaDescribedBy,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className='form-group'>
      <label
        htmlFor={inputId}
        className={`mb-2 block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className='ml-1 text-red-500' aria-label='必須'>
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        required={required}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    </div>
  )
}

/**
 * アクセシブルなテキストエリアコンポーネント
 */
export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
  darkMode = false,
  required = false,
  rows = 4,
  ariaDescribedBy,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className='form-group'>
      <label
        htmlFor={textareaId}
        className={`mb-2 block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className='ml-1 text-red-500' aria-label='必須'>
            *
          </span>
        )}
      </label>
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        rows={rows}
        required={required}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    </div>
  )
}

/**
 * アクセシブルなセレクトコンポーネント
 */
export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options = [],
  className,
  darkMode = false,
  required = false,
  ariaDescribedBy,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className='form-group'>
      <label
        htmlFor={selectId}
        className={`mb-2 block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className='ml-1 text-red-500' aria-label='必須'>
            *
          </span>
        )}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={className}
        required={required}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * スクリーンリーダー専用テキスト
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => (
  <span className='sr-only'>{children}</span>
)

/**
 * スキップリンクコンポーネント
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href = '#main-content', 
  text = 'メインコンテンツへスキップ' 
}) => (
  <a
    href={href}
    className='absolute left-0 top-0 z-50 -translate-y-full rounded-md bg-blue-600 px-4 py-2 text-white focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-400'
  >
    {text}
  </a>
)

/**
 * アリアライブリージョン
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
}) => (
  <div
    role='status'
    aria-live={politeness}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className='sr-only'
  >
    {message}
  </div>
)

/**
 * フォームエラーメッセージ
 */
export const FormError: React.FC<FormErrorProps> = ({ id, message, visible = false }) => (
  <span
    id={id}
    role='alert'
    aria-live='polite'
    className={`mt-1 text-sm text-red-600 ${visible ? 'block' : 'hidden'}`}
  >
    {message}
  </span>
)

/**
 * アクセシブルなローディング状態
 */
export const AccessibleLoading: React.FC<AccessibleLoadingProps> = ({ text = '読み込み中...' }) => (
  <div className='flex items-center justify-center p-4'>
    <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600' />
    <span className='sr-only'>{text}</span>
  </div>
)

// ==================== Hooks ====================

/**
 * フォーカストラップフック
 */
export const useFocusTrap = (ref: RefObject<HTMLElement>): void => {
  useEffect(() => {
    if (!ref.current) {
      return
    }

    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    )

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus()
          e.preventDefault()
        }
      }
    }

    const currentRef = ref.current
    currentRef.addEventListener('keydown', handleTabKey)

    return () => {
      currentRef.removeEventListener('keydown', handleTabKey)
    }
  }, [ref])
}

/**
 * キーボードナビゲーションフック
 */
export const useKeyboardNavigation = <T>(
  items: T[], 
  onSelect: (item: T) => void
): KeyboardNavigationReturn => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onSelect(items[focusedIndex])
          }
          break
        case 'Escape':
          setFocusedIndex(-1)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, items, onSelect])

  return { focusedIndex, setFocusedIndex }
}

/**
 * アナウンスメントフック
 */
export const useAnnounce = (): AnnounceReturn => {
  const [announcement, setAnnouncement] = useState<string>('')

  const announce = useCallback((message: string) => {
    setAnnouncement('')
    setTimeout(() => setAnnouncement(message), 100)
  }, [])

  return { announcement, announce }
}

// ==================== Default Export ====================

export default {
  AccessibleInput,
  AccessibleTextarea,
  AccessibleSelect,
  ScreenReaderOnly,
  SkipLink,
  AriaLiveRegion,
  FormError,
  AccessibleLoading,
  useFocusTrap,
  useKeyboardNavigation,
  useAnnounce,
}