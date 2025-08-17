import React, { useState } from 'react'
import {
  Users,
  UserCheck,
  Code,
  Calendar,
  Briefcase,
  Package,
  BarChart3,
  HelpCircle,
  ChevronRight,
  _ArrowRight,
  Target,
  CheckCircle,
  AlertCircle,
  Link,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { pmbok7PerformanceDomains } from '../../data/schemas/pmbok/pmbok7Data'

const PMBOK7PerformanceDomains: React.FC = () => {
  const { settings } = useTheme()
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid or diagram

  // ドメインのアイコンマッピング
  const domainIcons = {
    stakeholder: UserCheck,
    team: Users,
    development: Code,
    planning: Calendar,
    work: Briefcase,
    delivery: Package,
    measurement: BarChart3,
    uncertainty: HelpCircle,
  }

  // ドメインの色マッピング
  const domainColors = {
    stakeholder: 'purple',
    team: 'green',
    development: 'blue',
    planning: 'amber',
    work: 'orange',
    delivery: 'emerald',
    measurement: 'indigo',
    uncertainty: 'red',
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
      orange:
        type === 'bg'
          ? 'bg-orange-100 dark:bg-orange-900/20'
          : 'text-orange-600 dark:text-orange-400',
      emerald:
        type === 'bg'
          ? 'bg-emerald-100 dark:bg-emerald-900/20'
          : 'text-emerald-600 dark:text-emerald-400',
    }
    return (
      colorMap[color] ||
      (type === 'bg' ? 'bg-gray-100 dark:bg-gray-900/20' : 'text-gray-600 dark:text-gray-400')
    )
  }

  // ドメイン間の相互作用を可視化
  const renderDomainDiagram: React.FC = () => {
    const positions = {
      stakeholder: { x: 50, y: 20 },
      team: { x: 20, y: 40 },
      development: { x: 80, y: 40 },
      planning: { x: 20, y: 60 },
      work: { x: 50, y: 60 },
      delivery: { x: 80, y: 60 },
      measurement: { x: 20, y: 80 },
      uncertainty: { x: 50, y: 90 },
    }

    return (
      <div
        className={`relative h-[600px] rounded-lg p-8 ${
          settings.darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <svg className="absolute inset-0 h-full w-full">
          {/* 相互作用の線を描画 */}
          {pmbok7PerformanceDomains.map((domain) =>
            domain.interactions.map((targetId) => {
              if (targetId === 'all') {return null}
              const source = positions[domain.id]
              const target = positions[targetId]
              if (!source || !target) {return null}

              return (
                <line
                  key={`${domain.id}-${targetId}`}
                  x1={`${source.x}%`}
                  y1={`${source.y}%`}
                  x2={`${target.x}%`}
                  y2={`${target.y}%`}
                  stroke={settings.darkMode ? '#4B5563' : '#D1D5DB'}
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />
              )
            })
          )}
        </svg>

        {/* ドメインノード */}
        {pmbok7PerformanceDomains.map((domain) => {
          const Icon = domainIcons[domain.id]
          const color = domainColors[domain.id]
          const position = positions[domain.id]

          return (
            <div
              key={domain.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              onClick={() => setSelectedDomain(domain)}
            >
              <div className={`group relative`}>
                <div
                  className={`rounded-full p-4 ${getColorClasses(color, 'bg')} 
                  shadow-lg transition-all hover:scale-110 hover:shadow-xl`}
                >
                  <Icon className={`h-8 w-8 ${getColorClasses(color, 'text')}`} />
                </div>
                <div
                  className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 transform 
                  whitespace-nowrap rounded px-3 py-1 text-sm ${
                    settings.darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                  } pointer-events-none opacity-0 transition-opacity group-hover:opacity-100`}
                >
                  {domain.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`p-6 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold">PMBOK第7版 - 8つのパフォーマンスドメイン</h1>
        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          プロジェクトパフォーマンスを構成する相互関連した活動領域
        </p>
      </div>

      {/* ビューモード切替 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`rounded-lg px-4 py-2 ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white'
              : settings.darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          グリッドビュー
        </button>
        <button
          onClick={() => setViewMode('diagram')}
          className={`rounded-lg px-4 py-2 ${
            viewMode === 'diagram'
              ? 'bg-blue-600 text-white'
              : settings.darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          相互作用ダイアグラム
        </button>
      </div>

      {/* コンテンツ表示 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pmbok7PerformanceDomains.map((domain) => {
            const Icon = domainIcons[domain.id]
            const color = domainColors[domain.id]

            return (
              <div
                key={domain.id}
                className={`cursor-pointer rounded-lg border transition-all ${
                  settings.darkMode
                    ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    : 'border-gray-200 bg-white hover:shadow-lg'
                } ${selectedDomain?.id === domain.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedDomain(domain)}
              >
                <div className="p-6">
                  <div className={`mb-4 rounded-lg p-3 ${getColorClasses(color, 'bg')}`}>
                    <Icon className={`h-8 w-8 ${getColorClasses(color, 'text')}`} />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">{domain.name}</h3>
                  <p
                    className={`mb-4 text-sm ${
                      settings.darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {domain.description}
                  </p>

                  {/* フォーカスエリア */}
                  <div className="mb-3">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide">
                      フォーカスエリア
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {domain.focusAreas.slice(0, 3).map((area, index) => (
                        <span
                          key={index}
                          className={`rounded-full px-2 py-1 text-xs ${
                            settings.darkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {area}
                        </span>
                      ))}
                      {domain.focusAreas.length > 3 && (
                        <span
                          className={`px-2 py-1 text-xs ${
                            settings.darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          +{domain.focusAreas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 期待される成果 */}
                  <div className="flex items-center gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    <span>{domain.outcomes.length}個の期待成果</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        renderDomainDiagram()
      )}

      {/* 選択されたドメインの詳細モーダル */}
      {selectedDomain && (
        <div className={`fixed inset-0 z-50 overflow-y-auto`}>
          <div className="min-h-screen px-4 text-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedDomain(null)}
            />

            <div className="my-8 inline-block w-full max-w-4xl transform text-left align-middle transition-all">
              <div
                className={`rounded-lg shadow-xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="p-6">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-lg p-3 ${getColorClasses(
                          domainColors[selectedDomain.id],
                          'bg'
                        )}`}
                      >
                        {React.createElement(domainIcons[selectedDomain.id], {
                          className: `w-8 h-8 ${getColorClasses(domainColors[selectedDomain.id], 'text')}`,
                        })}
                      </div>
                      <div>
                        <h3 className="mb-2 text-2xl font-bold">{selectedDomain.name}</h3>
                        <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedDomain.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDomain(null)}
                      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">閉じる</span>×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* フォーカスエリア */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <Target className="h-4 w-4" />
                        フォーカスエリア
                      </h4>
                      <div className="space-y-2">
                        {selectedDomain.focusAreas.map((area, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 rounded-lg p-3 ${
                              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 期待される成果 */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        期待される成果
                      </h4>
                      <div className="space-y-2">
                        {selectedDomain.outcomes.map((outcome, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 rounded-lg p-3 ${
                              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <div
                              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${getColorClasses(
                                domainColors[selectedDomain.id],
                                'bg'
                              )}`}
                            >
                              <CheckCircle
                                className={`h-3 w-3 ${getColorClasses(
                                  domainColors[selectedDomain.id],
                                  'text'
                                )}`}
                              />
                            </div>
                            <span className="text-sm">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 相互作用 */}
                  <div className="mt-6">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold">
                      <Link className="h-4 w-4" />
                      他のドメインとの相互作用
                    </h4>
                    {selectedDomain.interactions[0] === 'all' ? (
                      <div
                        className={`rounded-lg p-4 ${
                          settings.darkMode ? 'bg-gray-700' : 'bg-blue-50'
                        }`}
                      >
                        <p className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          このドメインはすべての他のドメインと相互作用します
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {selectedDomain.interactions.map((interactionId) => {
                          const targetDomain = pmbok7PerformanceDomains.find(
                            (d) => d.id === interactionId
                          )
                          if (!targetDomain) {return null}
                          const Icon = domainIcons[targetDomain.id]

                          return (
                            <div
                              key={interactionId}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                                settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm">{targetDomain.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* 実践のポイント */}
                  <div
                    className={`mt-6 rounded-lg p-4 ${
                      settings.darkMode ? 'bg-gray-700' : 'bg-amber-50'
                    }`}
                  >
                    <h4 className="mb-2 flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4" />
                      実践のポイント
                    </h4>
                    <p
                      className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      このドメインは他のドメインと密接に関連しています。
                      効果的なプロジェクトマネジメントのためには、 各ドメイン間の相互作用を理解し、
                      統合的なアプローチを取ることが重要です。
                    </p>
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

export default PMBOK7PerformanceDomains
