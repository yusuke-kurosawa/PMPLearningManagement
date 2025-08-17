import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ThemeContext from '../../contexts/ThemeContext'
import AuthContext, { AuthContextType } from '../../contexts/AuthContext'
import { UserRoles } from '../../services/authService'
import { vi } from 'vitest'

// Mock theme context value
const mockThemeContext = {
  isDarkMode: false,
  toggleTheme: vi.fn(),
  setTheme: vi.fn(),
}

// Mock settings context (for Navigation component)
// const mockSettings = {
//   darkMode: false,
//   toggleDarkMode: vi.fn(),
//   language: 'ja',
//   setLanguage: vi.fn(),
// }

// Create a mock settings context provider
const _MockSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Use a simple Context.Provider since we're mocking
  return React.createElement(
    'div',
    { 'data-testid': 'mock-settings-provider' },
    children
  )
}

// Mock auth context value
const mockAuthContext: AuthContextType = {
  user: null,
  session: null,
  role: UserRoles.GUEST,
  permissions: [],
  loading: false,
  authError: null,
  isAuthenticated: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  clearError: vi.fn(),
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  themeContext?: Partial<typeof mockThemeContext>
  authContext?: Partial<AuthContextType>
  initialEntries?: string[]
}

const _AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <ThemeContext.Provider value={mockThemeContext}>
        <AuthContext.Provider value={mockAuthContext}>{children}</AuthContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  )
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { themeContext, authContext, initialEntries = ['/'], ...renderOptions } = options

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const mergedThemeContext = { ...mockThemeContext, ...themeContext }
    const mergedAuthContext = { ...mockAuthContext, ...authContext }

    return (
      <MemoryRouter initialEntries={initialEntries}>
        <ThemeContext.Provider value={mergedThemeContext}>
          <AuthContext.Provider value={mergedAuthContext}>{children}</AuthContext.Provider>
        </ThemeContext.Provider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock implementations for common test utilities
export const mockNavigate = vi.fn()
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}

// Helper function to create test data
export const createTestUser = (overrides: Record<string, unknown> = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date().toISOString(),
  ...overrides,
})

// Helper function to wait for async operations
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

// Mock window methods commonly used in tests
export const mockWindowMethods = () => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock localStorage
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key])
    }),
    length: Object.keys(storage).length,
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
  }
}

// Helper to create proper Touch objects for testing
export const createMockTouch = (overrides: Partial<Touch> = {}): Touch => ({
  identifier: 0,
  target: document.body,
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  radiusX: 0,
  radiusY: 0,
  rotationAngle: 0,
  force: 0,
  ...overrides,
})

// Helper to create proper TouchEvent for testing
export const createMockTouchEvent = (
  type: string,
  touchData: Array<Partial<Touch>> = []
): TouchEvent => {
  const touches = touchData.map(createMockTouch)

  const touchList = {
    length: touches.length,
    item: (index: number) => touches[index] || null,
    ...touches.reduce((acc, touch, index) => ({ ...acc, [index]: touch }), {}),
  } as TouchList

  return new TouchEvent(type, {
    touches: type === 'touchend' ? ([] as unknown as TouchList) : touchList,
    targetTouches: type === 'touchend' ? ([] as unknown as TouchList) : touchList,
    changedTouches: touchList,
    bubbles: true,
    cancelable: true,
  }) as TouchEvent
}
