import React, { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Palette,
  Monitor,
  Smartphone,
  Globe,
  Bell,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Save,
  Moon,
  Sun,
  Eye,
  Volume2,
  VolumeX,
  Accessibility,
  Zap,
  Layers,
  Grid3x3,
  List,
  ChevronDown,
  _ChevronRight,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const UserSettingsPanel = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  // Settings tabs
  const tabs = [
    { id: 'appearance', label: '外観', icon: Palette },
    { id: 'accessibility', label: 'アクセシビリティ', icon: Accessibility },
    { id: 'notifications', label: '通知', icon: Bell },
    { id: 'data', label: 'データ管理', icon: Download },
    { id: 'personalization', label: 'パーソナライズ', icon: User },
  ]

  // Watch for changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasChanges(hasChanges)
  }, [localSettings, settings])

  // Update local settings when global settings change
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Save settings
  const handleSave = () => {
    updateSettings(localSettings)
    setHasChanges(false)
  }

  // Reset to defaults
  const handleReset = () => {
    const defaultSettings = {
      darkMode: false,
      fontSize: 'medium',
      language: 'ja',
      notifications: true,
      soundEffects: true,
      animations: true,
      compactMode: false,
      highContrast: false,
      autoSave: true,
      defaultView: 'matrix',
    }
    setLocalSettings(defaultSettings)
  }

  // Export user data
  const handleExport = () => {
    const userData = {
      settings: localSettings,
      learningProgress: JSON.parse(localStorage.getItem('learningProgress') || '{}'),
      shortcuts: JSON.parse(localStorage.getItem('quickShortcuts') || '[]'),
      searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmbok-learning-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import user data
  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const userData = JSON.parse(e.target.result)
          if (userData.settings) {
            setLocalSettings(userData.settings)
          }
          if (userData.learningProgress) {
            localStorage.setItem('learningProgress', JSON.stringify(userData.learningProgress))
          }
          if (userData.shortcuts) {
            localStorage.setItem('quickShortcuts', JSON.stringify(userData.shortcuts))
          }
          if (userData.searchHistory) {
            localStorage.setItem('searchHistory', JSON.stringify(userData.searchHistory))
          }
          alert('データのインポートが完了しました。')
        } catch (error) {
          alert('ファイルの形式が正しくありません。')
        }
      }
      reader.readAsText(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Settings panel */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-2xl border bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                設定とカスタマイズ
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600"
                  >
                    <Save className="h-4 w-4" />
                    保存
                  </button>
                  <button
                    onClick={() => setLocalSettings(settings)}
                    className="px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    キャンセル
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar tabs */}
            <div className="w-64 border-r p-6 dark:border-gray-700">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content area */}
            <div className="flex-1 p-6">
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">外観設定</h3>

                  {/* Theme */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      テーマ
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setLocalSettings({ ...localSettings, darkMode: false })}
                        className={`
                          flex items-center gap-2 rounded-lg border px-4 py-3 transition-all
                          ${
                            !localSettings.darkMode
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                          }
                        `}
                      >
                        <Sun className="h-5 w-5" />
                        ライト
                      </button>
                      <button
                        onClick={() => setLocalSettings({ ...localSettings, darkMode: true })}
                        className={`
                          flex items-center gap-2 rounded-lg border px-4 py-3 transition-all
                          ${
                            localSettings.darkMode
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                          }
                        `}
                      >
                        <Moon className="h-5 w-5" />
                        ダーク
                      </button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      フォントサイズ
                    </label>
                    <select
                      value={localSettings.fontSize}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, fontSize: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="small">小</option>
                      <option value="medium">中</option>
                      <option value="large">大</option>
                      <option value="xl">特大</option>
                    </select>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        コンパクトモード
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        より多くの情報を表示します
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          compactMode: !localSettings.compactMode,
                        })
                      }
                      className={`
                        relative h-6 w-11 rounded-full transition-colors
                        ${localSettings.compactMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
                        ${localSettings.compactMode ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      />
                    </button>
                  </div>

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        アニメーション
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        画面遷移やエフェクトを有効にします
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          animations: !localSettings.animations,
                        })
                      }
                      className={`
                        relative h-6 w-11 rounded-full transition-colors
                        ${localSettings.animations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
                        ${localSettings.animations ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    アクセシビリティ
                  </h3>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        高コントラストモード
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        視認性を向上させます
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          highContrast: !localSettings.highContrast,
                        })
                      }
                      className={`
                        relative h-6 w-11 rounded-full transition-colors
                        ${localSettings.highContrast ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
                        ${localSettings.highContrast ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      />
                    </button>
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">効果音</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        操作時の音声フィードバック
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setLocalSettings({
                          ...localSettings,
                          soundEffects: !localSettings.soundEffects,
                        })
                      }
                      className={`
                        relative h-6 w-11 rounded-full transition-colors
                        ${localSettings.soundEffects ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
                        ${localSettings.soundEffects ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    データ管理
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Export Data */}
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-3 rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <Download className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          データをエクスポート
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          学習データをJSONファイルで保存
                        </p>
                      </div>
                    </button>

                    {/* Import Data */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-300 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                      <Upload className="h-5 w-5 text-green-500" />
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          データをインポート
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          以前のデータを復元
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Reset Data */}
                  <div className="border-t pt-4 dark:border-gray-700">
                    <button
                      onClick={() => {
                        if (
                          confirm('すべてのデータをリセットしますか？この操作は元に戻せません。')
                        ) {
                          localStorage.clear()
                          handleReset()
                          alert('データがリセットされました。')
                        }
                      }}
                      className="flex items-center gap-3 rounded-lg border border-red-300 p-4 text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <div className="text-left">
                        <h4 className="font-medium">すべてのデータをリセット</h4>
                        <p className="text-sm opacity-75">学習進捗、設定、カスタマイズを初期化</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Personalization */}
              {activeTab === 'personalization' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    パーソナライズ設定
                  </h3>

                  {/* Default View */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      デフォルト表示
                    </label>
                    <select
                      value={localSettings.defaultView}
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, defaultView: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="matrix">PMBOKマトリックス</option>
                      <option value="network">ネットワーク図</option>
                      <option value="visualizations">データ視覚化</option>
                      <option value="dashboard">学習ダッシュボード</option>
                    </select>
                  </div>

                  {/* Auto Save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        自動保存
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        学習進捗を自動的に保存します
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setLocalSettings({ ...localSettings, autoSave: !localSettings.autoSave })
                      }
                      className={`
                        relative h-6 w-11 rounded-full transition-colors
                        ${localSettings.autoSave ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 h-4 w-4 rounded-full bg-white transition-transform
                        ${localSettings.autoSave ? 'translate-x-6' : 'translate-x-1'}
                      `}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              設定は自動的に保存されます
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                デフォルトに戻す
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettingsPanel
