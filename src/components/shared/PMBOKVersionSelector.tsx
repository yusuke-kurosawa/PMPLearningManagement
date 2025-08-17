import React, { useState } from 'react'
import {
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Info,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  pmbokVersionInfo,
  migrationGuide,
  pmbok6to7Mapping,
  learningPaths,
} from '../../data/schemas/pmbok/pmbok7Data'
import PMBOK7Principles from '../pages/PMBOK7Principles'
import PMBOK7PerformanceDomains from '../pages/PMBOK7PerformanceDomains'
import PMBOKMatrix from '../pages/PMBOKMatrix'
import ITTOForceGraph from '../visualizations/ITTOForceGraph'

const PMBOKVersionSelector: React.FC = () => {
  const { settings } = useTheme()
  const [selectedVersion, setSelectedVersion] = useState('v6')
  const [showMigrationGuide, setShowMigrationGuide] = useState(false)
  const [showComparisonView, setShowComparisonView] = useState(false)
  const [selectedLearningPath, setSelectedLearningPath] = useState(null)

  const renderVersionContent: React.FC = () => {
    if (showComparisonView) {
      return renderComparisonView()
    }

    switch (selectedVersion) {
      case 'v6':
        return (
          <div className="space-y-6">
            <PMBOKMatrix />
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold">ネットワーク図で見る</h3>
              <ITTOForceGraph />
            </div>
          </div>
        )
      case 'v7':
        return (
          <div className="space-y-8">
            <PMBOK7Principles />
            <PMBOK7PerformanceDomains />
            {renderLearningPaths()}
          </div>
        )
      default:
        return null
    }
  }

  const renderLearningPaths: React.FC = () => {
    return (
      <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className="mb-4 text-2xl font-bold">推奨学習パス</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(learningPaths).map(([key, path]) => (
            <div
              key={key}
              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                settings.darkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:shadow-lg'
              } ${selectedLearningPath === key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedLearningPath(key)}
            >
              <h4 className="mb-2 font-semibold">{path.name}</h4>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {path.description}
              </p>
            </div>
          ))}
        </div>

        {selectedLearningPath && (
          <div
            className={`mt-6 rounded-lg p-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <h4 className="mb-3 font-semibold">学習ステップ</h4>
            <div className="space-y-2">
              {learningPaths[selectedLearningPath].steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      settings.darkMode ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </div>
                  <span className="text-sm">
                    {step.type === 'principle' && `原則: ${step.ids.join(', ')}`}
                    {step.type === 'domain' && `ドメイン: ${step.ids.join(', ')}`}
                    {step.type === 'integration' && step.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderComparisonView: React.FC = () => {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 第6版 */}
        <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5" />
            PMBOK第6版
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">特徴</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>49のプロセスによる体系的なアプローチ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>ITTOフレームワークによる明確な構造</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>10の知識エリアと5つのプロセス群</span>
                </li>
              </ul>
            </div>
            <div className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">49</div>
                  <div className="text-sm">プロセス</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-sm">知識エリア</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 第7版 */}
        <div className={`rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5" />
            PMBOK第7版
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold">特徴</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>12の原則による価値重視のアプローチ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>8つのパフォーマンスドメイン</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>アジャイルとハイブリッドアプローチの統合</span>
                </li>
              </ul>
            </div>
            <div className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm">原則</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm">ドメイン</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* マッピング */}
        <div
          className={`rounded-lg p-6 lg:col-span-2 ${
            settings.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className="mb-4 text-xl font-bold">第6版から第7版へのマッピング</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold">知識エリア → パフォーマンスドメイン</h4>
              <div className="space-y-2">
                {Object.entries(pmbok6to7Mapping.knowledgeAreas)
                  .slice(0, 5)
                  .map(([area, domains]) => (
                    <div key={area} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{area}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {domains.join(', ')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">プロセス群 → パフォーマンスドメイン</h4>
              <div className="space-y-2">
                {Object.entries(pmbok6to7Mapping.processGroups).map(([group, domains]) => (
                  <div key={group} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{group}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {domains.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">PMBOKガイド バージョン選択</h1>
          <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            学習したいPMBOKのバージョンを選択してください
          </p>
        </div>

        {/* バージョン選択 */}
        <div className={`mb-6 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 第6版 */}
              <button
                onClick={() => setSelectedVersion('v6')}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  selectedVersion === 'v6'
                    ? 'bg-green-600 text-white'
                    : settings.darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                PMBOK第6版
              </button>

              {/* トグルスイッチ */}
              <button
                onClick={() => setSelectedVersion(selectedVersion === 'v6' ? 'v7' : 'v6')}
                className="p-2"
              >
                {selectedVersion === 'v6' ? (
                  <ToggleLeft className="h-8 w-8" />
                ) : (
                  <ToggleRight className="h-8 w-8" />
                )}
              </button>

              {/* 第7版 */}
              <button
                onClick={() => setSelectedVersion('v7')}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  selectedVersion === 'v7'
                    ? 'bg-blue-600 text-white'
                    : settings.darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                PMBOK第7版
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowComparisonView(!showComparisonView)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  showComparisonView
                    ? 'bg-purple-600 text-white'
                    : settings.darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ExternalLink className="h-4 w-4" />
                比較ビュー
              </button>
              <button
                onClick={() => setShowMigrationGuide(!showMigrationGuide)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  settings.darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Info className="h-4 w-4" />
                移行ガイド
              </button>
            </div>
          </div>

          {/* バージョン情報 */}
          <div className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h3 className="font-semibold">
                {selectedVersion === 'v6'
                  ? pmbokVersionInfo.version6.name
                  : pmbokVersionInfo.version7.name}
              </h3>
            </div>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedVersion === 'v6'
                ? pmbokVersionInfo.version6.focus
                : pmbokVersionInfo.version7.focus}
            </p>
          </div>
        </div>

        {/* 移行ガイド */}
        {showMigrationGuide && (
          <div className={`mb-6 rounded-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="mb-4 text-xl font-bold">第6版から第7版への移行ガイド</h3>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {migrationGuide.keyChanges.map((change, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                >
                  <h4 className="mb-2 font-semibold">{change.title}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">従来:</span>
                      <span className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {change.from}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">新規:</span>
                      <span className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {change.to}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">{change.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="mb-3 font-semibold">移行ステップ</h4>
              <div className="space-y-2">
                {migrationGuide.transitionSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* コンテンツ表示 */}
        {renderVersionContent()}
      </div>
    </div>
  )
}

export default PMBOKVersionSelector
