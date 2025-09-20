/**
 * UI関連型定義
 * テーマ、ナビゲーション、フォーム、モーダルなどのUI要素の型安全性を提供
 */

import type { ReactNode, CSSProperties, MouseEvent, KeyboardEvent } from 'react'

// ==================== テーマ関連型 ====================

/**
 * カラーパレット型
 */
export type ColorPalette = {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  light: string
  dark: string
  muted: string
}

/**
 * テーマカラー型
 */
export type ThemeColors = ColorPalette & {
  background: {
    primary: string
    secondary: string
    tertiary: string
    modal: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
    inverse: string
    link: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
    error: string
  }
}

/**
 * テーマモード型
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * スペーシング設定型
 */
export type Spacing = {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

/**
 * タイポグラフィ設定型
 */
export type Typography = {
  fontFamily: {
    primary: string
    secondary: string
    monospace: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

/**
 * ブレークポイント型
 */
export type Breakpoints = {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

/**
 * テーマ設定型
 */
export type Theme = {
  mode: ThemeMode
  colors: ThemeColors
  spacing: Spacing
  typography: Typography
  breakpoints: Breakpoints
  shadows: Record<string, string>
  borderRadius: Record<string, string>
  zIndex: Record<string, number>
}

// ==================== ナビゲーション関連型 ====================

/**
 * ナビゲーションアイテム型
 */
export type NavigationItem = {
  id: string
  label: string
  href?: string
  icon?: ReactNode
  badge?: string | number
  isActive?: boolean
  isDisabled?: boolean
  children?: NavigationItem[]
  onClick?: () => void
}

/**
 * ナビゲーション状態型
 */
export type NavigationState = {
  activeItem: string | null
  expandedItems: string[]
  isCollapsed: boolean
  isMobile: boolean
}

/**
 * ブレッドクラム型
 */
export type BreadcrumbItem = {
  label: string
  href?: string
  isActive?: boolean
}

// ==================== フォーム関連型 ====================

/**
 * 入力フィールド型
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'file'
  | 'hidden'

/**
 * フィールドサイズ型
 */
export type FieldSize = 'sm' | 'md' | 'lg'

/**
 * フィールド状態型
 */
export type FieldState = 'default' | 'valid' | 'invalid' | 'warning'

/**
 * フォームフィールドプロパティ型
 */
export type FormFieldProps = {
  id: string
  name: string
  label?: string
  placeholder?: string
  value?: string | number | boolean
  defaultValue?: string | number | boolean
  type?: InputType
  size?: FieldSize
  state?: FieldState
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  className?: string
  style?: CSSProperties
  onChange?: (value: unknown) => void
  onBlur?: () => void
  onFocus?: () => void
}

/**
 * バリデーションメッセージ型
 */
export type ValidationMessage = {
  type: 'error' | 'warning' | 'info'
  message: string
}

/**
 * フォーム状態型
 */
export type FormState = {
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  errors: Record<string, ValidationMessage[]>
  values: Record<string, unknown>
}

// ==================== モーダル関連型 ====================

/**
 * モーダルサイズ型
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * モーダル位置型
 */
export type ModalPosition = 'center' | 'top' | 'bottom'

/**
 * モーダルプロパティ型
 */
export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  position?: ModalPosition
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: ReactNode
}

/**
 * モーダル状態型
 */
export type ModalState = {
  activeModals: string[]
  modalStack: Array<{
    id: string
    component: ReactNode
    props: ModalProps
  }>
}

// ==================== 通知関連型 ====================

/**
 * 通知タイプ型
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * 通知位置型
 */
export type NotificationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/**
 * 通知型
 */
export type Notification = {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  isClosable?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
  }>
  createdAt: number
}

/**
 * 通知状態型
 */
export type NotificationState = {
  notifications: Notification[]
  position: NotificationPosition
  maxNotifications: number
}

// ==================== レイアウト関連型 ====================

/**
 * レイアウトタイプ型
 */
export type LayoutType = 'sidebar' | 'header' | 'fullwidth' | 'centered'

/**
 * レイアウト設定型
 */
export type LayoutConfig = {
  type: LayoutType
  sidebar?: {
    isCollapsible: boolean
    defaultCollapsed: boolean
    width: string
    collapsedWidth: string
  }
  header?: {
    isFixed: boolean
    height: string
  }
  footer?: {
    isFixed: boolean
    height: string
  }
}

// ==================== データ表示関連型 ====================

/**
 * テーブル列定義型
 */
export type TableColumn<T = unknown> = {
  key: keyof T
  label: string
  width?: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

/**
 * テーブルソート型
 */
export type TableSort<T = unknown> = {
  column: keyof T
  direction: 'asc' | 'desc'
}

/**
 * テーブル状態型
 */
export type TableState<T = unknown> = {
  data: T[]
  loading: boolean
  error: string | null
  sort: TableSort<T> | null
  filters: Record<string, unknown>
  selectedRows: string[]
  currentPage: number
  pageSize: number
  totalRows: number
}

// ==================== インタラクション型 ====================

/**
 * クリックイベントハンドラー型
 */
export type ClickHandler = (event: MouseEvent<HTMLElement>) => void

/**
 * キーボードイベントハンドラー型
 */
export type KeyboardHandler = (event: KeyboardEvent<HTMLElement>) => void

/**
 * 汎用イベントハンドラー型
 */
export type EventHandler<T = HTMLElement, E = Event> = (event: E & { target: T }) => void

/**
 * ドラッグ&ドロップ型
 */
export type DragDropItem = {
  id: string
  type: string
  data: unknown
}

/**
 * ドラッグ&ドロップハンドラー型
 */
export type DragDropHandlers = {
  onDragStart?: (item: DragDropItem) => void
  onDragEnd?: (item: DragDropItem) => void
  onDrop?: (item: DragDropItem, target: string) => void
}

// ==================== ローディング・状態表示型 ====================

/**
 * ローディング状態型
 */
export type LoadingState = {
  isLoading: boolean
  progress?: number
  message?: string
}

/**
 * 空状態型
 */
export type EmptyState = {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  illustration?: ReactNode
}

/**
 * エラー状態型
 */
export type ErrorState = {
  title: string
  description?: string
  code?: string
  retry?: {
    label: string
    onClick: () => void
  }
}

// ==================== アニメーション型 ====================

/**
 * アニメーション設定型
 */
export type AnimationConfig = {
  duration: number
  easing: string
  delay?: number
  repeat?: number | 'infinite'
  direction?: 'normal' | 'reverse' | 'alternate'
}

/**
 * トランジション型
 */
export type Transition = {
  property: string
  duration: string
  timingFunction: string
  delay?: string
}

// ==================== アクセシビリティ型 ====================

/**
 * ARIA属性型
 */
export type AriaAttributes = {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-checked'?: boolean
  'aria-disabled'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  'aria-relevant'?: string
  role?: string
}

/**
 * フォーカス管理型
 */
export type FocusManagement = {
  autoFocus?: boolean
  tabIndex?: number
  onFocus?: () => void
  onBlur?: () => void
}

// ==================== レスポンシブ型 ====================

/**
 * レスポンシブ値型
 */
export type ResponsiveValue<T> =
  | T
  | {
      base?: T
      sm?: T
      md?: T
      lg?: T
      xl?: T
      '2xl'?: T
    }

/**
 * ビューポート情報型
 */
export type ViewportInfo = {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

// ==================== エクスポート統合 ====================

/**
 * UI型定義の統合エクスポート
 */
export type UITypes = {
  Theme: Theme
  NavigationItem: NavigationItem
  NavigationState: NavigationState
  FormFieldProps: FormFieldProps
  FormState: FormState
  ModalProps: ModalProps
  Notification: Notification
  TableColumn: TableColumn
  TableState: TableState
  LoadingState: LoadingState
  EmptyState: EmptyState
  ErrorState: ErrorState
  ViewportInfo: ViewportInfo
}
