// アクセシビリティ修正用のコンポーネントとユーティリティ
// WCAG 2.1 AA準拠のためのヘルパー関数とコンポーネント

import React from 'react';

/**
 * アクセシブルなフォーム入力コンポーネント
 * WCAG 1.3.1 - フォーム要素の適切なラベル付けを保証
 */
export const AccessibleInput = ({
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
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      <label 
        htmlFor={inputId}
        className={`block mb-2 text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="必須">*</span>}
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
  );
};

/**
 * アクセシブルなテキストエリアコンポーネント
 */
export const AccessibleTextarea = ({
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
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      <label 
        htmlFor={textareaId}
        className={`block mb-2 text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="必須">*</span>}
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
  );
};

/**
 * アクセシブルなセレクトコンポーネント
 */
export const AccessibleSelect = ({
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
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="form-group">
      <label 
        htmlFor={selectId}
        className={`block mb-2 text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="必須">*</span>}
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
  );
};

/**
 * スクリーンリーダー専用テキスト
 */
export const ScreenReaderOnly = ({ children }) => (
  <span className="sr-only">{children}</span>
);

/**
 * スキップリンクコンポーネント
 */
export const SkipLink = ({ href = '#main-content', text = 'メインコンテンツへスキップ' }) => (
  <a
    href={href}
    className="absolute left-0 top-0 z-50 -translate-y-full rounded-md bg-blue-600 px-4 py-2 text-white focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    {text}
  </a>
);

/**
 * アリアライブリージョン
 */
export const AriaLiveRegion = ({ 
  message, 
  politeness = 'polite', // 'polite' | 'assertive' | 'off'
  atomic = true,
  relevant = 'additions text'
}) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className="sr-only"
  >
    {message}
  </div>
);

/**
 * フォームエラーメッセージ
 */
export const FormError = ({ id, message, visible = false }) => (
  <span
    id={id}
    role="alert"
    aria-live="polite"
    className={`text-sm text-red-600 mt-1 ${visible ? 'block' : 'hidden'}`}
  >
    {message}
  </span>
);

/**
 * アクセシブルなローディング状態
 */
export const AccessibleLoading = ({ text = '読み込み中...' }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    <span className="sr-only">{text}</span>
  </div>
);

/**
 * フォーカストラップフック
 */
export const useFocusTrap = (ref) => {
  React.useEffect(() => {
    if (!ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    ref.current.addEventListener('keydown', handleTabKey);
    
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('keydown', handleTabKey);
      }
    };
  }, [ref]);
};

/**
 * キーボードナビゲーションフック
 */
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => 
            prev <= 0 ? items.length - 1 : prev - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => 
            prev >= items.length - 1 ? 0 : prev + 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onSelect(items[focusedIndex]);
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items, onSelect]);

  return { focusedIndex, setFocusedIndex };
};

/**
 * アナウンスメントフック
 */
export const useAnnounce = () => {
  const [announcement, setAnnouncement] = React.useState('');

  const announce = React.useCallback((message) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  return { announcement, announce };
};

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
  useAnnounce
};