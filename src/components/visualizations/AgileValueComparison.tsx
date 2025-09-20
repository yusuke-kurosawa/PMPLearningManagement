import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Slider } from '../ui/slider'
import {
  Scale,
  RotateCcw,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Users,
  Code,
  Users as Handshake,
  PlayCircle,
} from 'lucide-react'
import { agileManifestoData } from '../../data/pmbok/agileManifestoData'
import type { AgileValue } from '../../data/schemas/pmbok/agileTypes'

interface ValueBalance {
  id: string
  leftValue: number // 0-100, how much emphasis on left side
  rightValue: number // calculated as 100 - leftValue
}

interface Scenario {
  id: string
  name: string
  description: string
  recommendedBalances: ValueBalance[]
  context: string
  outcomes: string[]
}

const AgileValueComparison: React.FC = () => {
  const [currentValues, setCurrentValues] = useState<ValueBalance[]>(
    agileManifestoData.manifesto.values.map((value) => ({
      id: value.id,
      leftValue: 70, // Default Agile-recommended balance
      rightValue: 30,
    }))
  )
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showImpact, setShowImpact] = useState(false)
  const [viewMode, setViewMode] = useState<'balance' | 'radar' | 'scenarios'>('balance')

  const scenarios: Scenario[] = [
    {
      id: 'startup',
      name: 'スタートアップ開発',
      description: '小規模チームでの迅速なプロダクト開発',
      recommendedBalances: [
        { id: 'value-1', leftValue: 85, rightValue: 15 }, // 個人と対話 > プロセス
        { id: 'value-2', leftValue: 90, rightValue: 10 }, // 動くソフトウェア > ドキュメント
        { id: 'value-3', leftValue: 95, rightValue: 5 }, // 顧客協調 > 契約交渉
        { id: 'value-4', leftValue: 80, rightValue: 20 }, // 変化対応 > 計画
      ],
      context: '限られたリソースで迅速な市場投入が求められる環境',
      outcomes: [
        '迅速なフィードバックループ',
        '高い適応性',
        '最小限の官僚制',
        '顧客との密接な関係',
      ],
    },
    {
      id: 'enterprise',
      name: 'エンタープライズ開発',
      description: '大規模組織での規制要件がある開発',
      recommendedBalances: [
        { id: 'value-1', leftValue: 60, rightValue: 40 }, // バランス重視
        { id: 'value-2', leftValue: 65, rightValue: 35 }, // ドキュメントも重要
        { id: 'value-3', leftValue: 70, rightValue: 30 }, // 契約も必要
        { id: 'value-4', leftValue: 55, rightValue: 45 }, // 計画性重視
      ],
      context: 'コンプライアンス要件と安定性が重視される環境',
      outcomes: [
        '適切なドキュメント管理',
        'リスク管理の強化',
        'ステークホルダーの合意',
        '継続的な改善',
      ],
    },
    {
      id: 'research',
      name: '研究開発プロジェクト',
      description: '不確実性の高い革新的な開発',
      recommendedBalances: [
        { id: 'value-1', leftValue: 80, rightValue: 20 }, // 創造性重視
        { id: 'value-2', leftValue: 75, rightValue: 25 }, // 実験重視
        { id: 'value-3', leftValue: 85, rightValue: 15 }, // 密接な協力
        { id: 'value-4', leftValue: 90, rightValue: 10 }, // 高い適応性
      ],
      context: '未知の技術や市場での探索的な開発',
      outcomes: ['革新的なソリューション', '学習の最大化', '実験と失敗の許容', '創造的な問題解決'],
    },
  ]

  const values = agileManifestoData.manifesto.values

  const updateValueBalance = (valueId: string, newLeftValue: number) => {
    setCurrentValues((prev) =>
      prev.map((value) =>
        value.id === valueId
          ? { ...value, leftValue: newLeftValue, rightValue: 100 - newLeftValue }
          : value
      )
    )
  }

  const resetToDefault = () => {
    setIsAnimating(true)
    setCurrentValues((prev) =>
      prev.map((value) => ({
        ...value,
        leftValue: 70,
        rightValue: 30,
      }))
    )
    setTimeout(() => setIsAnimating(false), 500)
  }

  const applyScenario = (scenario: Scenario) => {
    setIsAnimating(true)
    setCurrentValues(scenario.recommendedBalances)
    setSelectedScenario(scenario)
    setTimeout(() => setIsAnimating(false), 800)
  }

  const getValueIcon = (index: number) => {
    const icons = [Users, Code, Handshake, TrendingUp]
    return icons[index]
  }

  const getValueColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
    ]
    return colors[index]
  }

  const getBalanceDescription = (leftValue: number) => {
    if (leftValue >= 80) {
      return '強くアジャイル寄り'
    }
    if (leftValue >= 60) {
      return 'アジャイル寄り'
    }
    if (leftValue >= 40) {
      return 'バランス型'
    }
    if (leftValue >= 20) {
      return '従来型寄り'
    }
    return '強く従来型'
  }

  const getBalanceColor = (leftValue: number) => {
    if (leftValue >= 80) {
      return 'text-green-600 dark:text-green-400'
    }
    if (leftValue >= 60) {
      return 'text-blue-600 dark:text-blue-400'
    }
    if (leftValue >= 40) {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    if (leftValue >= 20) {
      return 'text-orange-600 dark:text-orange-400'
    }
    return 'text-red-600 dark:text-red-400'
  }

  const calculateOverallBalance = () => {
    const average =
      currentValues.reduce((sum, value) => sum + value.leftValue, 0) / currentValues.length
    return Math.round(average)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <div className='mx-auto max-w-7xl space-y-8 p-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='space-y-4 text-center'
      >
        <div className='flex items-center justify-center space-x-3'>
          <div className='rounded-xl bg-gradient-to-r from-purple-500 to-orange-600 p-3'>
            <Scale className='h-8 w-8 text-white' />
          </div>
          <h1 className='bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent'>
            アジャイル価値バランス分析
          </h1>
        </div>
        <p className='mx-auto max-w-3xl text-xl text-muted-foreground'>
          4つのアジャイル価値のバランスを調整し、プロジェクト状況に応じた最適な重み付けを探る
        </p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mx-auto flex w-fit justify-center space-x-1 rounded-lg bg-muted p-1'
      >
        {[
          { key: 'balance', label: 'バランス調整', icon: Scale },
          { key: 'radar', label: 'レーダーチャート', icon: PieChart },
          { key: 'scenarios', label: 'シナリオ比較', icon: Target },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={viewMode === key ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode(key as any)}
            className='flex items-center space-x-2'
          >
            <Icon className='h-4 w-4' />
            <span>{label}</span>
          </Button>
        ))}
      </motion.div>

      <AnimatePresence mode='wait'>
        {/* Balance Mode */}
        {viewMode === 'balance' && (
          <motion.div
            key='balance'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            {/* Overall Balance Summary */}
            <motion.div variants={itemVariants}>
              <Card className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'>
                <CardHeader className='text-center'>
                  <CardTitle className='flex items-center justify-center space-x-2'>
                    <BarChart3 className='h-5 w-5' />
                    <span>全体的なアジャイル度</span>
                  </CardTitle>
                  <div className='space-y-2'>
                    <div className='text-4xl font-bold text-primary'>
                      {calculateOverallBalance()}%
                    </div>
                    <div
                      className={`text-lg font-medium ${getBalanceColor(calculateOverallBalance())}`}
                    >
                      {getBalanceDescription(calculateOverallBalance())}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Controls */}
            <motion.div variants={itemVariants} className='flex justify-center space-x-4'>
              <Button
                onClick={resetToDefault}
                variant='outline'
                className='flex items-center space-x-2'
              >
                <RotateCcw className='h-4 w-4' />
                <span>デフォルトに戻す</span>
              </Button>
              <Button
                onClick={() => setShowImpact(!showImpact)}
                variant='outline'
                className='flex items-center space-x-2'
              >
                <Lightbulb className='h-4 w-4' />
                <span>影響分析を{showImpact ? '隠す' : '表示'}</span>
              </Button>
            </motion.div>

            {/* Value Balance Controls */}
            <motion.div variants={itemVariants} className='space-y-6'>
              {values.map((value, index) => {
                const currentBalance = currentValues.find((v) => v.id === value.id)
                const IconComponent = getValueIcon(index)

                return (
                  <motion.div
                    key={value.id}
                    className={`transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}
                  >
                    <Card>
                      <CardHeader>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`rounded-xl bg-gradient-to-r p-3 ${getValueColor(index)}`}
                          >
                            <IconComponent className='h-6 w-6 text-white' />
                          </div>
                          <div className='flex-1'>
                            <CardTitle className='text-xl'>{value.title}</CardTitle>
                            <CardDescription>{value.subtitle}</CardDescription>
                          </div>
                          <div className='space-y-1 text-right'>
                            <div
                              className={`text-lg font-bold ${getBalanceColor(currentBalance?.leftValue || 70)}`}
                            >
                              {currentBalance?.leftValue || 70}% :{' '}
                              {currentBalance?.rightValue || 30}%
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {getBalanceDescription(currentBalance?.leftValue || 70)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className='space-y-4'>
                        {/* Balance Visualization */}
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span className='font-medium text-green-600'>
                              {value.leftSide.value}
                            </span>
                            <span className='font-medium text-gray-600'>
                              {value.rightSide.value}
                            </span>
                          </div>

                          {/* Visual Balance Bar */}
                          <div className='relative h-8 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700'>
                            <motion.div
                              className='h-full bg-gradient-to-r from-green-500 to-blue-500'
                              initial={{ width: '70%' }}
                              animate={{ width: `${currentBalance?.leftValue || 70}%` }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <ArrowRight className='h-4 w-4 text-white' />
                            </div>
                          </div>

                          {/* Slider Control */}
                          <div className='px-2'>
                            <Slider
                              value={[currentBalance?.leftValue || 70]}
                              onValueChange={(value) => updateValueBalance(value.id, value[0])}
                              max={100}
                              min={0}
                              step={5}
                              className='w-full'
                            />
                          </div>
                        </div>

                        {/* Explanations */}
                        <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                          <div className='rounded-lg bg-green-50 p-3 dark:bg-green-950'>
                            <div className='mb-1 font-medium text-green-800 dark:text-green-200'>
                              重視する価値
                            </div>
                            <div className='text-green-700 dark:text-green-300'>
                              {value.leftSide.explanation}
                            </div>
                          </div>
                          <div className='rounded-lg bg-gray-50 p-3 dark:bg-gray-900'>
                            <div className='mb-1 font-medium text-gray-800 dark:text-gray-200'>
                              従来のアプローチ
                            </div>
                            <div className='text-gray-700 dark:text-gray-300'>
                              {value.rightSide.explanation}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Impact Analysis */}
            <AnimatePresence>
              {showImpact && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className='overflow-hidden'
                >
                  <ImpactAnalysis currentValues={currentValues} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Radar Chart Mode */}
        {viewMode === 'radar' && (
          <motion.div
            key='radar'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <RadarChart currentValues={currentValues} values={values} />
          </motion.div>
        )}

        {/* Scenarios Mode */}
        {viewMode === 'scenarios' && (
          <motion.div
            key='scenarios'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Target className='h-5 w-5' />
                    <span>プロジェクトシナリオ</span>
                  </CardTitle>
                  <CardDescription>
                    異なるプロジェクト状況に応じた推奨バランスを確認できます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    {scenarios.map((scenario) => (
                      <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        isSelected={selectedScenario?.id === scenario.id}
                        onApply={() => applyScenario(scenario)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {selectedScenario && (
              <motion.div variants={itemVariants}>
                <ScenarioDetail scenario={selectedScenario} currentValues={currentValues} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Impact Analysis Component
const ImpactAnalysis: React.FC<{
  currentValues: ValueBalance[]
}> = ({ currentValues }) => {
  const overallBalance =
    currentValues.reduce((sum, value) => sum + value.leftValue, 0) / currentValues.length

  const getImpactAnalysis = () => {
    if (overallBalance >= 80) {
      return {
        style: 'アジャイル重視型',
        strengths: ['迅速な価値提供', '高い適応性', '顧客満足度向上', 'チームの自律性'],
        risks: ['ドキュメント不足', 'プロセスの一貫性欠如', 'スケーラビリティの課題'],
        recommendations: [
          '重要なドキュメントの最小限の維持',
          'チーム間の知識共有強化',
          '基本的なプロセス標準化',
        ],
      }
    } else if (overallBalance >= 60) {
      return {
        style: 'バランス型',
        strengths: ['安定したデリバリー', '適度な文書化', 'リスク管理', '継続的改善'],
        risks: ['意思決定の遅延', 'オーバーヘッドの増加', '革新性の低下'],
        recommendations: [
          '定期的なバランス見直し',
          'コンテキストに応じた調整',
          'チームフィードバックの活用',
        ],
      }
    } else {
      return {
        style: '従来型重視',
        strengths: ['予測可能性', '詳細な文書化', 'プロセス遵守', 'リスク軽減'],
        risks: ['変化への対応遅れ', '顧客価値の見失い', 'チームモチベーション低下'],
        recommendations: ['段階的なアジャイル導入', '顧客フィードバック強化', 'チーム自律性の向上'],
      }
    }
  }

  const analysis = getImpactAnalysis()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <TrendingUp className='h-5 w-5' />
          <span>影響分析</span>
        </CardTitle>
        <CardDescription>現在の設定による影響と推奨事項</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          <div className='text-center'>
            <Badge className='px-4 py-2 text-lg'>{analysis.style}</Badge>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div>
              <h4 className='mb-3 flex items-center space-x-2 font-medium text-green-600'>
                <CheckCircle className='h-4 w-4' />
                <span>強み</span>
              </h4>
              <ul className='space-y-2'>
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500' />
                    <span className='text-sm'>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='mb-3 flex items-center space-x-2 font-medium text-orange-600'>
                <AlertTriangle className='h-4 w-4' />
                <span>リスク</span>
              </h4>
              <ul className='space-y-2'>
                {analysis.risks.map((risk, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500' />
                    <span className='text-sm'>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='mb-3 flex items-center space-x-2 font-medium text-blue-600'>
                <Lightbulb className='h-4 w-4' />
                <span>推奨事項</span>
              </h4>
              <ul className='space-y-2'>
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500' />
                    <span className='text-sm'>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Radar Chart Component (simplified visualization)
const RadarChart: React.FC<{
  currentValues: ValueBalance[]
  values: AgileValue[]
}> = ({ currentValues, values }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <PieChart className='h-5 w-5' />
          <span>バランス可視化</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-8'>
          {values.map((value, index) => {
            const balance = currentValues.find((v) => v.id === value.id)
            return (
              <div key={value.id} className='space-y-3'>
                <div className='text-center'>
                  <h4 className='font-medium'>{value.title}</h4>
                  <div className='text-2xl font-bold text-primary'>{balance?.leftValue || 70}%</div>
                </div>
                <div className='h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-full bg-gradient-to-r from-green-500 to-blue-500'
                    style={{ width: `${balance?.leftValue || 70}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Scenario Card Component
const ScenarioCard: React.FC<{
  scenario: Scenario
  isSelected: boolean
  onApply: () => void
}> = ({ scenario, isSelected, onApply }) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'
      }`}
    >
      <CardHeader>
        <CardTitle className='text-lg'>{scenario.name}</CardTitle>
        <CardDescription className='text-sm'>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <p className='text-sm text-muted-foreground'>{scenario.context}</p>
          <Button
            onClick={onApply}
            size='sm'
            className='w-full'
            variant={isSelected ? 'default' : 'outline'}
          >
            <PlayCircle className='mr-2 h-4 w-4' />
            {isSelected ? '適用済み' : 'このシナリオを適用'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Scenario Detail Component
const ScenarioDetail: React.FC<{
  scenario: Scenario
  currentValues: ValueBalance[]
}> = ({ scenario, currentValues }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{scenario.name}の詳細分析</CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div>
          <h4 className='mb-2 font-medium'>コンテキスト</h4>
          <p className='text-muted-foreground'>{scenario.context}</p>
        </div>

        <div>
          <h4 className='mb-3 font-medium'>期待される成果</h4>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {scenario.outcomes.map((outcome, index) => (
              <div key={index} className='flex items-start space-x-2'>
                <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                <span className='text-sm'>{outcome}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className='mb-3 font-medium'>推奨バランス設定</h4>
          <div className='space-y-3'>
            {scenario.recommendedBalances.map((balance, index) => {
              const value = agileManifestoData.manifesto.values.find((v) => v.id === balance.id)
              const current = currentValues.find((v) => v.id === balance.id)
              const isMatched = Math.abs((current?.leftValue || 70) - balance.leftValue) <= 5

              return (
                <div
                  key={balance.id}
                  className='flex items-center justify-between rounded-lg bg-muted p-3'
                >
                  <span className='font-medium'>{value?.title}</span>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm'>
                      推奨: {balance.leftValue}% - 現在: {current?.leftValue || 70}%
                    </span>
                    {isMatched ? (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    ) : (
                      <AlertTriangle className='h-4 w-4 text-orange-500' />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AgileValueComparison
