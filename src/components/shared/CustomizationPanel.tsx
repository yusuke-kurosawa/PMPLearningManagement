import React, { useState } from 'react'
import {
  Settings,
  Moon,
  Sun,
  Palette,
  Type,
  Layout,
  Zap,
  Eye,
  RotateCcw,
  X,
  Check,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const CustomizationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings, toggleDarkMode, resetSettings } = useTheme()

  const colorOptions = [
    { value: 'blue', label: '青', color: 'bg-blue-600' },
    { value: 'green', label: '緑', color: 'bg-green-600' },
    { value: 'purple', label: '紫', color: 'bg-purple-600' },
    { value: 'red', label: '赤', color: 'bg-red-600' },
    { value: 'indigo', label: '藍', color: 'bg-indigo-600' },
  ]

  const fontSizeOptions = [
    { value: 'small', label: '小', icon: 'S' },
    { value: 'medium', label: '中', icon: 'M' },
    { value: 'large', label: '大', icon: 'L' },
    { value: 'xlarge', label: '特大', icon: 'XL' },
  ]

  return (
    <>
      {/* カスタマイズボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-4 right-4 z-50 transform rounded-full p-3
          shadow-lg transition-all duration-300 hover:scale-110
          ${
            settings.darkMode
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }
        `}
        aria-label="カスタマイズ設定"
      >
        <Settings className={`h-6 w-6 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
      </button>

      {/* カスタマイズパネル */}
      <div
        className={`
        fixed bottom-20 right-4 z-50 w-80 origin-bottom-right transform
        rounded-lg shadow-2xl transition-all duration-300
        ${isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-0 opacity-0'}
        ${settings.darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
      `}
      >
        {/* ヘッダー */}
        <div
          className={`
          flex items-center justify-between border-b p-4
          ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
        >
          <h3 className="text-lg font-semibold">カスタマイズ設定</h3>
          <button
            onClick={() => setIsOpen(false)}
            className={`
              rounded p-1 transition-colors hover:bg-gray-200
              dark:hover:bg-gray-700
            `}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 設定項目 */}
        <div className="space-y-6 p-4">
          {/* ダークモード */}
          <div>
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                ダークモード
              </span>
              <button
                onClick={toggleDarkMode}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none
                  ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white
                    transition-transform
                    ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </label>
          </div>

          {/* プライマリカラー */}
          <div>
            <label className="mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              テーマカラー
            </label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ primaryColor: option.value })}
                  className={`
                    h-12 w-12 rounded-lg ${option.color} 
                    transform transition-all hover:scale-110
                    ${settings.primaryColor === option.value ? 'ring-2 ring-offset-2' : ''}
                    ${settings.darkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}
                  `}
                  title={option.label}
                >
                  {settings.primaryColor === option.value && (
                    <Check className="mx-auto h-6 w-6 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* フォントサイズ */}
          <div>
            <label className="mb-3 flex items-center gap-2">
              <Type className="h-4 w-4" />
              文字サイズ
            </label>
            <div className="flex gap-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ fontSize: option.value })}
                  className={`
                    flex-1 rounded-lg px-3 py-2 font-medium
                    transition-all
                    ${
                      settings.fontSize === option.value
                        ? settings.darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : settings.darkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>

          {/* その他の設定 */}
          <div className="space-y-3">
            {/* コンパクトモード */}
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                コンパクト表示
              </span>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => updateSettings({ compactMode: e.target.checked })}
                className="rounded"
              />
            </label>

            {/* アニメーション */}
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                アニメーション
              </span>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => updateSettings({ animations: e.target.checked })}
                className="rounded"
              />
            </label>

            {/* 高コントラスト */}
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                高コントラスト
              </span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                className="rounded"
              />
            </label>
          </div>

          {/* リセットボタン */}
          <button
            onClick={() => {
              if (confirm('すべての設定をデフォルトに戻しますか？')) {
                resetSettings()
              }
            }}
            className={`
              flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2
              transition-colors
              ${
                settings.darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
          >
            <RotateCcw className="h-4 w-4" />
            設定をリセット
          </button>
        </div>
      </div>
    </>
  )
}

export default CustomizationPanel
