/**
 * UI/UXコンポーネント実装
 * Developer 4: フロントエンド・ビジュアライゼーション
 * 技術スタック: React, D3.js, Framer Motion
 * セキュリティレベル: Low
 * 最終更新: {updated}
 */
import React, { useState } from 'react'
import { Settings, User, Palette, Zap } from 'lucide-react'
import UserSettingsPanel from './UserSettingsPanel'

const SettingsTrigger = ({ variant = 'button', className = '' }) => {
  const [showSettings, setShowSettings] = useState(false)

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Action Button */}
        <button
          onClick={() => setShowSettings(true)}
          className={`
            group fixed bottom-6 right-6 z-40 h-14 w-14 
            rounded-full bg-blue-500 text-white shadow-lg 
            transition-all duration-300 hover:bg-blue-600 hover:shadow-xl
            ${className}
          `}
          aria-label="設定を開く"
        >
          <Settings className="mx-auto h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />

          {/* Tooltip */}
          <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm text-white">
              設定とカスタマイズ
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </button>

        <UserSettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={`
          flex items-center gap-2 rounded-lg px-3 py-2
          text-gray-700 transition-colors 
          hover:bg-gray-100 dark:text-gray-300 
          dark:hover:bg-gray-700 ${className}
        `}
        aria-label="設定を開く"
      >
        <Settings className="h-4 w-4" />
        <span className="text-sm font-medium">設定</span>
      </button>

      <UserSettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

export default SettingsTrigger
