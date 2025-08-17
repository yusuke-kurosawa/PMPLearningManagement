/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */
import React from 'react'

// Mock theme context for testing
export const mockThemeContext = {
  settings: {
    darkMode: false,
    language: 'ja',
    animations: true,
    soundEffects: false,
    autoSave: true,
    notifications: true,
    compactMode: false,
    highContrast: false,
  },
  toggleDarkMode: vi.fn(),
  updateSettings: vi.fn(),
  resetSettings: vi.fn(),
}

export const MockThemeProvider = ({ children, value = mockThemeContext }) => {
  return <div data-testid="mock-theme-provider">{children}</div>
}

// Mock useTheme hook
export const useTheme = () => mockThemeContext
