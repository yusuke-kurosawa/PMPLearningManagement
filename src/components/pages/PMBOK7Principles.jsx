import React, { useState } from 'react'
import {
  Compass,
  Users,
  UserCheck,
  Target,
  Network,
  Crown,
  Settings,
  Award,
  Layers,
  Shield,
  RefreshCw,
  Zap,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { pmbok7Principles } from '../../data/schemas/pmbok/pmbok7Data'

const PMBOK7Principles = () => {
  const { settings } = useTheme()
  const [selectedPrinciple, setSelectedPrinciple] = useState(null)
  const [expandedPrinciples, setExpandedPrinciples] = useState(new Set())

  // 原則のアイコンマッピング
  const principleIcons = {
    stewardship: Compass,
    team: Users,
    stakeholders: UserCheck,
    value: Target,
    systemsThinking: Network,
    leadership: Crown,
    tailoring: Settings,
    quality: Award,
    complexity: Layers,
    risk: Shield,
    adaptability: RefreshCw,
    change: Zap,
  }

  // 原則の色マッピング
  const principleColors = {
    stewardship: 'blue',
    team: 'green',
    stakeholders: 'purple',
    value: 'amber',
    systemsThinking: 'indigo',
    leadership: 'red',
    tailoring: 'cyan',
    quality: 'emerald',
    complexity: 'orange',
    risk: 'pink',
    adaptability: 'teal',
    change: 'yellow',
  }

  const toggleExpanded = (principleId) => {
    const newExpanded = new Set(expandedPrinciples)
    if (newExpanded.has(principleId)) {
      newExpanded.delete(principleId)
    } else {
      newExpanded.add(principleId)
    }
    setExpandedPrinciples(newExpanded)
  }

  const getColorClasses = (color, type = 'bg') => {
    const colorMap = {
      blue: type === 'bg' ? 'bg-blue-100 dark:bg-blue-900/20' : 'text-blue-600 dark:text-blue-400',
      green:
        type === 'bg' ? 'bg-green-100 dark:bg-green-900/20' : 'text-green-600 dark:text-green-400',
      purple:
        type === 'bg'
          ? 'bg-purple-100 dark:bg-purple-900/20'
          : 'text-purple-600 dark:text-purple-400',
      amber:
        type === 'bg' ? 'bg-amber-100 dark:bg-amber-900/20' : 'text-amber-600 dark:text-amber-400',
      indigo:
        type === 'bg'
          ? 'bg-indigo-100 dark:bg-indigo-900/20'
          : 'text-indigo-600 dark:text-indigo-400',
      red: type === 'bg' ? 'bg-red-100 dark:bg-red-900/20' : 'text-red-600 dark:text-red-400',
      cyan: type === 'bg' ? 'bg-cyan-100 dark:bg-cyan-900/20' : 'text-cyan-600 dark:text-cyan-400',
      emerald:
        type === 'bg'
          ? 'bg-emerald-100 dark:bg-emerald-900/20'
          : 'text-emerald-600 dark:text-emerald-400',
      orange:
        type === 'bg'
          ? 'bg-orange-100 dark:bg-orange-900/20'
          : 'text-orange-600 dark:text-orange-400',
      pink: type === 'bg' ? 'bg-pink-100 dark:bg-pink-900/20' : 'text-pink-600 dark:text-pink-400',
      teal: type === 'bg' ? 'bg-teal-100 dark:bg-teal-900/20' : 'text-teal-600 dark:text-teal-400',
      yellow:
        type === 'bg'
          ? 'bg-yellow-100 dark:bg-yellow-900/20'
          : 'text-yellow-600 dark:text-yellow-400',
    }
    return (
      colorMap[color] ||
      (type === 'bg' ? 'bg-gray-100 dark:bg-gray-900/20' : 'text-gray-600 dark:text-gray-400')
    )
  }

  return (
    <div className={`p-6 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">PMBOK第7版 - 12のプロジェクトマネジメント原則</h1>
        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          プロジェクトマネジメントの指針となる基本原則
        </p>
      </div>

      {/* 原則グリッド */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pmbok7Principles.map((principle) => {
          const Icon = principleIcons[principle.id]
          const color = principleColors[principle.id]
          const isExpanded = expandedPrinciples.has(principle.id)

          return (
            <div
              key={principle.id}
              className={`cursor-pointer rounded-lg border transition-all ${
                settings.darkMode
                  ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  : 'border-gray-200 bg-white hover:shadow-lg'
              } ${selectedPrinciple?.id === principle.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedPrinciple(principle)}
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${getColorClasses(color, 'bg')}`}>
                    <Icon className={`h-6 w-6 ${getColorClasses(color, 'text')}`} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(principle.id)
                    }}
                    className={`rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                </div>

                <h3 className="mb-2 text-lg font-semibold">{principle.name}</h3>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {principle.description}
                </p>

                {/* 展開時の詳細 */}
                {isExpanded && (
                  <div className="mt-4 border-t pt-4 dark:border-gray-700">
                    <p
                      className={`mb-3 text-sm ${
                        settings.darkMode ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {principle.details}
                    </p>
                    <div className="space-y-1">
                      <h4 className="mb-2 text-sm font-medium">主要なアクション:</h4>
                      {principle.keyActions.map((action, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-2 text-sm ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <span
                            className={`mt-1 h-1.5 w-1.5 rounded-full ${getColorClasses(color, 'bg')}`}
                          />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 選択された原則の詳細パネル */}
      {selectedPrinciple && (
        <div className={`fixed inset-0 z-50 overflow-y-auto`}>
          <div className="min-h-screen px-4 text-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedPrinciple(null)}
            />

            <div className="my-8 inline-block w-full max-w-3xl transform text-left align-middle transition-all">
              <div
                className={`rounded-lg shadow-xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-3 ${getColorClasses(
                          principleColors[selectedPrinciple.id],
                          'bg'
                        )}`}
                      >
                        {React.createElement(principleIcons[selectedPrinciple.id], {
                          className: `w-8 h-8 ${getColorClasses(principleColors[selectedPrinciple.id], 'text')}`,
                        })}
                      </div>
                      <div>
                        <h3 className="mb-2 text-2xl font-bold">{selectedPrinciple.name}</h3>
                        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedPrinciple.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPrinciple(null)}
                      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">閉じる</span>×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* 詳細説明 */}
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 font-semibold">
                        <Info className="h-4 w-4" />
                        詳細説明
                      </h4>
                      <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedPrinciple.details}
                      </p>
                    </div>

                    {/* 主要なアクション */}
                    <div>
                      <h4 className="mb-3 font-semibold">実践のための主要なアクション</h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {selectedPrinciple.keyActions.map((action, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 rounded-lg p-3 ${
                              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <div
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${getColorClasses(
                                principleColors[selectedPrinciple.id],
                                'bg'
                              )}`}
                            >
                              <span
                                className={`text-xs font-semibold ${getColorClasses(
                                  principleColors[selectedPrinciple.id],
                                  'text'
                                )}`}
                              >
                                {index + 1}
                              </span>
                            </div>
                            <span className="text-sm">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 実践のヒント */}
                    <div
                      className={`rounded-lg p-4 ${
                        settings.darkMode ? 'bg-gray-700' : 'bg-blue-50'
                      }`}
                    >
                      <h4 className="mb-2 flex items-center gap-2 font-semibold">
                        <Target className="h-4 w-4" />
                        実践のヒント
                      </h4>
                      <p
                        className={`text-sm ${
                          settings.darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        この原則を日々のプロジェクトマネジメントに適用する際は、
                        チームメンバーやステークホルダーと定期的に振り返りを行い、
                        原則がどのように実践されているかを評価しましょう。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PMBOK7Principles
