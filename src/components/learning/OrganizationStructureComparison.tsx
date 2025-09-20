import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Target,
  Crown,
  Building2,
  TrendingUp,
  TrendingDown,
  Scale,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Radar,
  Filter,
  Download,
  RotateCcw,
} from 'lucide-react'
import { organizationalStructureTypes, structureComparison } from '../../data/pmbok/opmData.js'
import type {
  OrganizationalStructureTypes,
  StructureComparison,
} from '../../data/schemas/pmbok/opmTypes'

interface ComparisonTableProps {
  theme: 'light' | 'dark'
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ theme }) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const structureTypes = ['functional', 'matrix', 'projectized'] as const
  const typeNames = {
    functional: '機能型',
    matrix: 'マトリックス型',
    projectized: 'プロジェクト型',
  }

  const typeColors = {
    functional: theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800',
    matrix: theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
    projectized:
      theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
  }

  return (
    <div
      className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow-lg`}
    >
      <div className={`border-b p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3
          className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          組織構造タイプ比較表
        </h3>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <th
                className={`p-4 text-left font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                比較観点
              </th>
              {structureTypes.map((type) => (
                <th key={type} className={`p-4 text-center font-semibold`}>
                  <span className={`rounded-full px-3 py-1 text-sm ${typeColors[type]}`}>
                    {typeNames[type]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {structureComparison.comparisonMatrix.map((row, index) => (
              <motion.tr
                key={index}
                className={`cursor-pointer border-b transition-colors ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } ${
                  selectedRow === index
                    ? theme === 'dark'
                      ? 'bg-blue-900/20'
                      : 'bg-blue-50'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700/50'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <td
                  className={`p-4 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  <div className='flex items-center'>
                    <Info className='mr-2 h-4 w-4 text-blue-500' />
                    {row.criteria}
                  </div>
                </td>
                <td
                  className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {row.functional}
                </td>
                <td
                  className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {row.matrix}
                </td>
                <td
                  className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  {row.projectized}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface AuthorityLevelChartProps {
  theme: 'light' | 'dark'
}

const AuthorityLevelChart: React.FC<AuthorityLevelChartProps> = ({ theme }) => {
  const authorityData = [
    { name: '機能型', level: 0, color: theme === 'dark' ? '#ef4444' : '#dc2626' },
    { name: '弱いマトリックス', level: 1, color: theme === 'dark' ? '#f97316' : '#ea580c' },
    { name: 'バランス型マトリックス', level: 3, color: theme === 'dark' ? '#3b82f6' : '#2563eb' },
    { name: '強いマトリックス', level: 4, color: theme === 'dark' ? '#8b5cf6' : '#7c3aed' },
    { name: 'プロジェクト型', level: 5, color: theme === 'dark' ? '#10b981' : '#059669' },
  ]

  const maxLevel = 5

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3
        className={`mb-6 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        PMの権限レベル比較
      </h3>

      <div className='space-y-4'>
        {authorityData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className='flex items-center'
          >
            <div
              className={`w-32 text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
            >
              {item.name}
            </div>
            <div className='relative mx-4 flex-1'>
              <div
                className={`h-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <motion.div
                  className='flex h-full items-center justify-end rounded-full pr-2'
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.level / maxLevel) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                >
                  <span className='text-xs font-bold text-white'>
                    {item.level}/{maxLevel}
                  </span>
                </motion.div>
              </div>
            </div>
            <div
              className={`w-16 text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {Math.round((item.level / maxLevel) * 100)}%
            </div>
          </motion.div>
        ))}
      </div>

      <div className={`mt-6 rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className='mb-2 flex items-center'>
          <Scale className='mr-2 h-4 w-4 text-blue-500' />
          <span
            className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
          >
            権限レベルの解説
          </span>
        </div>
        <div
          className={`space-y-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <div>• レベル0-1: 機能部門が主導権を持つ</div>
          <div>• レベル2-3: PMと機能部門が権限を分担</div>
          <div>• レベル4-5: PMが強い権限を持つ</div>
        </div>
      </div>
    </div>
  )
}

interface RadarChartProps {
  selectedTypes: string[]
  theme: 'light' | 'dark'
}

const RadarChart: React.FC<RadarChartProps> = ({ selectedTypes, theme }) => {
  const characteristics = [
    { key: 'flexibility', name: '柔軟性', maxValue: 5 },
    { key: 'efficiency', name: '効率性', maxValue: 5 },
    { key: 'specialization', name: '専門性', maxValue: 5 },
    { key: 'integration', name: '統合性', maxValue: 5 },
    { key: 'speed', name: '迅速性', maxValue: 5 },
    { key: 'control', name: '統制力', maxValue: 5 },
  ]

  // 各組織タイプの特性値（0-5スケール）
  const typeValues = {
    functional: {
      flexibility: 2,
      efficiency: 4,
      specialization: 5,
      integration: 2,
      speed: 2,
      control: 5,
    },
    matrix: {
      flexibility: 4,
      efficiency: 3,
      specialization: 4,
      integration: 4,
      speed: 3,
      control: 3,
    },
    projectized: {
      flexibility: 5,
      efficiency: 3,
      specialization: 3,
      integration: 5,
      speed: 5,
      control: 4,
    },
  }

  const typeColors = {
    functional: theme === 'dark' ? '#ef4444' : '#dc2626',
    matrix: theme === 'dark' ? '#3b82f6' : '#2563eb',
    projectized: theme === 'dark' ? '#10b981' : '#059669',
  }

  const typeNames = {
    functional: '機能型',
    matrix: 'マトリックス型',
    projectized: 'プロジェクト型',
  }

  if (selectedTypes.length === 0) {
    return (
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className='text-center'>
          <Radar
            className={`mx-auto mb-4 h-12 w-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
          />
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            組織タイプを選択してレーダーチャートを表示
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3
        className={`mb-6 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        組織特性レーダーチャート
      </h3>

      <div className='relative mx-auto aspect-square w-full max-w-md'>
        <svg width='100%' height='100%' viewBox='0 0 400 400'>
          {/* 背景グリッド */}
          <g transform='translate(200, 200)'>
            {[1, 2, 3, 4, 5].map((level) => (
              <polygon
                key={level}
                points={characteristics
                  .map((_, i) => {
                    const angle = (i * 2 * Math.PI) / characteristics.length - Math.PI / 2
                    const x = Math.cos(angle) * (level * 30)
                    const y = Math.sin(angle) * (level * 30)
                    return `${x},${y}`
                  })
                  .join(' ')}
                fill='none'
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth='1'
              />
            ))}

            {/* 軸線 */}
            {characteristics.map((_, i) => {
              const angle = (i * 2 * Math.PI) / characteristics.length - Math.PI / 2
              const x = Math.cos(angle) * 150
              const y = Math.sin(angle) * 150
              return (
                <line
                  key={i}
                  x1='0'
                  y1='0'
                  x2={x}
                  y2={y}
                  stroke={theme === 'dark' ? '#4b5563' : '#d1d5db'}
                  strokeWidth='1'
                />
              )
            })}

            {/* ラベル */}
            {characteristics.map((char, i) => {
              const angle = (i * 2 * Math.PI) / characteristics.length - Math.PI / 2
              const x = Math.cos(angle) * 170
              const y = Math.sin(angle) * 170
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor='middle'
                  dominantBaseline='middle'
                  className={`text-sm font-medium ${theme === 'dark' ? 'fill-gray-200' : 'fill-gray-800'}`}
                >
                  {char.name}
                </text>
              )
            })}

            {/* データポリゴン */}
            {selectedTypes.map((type) => (
              <motion.polygon
                key={type}
                points={characteristics
                  .map((char, i) => {
                    const angle = (i * 2 * Math.PI) / characteristics.length - Math.PI / 2
                    const value =
                      typeValues[type as keyof typeof typeValues][
                        char.key as keyof typeof typeValues.functional
                      ]
                    const x = Math.cos(angle) * (value * 30)
                    const y = Math.sin(angle) * (value * 30)
                    return `${x},${y}`
                  })
                  .join(' ')}
                fill={typeColors[type as keyof typeof typeColors]}
                fillOpacity='0.3'
                stroke={typeColors[type as keyof typeof typeColors]}
                strokeWidth='2'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
              />
            ))}

            {/* データポイント */}
            {selectedTypes.map((type) =>
              characteristics.map((char, i) => {
                const angle = (i * 2 * Math.PI) / characteristics.length - Math.PI / 2
                const value =
                  typeValues[type as keyof typeof typeValues][
                    char.key as keyof typeof typeValues.functional
                  ]
                const x = Math.cos(angle) * (value * 30)
                const y = Math.sin(angle) * (value * 30)
                return (
                  <motion.circle
                    key={`${type}-${i}`}
                    cx={x}
                    cy={y}
                    r='4'
                    fill={typeColors[type as keyof typeof typeColors]}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                )
              })
            )}
          </g>
        </svg>
      </div>

      {/* 凡例 */}
      <div className='mt-6 flex flex-wrap justify-center gap-4'>
        {selectedTypes.map((type) => (
          <div key={type} className='flex items-center'>
            <div
              className='mr-2 h-4 w-4 rounded'
              style={{ backgroundColor: typeColors[type as keyof typeof typeColors] }}
            />
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              {typeNames[type as keyof typeof typeNames]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RecommendationEngineProps {
  theme: 'light' | 'dark'
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ theme }) => {
  const [projectComplexity, setProjectComplexity] = useState<'low' | 'medium' | 'high'>('medium')
  const [projectDuration, setProjectDuration] = useState<'short' | 'medium' | 'long'>('medium')
  const [resourceAvailability, setResourceAvailability] = useState<
    'limited' | 'shared' | 'dedicated'
  >('shared')
  const [strategicImportance, setStrategicImportance] = useState<
    'routine' | 'important' | 'critical'
  >('important')

  const recommendation = useMemo(() => {
    const criteria = structureComparison.selectionCriteria
    const scores = {
      functional: 0,
      matrix: 0,
      projectized: 0,
    }

    // 各基準に基づいてスコア計算
    const complexityRec = criteria.projectComplexity[projectComplexity]
    const durationRec = criteria.projectDuration[projectDuration]
    const resourceRec = criteria.resourceAvailability[resourceAvailability]
    const importanceRec = criteria.strategicImportance[strategicImportance]

    ;[complexityRec, durationRec, resourceRec, importanceRec].forEach((rec) => {
      scores[rec as keyof typeof scores]++
    })

    const maxScore = Math.max(...Object.values(scores))
    const recommended =
      Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'matrix'

    return {
      type: recommended,
      confidence: Math.round((maxScore / 4) * 100),
      scores,
    }
  }, [projectComplexity, projectDuration, resourceAvailability, strategicImportance])

  const typeNames = {
    functional: '機能型組織',
    matrix: 'マトリックス型組織',
    projectized: 'プロジェクト型組織',
  }

  const typeDescriptions = {
    functional: '安定した環境で専門性を重視する場合に適している',
    matrix: '柔軟性と専門性のバランスが必要な場合に適している',
    projectized: '重要なプロジェクトに集中的に取り組む場合に適している',
  }

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3
        className={`mb-6 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        組織構造推奨エンジン
      </h3>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            プロジェクト特性を選択
          </h4>

          <div>
            <label
              className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              プロジェクト複雑度
            </label>
            <select
              value={projectComplexity}
              onChange={(e) => setProjectComplexity(e.target.value as any)}
              className={`w-full rounded border p-2 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value='low'>低 - 定型的な作業</option>
              <option value='medium'>中 - 標準的なプロジェクト</option>
              <option value='high'>高 - 複雑で革新的</option>
            </select>
          </div>

          <div>
            <label
              className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              プロジェクト期間
            </label>
            <select
              value={projectDuration}
              onChange={(e) => setProjectDuration(e.target.value as any)}
              className={`w-full rounded border p-2 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value='short'>短期 - 3ヶ月以下</option>
              <option value='medium'>中期 - 3-12ヶ月</option>
              <option value='long'>長期 - 12ヶ月以上</option>
            </select>
          </div>

          <div>
            <label
              className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              リソース可用性
            </label>
            <select
              value={resourceAvailability}
              onChange={(e) => setResourceAvailability(e.target.value as any)}
              className={`w-full rounded border p-2 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value='limited'>限定的 - リソース制約が厳しい</option>
              <option value='shared'>共有 - 複数プロジェクトで共有</option>
              <option value='dedicated'>専任 - プロジェクト専任可能</option>
            </select>
          </div>

          <div>
            <label
              className={`mb-2 block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              戦略的重要度
            </label>
            <select
              value={strategicImportance}
              onChange={(e) => setStrategicImportance(e.target.value as any)}
              className={`w-full rounded border p-2 ${
                theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value='routine'>定常業務 - 日常的な取り組み</option>
              <option value='important'>重要 - 事業に影響する</option>
              <option value='critical'>クリティカル - 戦略的に重要</option>
            </select>
          </div>
        </div>

        <div>
          <h4
            className={`mb-4 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
          >
            推奨結果
          </h4>

          <motion.div
            key={recommendation.type}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-lg border-2 p-4 ${
              theme === 'dark'
                ? 'border-green-600 bg-green-900/30'
                : 'border-green-300 bg-green-100'
            }`}
          >
            <div className='mb-2 flex items-center'>
              <CheckCircle className='mr-2 h-5 w-5 text-green-500' />
              <span
                className={`font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}
              >
                推奨: {typeNames[recommendation.type as keyof typeof typeNames]}
              </span>
            </div>
            <p className={`mb-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {typeDescriptions[recommendation.type as keyof typeof typeDescriptions]}
            </p>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              信頼度: {recommendation.confidence}%
            </div>
          </motion.div>

          <div className='mt-4'>
            <h5
              className={`mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
            >
              各組織タイプのスコア
            </h5>
            <div className='space-y-2'>
              {Object.entries(recommendation.scores).map(([type, score]) => (
                <div key={type} className='flex items-center'>
                  <span
                    className={`w-24 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {typeNames[type as keyof typeof typeNames].split('組織')[0]}
                  </span>
                  <div className='mx-2 flex-1'>
                    <div
                      className={`h-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      <motion.div
                        className='h-full rounded bg-blue-500'
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 4) * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {score}/4
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

const OrganizationStructureComparison: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'comparison' | 'authority' | 'radar' | 'recommendation'
  >('comparison')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'functional',
    'matrix',
    'projectized',
  ])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const resetSelection = () => {
    setSelectedTypes(['functional', 'matrix', 'projectized'])
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <div className='container mx-auto px-6 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 text-center'
        >
          <h1
            className={`mb-4 text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            組織構造タイプ比較
          </h1>
          <p
            className={`mx-auto max-w-3xl text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            機能型、マトリックス型、プロジェクト型組織の特徴を詳細に比較し、最適な組織構造を選択できます
          </p>
          <div className='mt-4 flex justify-center'>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'light' ? '🌙 ダークモード' : '☀️ ライトモード'}
            </button>
          </div>
        </motion.div>

        {/* タブナビゲーション */}
        <div className='mb-8 flex justify-center'>
          <div
            className={`inline-flex rounded-xl p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            {[
              { key: 'comparison', label: '比較表', icon: <BarChart3 className='h-5 w-5' /> },
              { key: 'authority', label: '権限レベル', icon: <Scale className='h-5 w-5' /> },
              { key: 'radar', label: 'レーダーチャート', icon: <Radar className='h-5 w-5' /> },
              {
                key: 'recommendation',
                label: '推奨エンジン',
                icon: <Target className='h-5 w-5' />,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 transition-all ${
                  activeTab === tab.key
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className='font-medium'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* タイプ選択フィルター（レーダーチャート用） */}
        {activeTab === 'radar' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Filter
                  className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                />
                <span
                  className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  比較する組織タイプ:
                </span>
                {['functional', 'matrix', 'projectized'].map((type) => (
                  <label key={type} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                      className='mr-2'
                    />
                    <span
                      className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {type === 'functional'
                        ? '機能型'
                        : type === 'matrix'
                          ? 'マトリックス型'
                          : 'プロジェクト型'}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={resetSelection}
                className={`flex items-center rounded px-3 py-1 text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <RotateCcw className='mr-1 h-4 w-4' />
                リセット
              </button>
            </div>
          </motion.div>
        )}

        {/* コンテンツエリア */}
        <AnimatePresence mode='wait'>
          {activeTab === 'comparison' && (
            <motion.div
              key='comparison'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonTable theme={theme} />
            </motion.div>
          )}

          {activeTab === 'authority' && (
            <motion.div
              key='authority'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AuthorityLevelChart theme={theme} />
            </motion.div>
          )}

          {activeTab === 'radar' && (
            <motion.div
              key='radar'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RadarChart selectedTypes={selectedTypes} theme={theme} />
            </motion.div>
          )}

          {activeTab === 'recommendation' && (
            <motion.div
              key='recommendation'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecommendationEngine theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 詳細情報セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-3'
        >
          {Object.entries(organizationalStructureTypes).map(([key, orgType]) => (
            <div
              key={key}
              className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <h3
                className={`mb-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {orgType.name}
              </h3>
              <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {orgType.description}
              </p>

              <div className='space-y-3'>
                <div>
                  <h4
                    className={`font-medium text-green-600 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}
                  >
                    メリット
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    {orgType.advantages.slice(0, 2).map((advantage, index) => (
                      <li
                        key={index}
                        className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        <CheckCircle className='mr-2 h-3 w-3 text-green-500' />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4
                    className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                  >
                    デメリット
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    {orgType.disadvantages.slice(0, 2).map((disadvantage, index) => (
                      <li
                        key={index}
                        className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        <XCircle className='mr-2 h-3 w-3 text-red-500' />
                        {disadvantage}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default OrganizationStructureComparison
