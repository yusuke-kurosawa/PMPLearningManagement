/**
 * テーラリング・ガイド
 * 3つのテーラリングレベルのインタラクティブな学習コンポーネント
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import {
  Settings,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  Target,
  Workflow,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit,
  Shuffle,
  AlignLeft,
  RefreshCw,
  Clock,
  Building,
} from 'lucide-react'
import { tailoringFramework } from '../../data/pmbok/agileMindsetData.js'

interface ProjectContext {
  projectType: string
  complexity: 'low' | 'medium' | 'high'
  teamSize: 'small' | 'medium' | 'large'
  stakeholderInvolvement: 'limited' | 'moderate' | 'high'
  requirements: 'stable' | 'evolving' | 'unclear'
  timeline: 'short' | 'medium' | 'long'
  riskLevel: 'low' | 'medium' | 'high'
}

interface TailoringRecommendation {
  approach: 'predictive' | 'agile' | 'hybrid'
  confidence: number
  rationale: string[]
  keyConsiderations: string[]
  suggestedPractices: string[]
}

const TailoringGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [expandedAction, setExpandedAction] = useState<string | null>(null)
  const [projectContext, setProjectContext] = useState<ProjectContext>({
    projectType: '',
    complexity: 'medium',
    teamSize: 'medium',
    stakeholderInvolvement: 'moderate',
    requirements: 'evolving',
    timeline: 'medium',
    riskLevel: 'medium',
  })
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)

  const { definition, continuousTailoring, levels } = tailoringFramework

  // テーラリング推奨の計算
  const calculateRecommendation = useCallback((): TailoringRecommendation => {
    let agileScore = 0
    let predictiveScore = 0

    // スコア計算ロジック
    if (projectContext.requirements === 'unclear' || projectContext.requirements === 'evolving') {
      agileScore += 2
    }
    if (projectContext.requirements === 'stable') {
      predictiveScore += 2
    }

    if (projectContext.complexity === 'high') {
      agileScore += 1
    }
    if (projectContext.complexity === 'low') {
      predictiveScore += 1
    }

    if (projectContext.stakeholderInvolvement === 'high') {
      agileScore += 2
    }
    if (projectContext.stakeholderInvolvement === 'limited') {
      predictiveScore += 1
    }

    if (projectContext.riskLevel === 'high') {
      agileScore += 1
    }
    if (projectContext.riskLevel === 'low') {
      predictiveScore += 1
    }

    if (projectContext.teamSize === 'small') {
      agileScore += 1
    }
    if (projectContext.teamSize === 'large') {
      predictiveScore += 1
    }

    const totalScore = agileScore + predictiveScore
    const agilePercentage = totalScore > 0 ? (agileScore / totalScore) * 100 : 50

    let approach: 'predictive' | 'agile' | 'hybrid'
    let confidence: number
    let rationale: string[]
    let keyConsiderations: string[]
    let suggestedPractices: string[]

    if (agilePercentage >= 70) {
      approach = 'agile'
      confidence = agilePercentage
      rationale = [
        '要求事項の変化が頻繁',
        '高いステークホルダー関与',
        '短いフィードバックサイクルが有効',
      ]
      keyConsiderations = [
        'チームのアジャイル経験確認',
        'ステークホルダーの継続的関与確保',
        '技術的自動化の投資',
      ]
      suggestedPractices = [
        'スプリント計画',
        'デイリースタンドアップ',
        '継続的統合・デプロイ',
        'レトロスペクティブ',
      ]
    } else if (agilePercentage <= 30) {
      approach = 'predictive'
      confidence = 100 - agilePercentage
      rationale = ['要求事項が明確で安定', '低リスクプロジェクト', '従来型プロセスが適合']
      keyConsiderations = ['詳細な事前計画の重要性', '変更管理プロセスの確立', '品質保証活動の強化']
      suggestedPractices = [
        'ウォーターフォール型フェーズ',
        '詳細な要求分析',
        'フォーマルなレビュープロセス',
        '包括的なテスト計画',
      ]
    } else {
      approach = 'hybrid'
      confidence = 100 - Math.abs(50 - agilePercentage) * 2
      rationale = ['部分的に予測可能な要求事項', '混合的なプロジェクト特性', '段階的な適応が最適']
      keyConsiderations = [
        'フェーズ毎のアプローチ選択',
        'チーム能力の段階的向上',
        'ガバナンス要求との調整',
      ]
      suggestedPractices = [
        '予測型計画 + アジャイル実行',
        '段階的な価値提供',
        'リスクベースの意思決定',
        '適応的なガバナンス',
      ]
    }

    return {
      approach,
      confidence,
      rationale,
      keyConsiderations,
      suggestedPractices,
    }
  }, [projectContext])

  const handleRecommendationSubmit = () => {
    setShowRecommendation(true)
  }

  const toggleActionExpansion = (actionId: string) => {
    setExpandedAction(expandedAction === actionId ? null : actionId)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case '追加 (Add)':
        return <Plus className='h-5 w-5 text-green-600' />
      case '修正 (Modify)':
        return <Edit className='h-5 w-5 text-blue-600' />
      case '削除 (Remove)':
        return <Minus className='h-5 w-5 text-red-600' />
      case '融合 (Combine)':
        return <Shuffle className='h-5 w-5 text-purple-600' />
      case '調整 (Align)':
        return <AlignLeft className='h-5 w-5 text-orange-600' />
      default:
        return <Settings className='h-5 w-5' />
    }
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* ヘッダー */}
      <div className='space-y-4 text-center'>
        <motion.h1
          className='text-4xl font-bold text-gray-900 dark:text-white'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Settings className='mr-3 inline-block text-blue-600' size={40} />
          テーラリング実践ガイド
        </motion.h1>
        <motion.p
          className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          プロジェクト固有のコンテキストに合わせた最適なテーラリング戦略を学習しましょう
        </motion.p>
      </div>

      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>概要</TabsTrigger>
          <TabsTrigger value='levels'>3つのレベル</TabsTrigger>
          <TabsTrigger value='continuous'>継続的テーラリング</TabsTrigger>
          <TabsTrigger value='recommendation'>推奨エンジン</TabsTrigger>
        </TabsList>

        {/* 概要 */}
        <TabsContent value='overview' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Target className='mr-2 text-blue-600' />
                  テーラリングとは
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div>
                    <h4 className='mb-2 font-semibold text-green-700 dark:text-green-300'>
                      What - 何を
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{definition.what}</p>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-blue-700 dark:text-blue-300'>
                      Why - なぜ
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{definition.why}</p>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-orange-700 dark:text-orange-300'>
                      When - いつ
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{definition.when}</p>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-purple-700 dark:text-purple-300'>
                      Who - 誰が
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>{definition.who}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>テーラリングの3つのレベル</CardTitle>
                <CardDescription>段階的なテーラリングアプローチ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {levels.map((level, index) => (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    >
                      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50'>
                        <span className='text-xl font-bold text-blue-600'>{level.level}</span>
                      </div>
                      <div className='flex-grow'>
                        <h4 className='text-lg font-semibold'>{level.title}</h4>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {level.description}
                        </p>
                      </div>
                      <ArrowRight className='text-gray-400' size={20} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 3つのレベル */}
        <TabsContent value='levels' className='space-y-6'>
          <div className='space-y-6'>
            {levels.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedLevel === level.level
                      ? 'shadow-lg ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setSelectedLevel(selectedLevel === level.level ? null : level.level)
                  }
                >
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Badge variant='outline' className='mr-3'>
                          レベル {level.level}
                        </Badge>
                        {level.title}
                      </span>
                      {selectedLevel === level.level ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>

                  <AnimatePresence>
                    {selectedLevel === level.level && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className='space-y-6'>
                          {/* レベル1: アプローチ選定 */}
                          {level.level === 1 && level.components && (
                            <div className='space-y-6'>
                              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>プロダクトの知識</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className='space-y-1 text-sm'>
                                      {level.components.productKnowledge.factors.map(
                                        (factor, idx) => (
                                          <li key={idx} className='flex items-start'>
                                            <CheckCircle
                                              className='mr-2 mt-0.5 text-green-500'
                                              size={12}
                                            />
                                            {factor}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className='text-lg'>
                                      デリバリー・ケイデンス
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className='space-y-1 text-sm'>
                                      {level.components.deliveryCadence.factors.map(
                                        (factor, idx) => (
                                          <li key={idx} className='flex items-start'>
                                            <CheckCircle
                                              className='mr-2 mt-0.5 text-blue-500'
                                              size={12}
                                            />
                                            {factor}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </CardContent>
                                </Card>
                              </div>

                              <Card>
                                <CardHeader>
                                  <CardTitle className='text-lg'>
                                    アプローチ選択マトリックス
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className='overflow-x-auto'>
                                    <table className='w-full table-auto'>
                                      <thead>
                                        <tr className='border-b'>
                                          <th className='p-3 text-left font-semibold'>要因</th>
                                          <th className='p-3 text-left font-semibold text-orange-700'>
                                            予測型
                                          </th>
                                          <th className='p-3 text-left font-semibold text-green-700'>
                                            アジャイル
                                          </th>
                                          <th className='p-3 text-left font-semibold text-blue-700'>
                                            ハイブリッド
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {level.components.selectionCriteria.decisionMatrix.map(
                                          (row, idx) => (
                                            <tr
                                              key={idx}
                                              className='border-b hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                            >
                                              <td className='p-3 font-medium'>{row.factor}</td>
                                              <td className='p-3 text-sm'>{row.predictive}</td>
                                              <td className='p-3 text-sm'>{row.agile}</td>
                                              <td className='p-3 text-sm'>{row.hybrid}</td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}

                          {/* レベル2: プロセステーラリング */}
                          {level.level === 2 && level.tailoringActions && (
                            <div className='space-y-4'>
                              {level.tailoringActions.map((action, idx) => (
                                <Card key={idx}>
                                  <CardHeader
                                    className='cursor-pointer'
                                    onClick={() => toggleActionExpansion(`level2-action-${idx}`)}
                                  >
                                    <CardTitle className='flex items-center justify-between text-lg'>
                                      <span className='flex items-center'>
                                        {getActionIcon(action.action)}
                                        <span className='ml-2'>{action.action}</span>
                                      </span>
                                      {expandedAction === `level2-action-${idx}` ? (
                                        <ChevronUp size={20} />
                                      ) : (
                                        <ChevronDown size={20} />
                                      )}
                                    </CardTitle>
                                    <CardDescription>{action.description}</CardDescription>
                                  </CardHeader>

                                  <AnimatePresence>
                                    {expandedAction === `level2-action-${idx}` && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <CardContent className='space-y-4'>
                                          <div>
                                            <h5 className='mb-2 font-semibold'>実例</h5>
                                            <ul className='space-y-1'>
                                              {action.examples.map((example, exIdx) => (
                                                <li
                                                  key={exIdx}
                                                  className='flex items-start text-sm'
                                                >
                                                  <Badge
                                                    variant='outline'
                                                    className='mr-2 mt-0.5 text-xs'
                                                  >
                                                    {exIdx + 1}
                                                  </Badge>
                                                  {example}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>

                                          {action.considerations && (
                                            <div>
                                              <h5 className='mb-2 font-semibold'>考慮事項</h5>
                                              <ul className='space-y-1'>
                                                {action.considerations.map(
                                                  (consideration, conIdx) => (
                                                    <li
                                                      key={conIdx}
                                                      className='text-sm text-gray-600 dark:text-gray-400'
                                                    >
                                                      • {consideration}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                        </CardContent>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Card>
                              ))}
                            </div>
                          )}

                          {/* レベル3: 実務慣行テーラリング */}
                          {level.level === 3 && level.tailoringDimensions && (
                            <div className='space-y-6'>
                              {level.tailoringDimensions.map((dimension, idx) => (
                                <Card key={idx}>
                                  <CardHeader>
                                    <CardTitle className='flex items-center'>
                                      <Building className='mr-2 text-purple-600' size={20} />
                                      {dimension.dimension}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className='space-y-4'>
                                    {dimension.adjustments && (
                                      <div>
                                        <h5 className='mb-3 font-semibold'>環境別調整例</h5>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                          {dimension.adjustments.map((adjustment, adjIdx) => (
                                            <Card
                                              key={adjIdx}
                                              className='border-l-4 border-l-blue-500'
                                            >
                                              <CardHeader className='pb-2'>
                                                <CardTitle className='text-sm'>
                                                  {adjustment.factor}
                                                </CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <ul className='space-y-1'>
                                                  {adjustment.practices.map(
                                                    (practice, practiceIdx) => (
                                                      <li
                                                        key={practiceIdx}
                                                        className='flex items-start text-xs'
                                                      >
                                                        <CheckCircle
                                                          className='mr-1 mt-0.5 text-green-500'
                                                          size={10}
                                                        />
                                                        {practice}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </CardContent>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {dimension.adaptationStrategies && (
                                      <div>
                                        <h5 className='mb-3 font-semibold'>文化適応戦略</h5>
                                        <div className='space-y-3'>
                                          {dimension.adaptationStrategies.map(
                                            (strategy, stratIdx) => (
                                              <div
                                                key={stratIdx}
                                                className='rounded border-l-4 border-l-purple-500 bg-purple-50 p-3 dark:bg-purple-900/20'
                                              >
                                                <h6 className='mb-2 text-sm font-medium'>
                                                  {strategy.culture}
                                                </h6>
                                                <ul className='space-y-1'>
                                                  {strategy.strategies.map(
                                                    (strategyItem, itemIdx) => (
                                                      <li
                                                        key={itemIdx}
                                                        className='text-xs text-gray-600 dark:text-gray-400'
                                                      >
                                                        • {strategyItem}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 継続的テーラリング */}
        <TabsContent value='continuous' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <RefreshCw className='mr-2 text-blue-600' />
                  {continuousTailoring.title}
                </CardTitle>
                <CardDescription>{continuousTailoring.description}</CardDescription>
              </CardHeader>
            </Card>

            {/* フェーズビューアー */}
            <Card>
              <CardHeader>
                <CardTitle>テーラリングサイクル</CardTitle>
                <CardDescription>プロジェクト全体を通じた継続的適応プロセス</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='mb-6 flex justify-center space-x-2'>
                    {continuousTailoring.phases.map((_, index) => (
                      <Button
                        key={index}
                        variant={currentPhase === index ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setCurrentPhase(index)}
                        className='h-10 w-10 rounded-full'
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentPhase}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className='space-y-4'
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className='flex items-center'>
                            <Clock className='mr-2 text-blue-600' size={20} />
                            {continuousTailoring.phases[currentPhase].phase}
                          </CardTitle>
                          <CardDescription>
                            タイミング: {continuousTailoring.phases[currentPhase].timing}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <h5 className='mb-3 font-semibold'>主要活動</h5>
                          <ul className='space-y-2'>
                            {continuousTailoring.phases[currentPhase].activities.map(
                              (activity, idx) => (
                                <li key={idx} className='flex items-start'>
                                  <CheckCircle className='mr-2 mt-0.5 text-green-500' size={16} />
                                  <span className='text-sm'>{activity}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>

                  <div className='mt-6 flex justify-between'>
                    <Button
                      variant='outline'
                      onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
                      disabled={currentPhase === 0}
                    >
                      前のフェーズ
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setCurrentPhase(
                          Math.min(continuousTailoring.phases.length - 1, currentPhase + 1)
                        )
                      }
                      disabled={currentPhase === continuousTailoring.phases.length - 1}
                    >
                      次のフェーズ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* テーラリングトリガー */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <AlertTriangle className='mr-2 text-orange-600' />
                  テーラリングトリガー
                </CardTitle>
                <CardDescription>テーラリングを実施すべき状況の指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {continuousTailoring.triggers.map((trigger, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20'
                    >
                      <div className='flex items-start'>
                        <AlertTriangle className='mr-2 mt-0.5 text-orange-600' size={16} />
                        <span className='text-sm'>{trigger}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 推奨エンジン */}
        <TabsContent value='recommendation' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Lightbulb className='mr-2 text-blue-600' />
                  プロジェクト コンテキスト分析
                </CardTitle>
                <CardDescription>
                  プロジェクトの特性を入力して、最適なテーラリングアプローチを決定しましょう
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium'>要求事項の安定性</label>
                      <div className='space-x-2'>
                        {['stable', 'evolving', 'unclear'].map((value) => (
                          <Button
                            key={value}
                            variant={projectContext.requirements === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({ ...prev, requirements: value as any }))
                            }
                          >
                            {value === 'stable' ? '安定' : value === 'evolving' ? '進化' : '不明確'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>プロジェクト複雑度</label>
                      <div className='space-x-2'>
                        {['low', 'medium', 'high'].map((value) => (
                          <Button
                            key={value}
                            variant={projectContext.complexity === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({ ...prev, complexity: value as any }))
                            }
                          >
                            {value === 'low' ? '低' : value === 'medium' ? '中' : '高'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>チームサイズ</label>
                      <div className='space-x-2'>
                        {['small', 'medium', 'large'].map((value) => (
                          <Button
                            key={value}
                            variant={projectContext.teamSize === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({ ...prev, teamSize: value as any }))
                            }
                          >
                            {value === 'small' ? '小' : value === 'medium' ? '中' : '大'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium'>
                        ステークホルダー関与度
                      </label>
                      <div className='space-x-2'>
                        {['limited', 'moderate', 'high'].map((value) => (
                          <Button
                            key={value}
                            variant={
                              projectContext.stakeholderInvolvement === value
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({
                                ...prev,
                                stakeholderInvolvement: value as any,
                              }))
                            }
                          >
                            {value === 'limited'
                              ? '限定的'
                              : value === 'moderate'
                                ? '適度'
                                : '高い'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>リスクレベル</label>
                      <div className='space-x-2'>
                        {['low', 'medium', 'high'].map((value) => (
                          <Button
                            key={value}
                            variant={projectContext.riskLevel === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({ ...prev, riskLevel: value as any }))
                            }
                          >
                            {value === 'low' ? '低' : value === 'medium' ? '中' : '高'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium'>タイムライン</label>
                      <div className='space-x-2'>
                        {['short', 'medium', 'long'].map((value) => (
                          <Button
                            key={value}
                            variant={projectContext.timeline === value ? 'default' : 'outline'}
                            size='sm'
                            onClick={() =>
                              setProjectContext((prev) => ({ ...prev, timeline: value as any }))
                            }
                          >
                            {value === 'short' ? '短期' : value === 'medium' ? '中期' : '長期'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-4'>
                  <Button onClick={handleRecommendationSubmit} className='w-full'>
                    推奨アプローチを取得
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 推奨結果 */}
            <AnimatePresence>
              {showRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center'>
                        <Target className='mr-2 text-green-600' />
                        推奨テーラリングアプローチ
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {(() => {
                        const recommendation = calculateRecommendation()
                        return (
                          <>
                            <div className='space-y-2 text-center'>
                              <div className='text-3xl font-bold text-blue-600'>
                                {recommendation.approach === 'agile'
                                  ? 'アジャイル'
                                  : recommendation.approach === 'predictive'
                                    ? '予測型'
                                    : 'ハイブリッド'}
                              </div>
                              <div className='text-lg text-gray-600 dark:text-gray-400'>
                                信頼度: {recommendation.confidence.toFixed(1)}%
                              </div>
                              <Progress value={recommendation.confidence} className='w-full' />
                            </div>

                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                              <div>
                                <h4 className='mb-2 font-semibold text-blue-700 dark:text-blue-300'>
                                  根拠
                                </h4>
                                <ul className='space-y-1'>
                                  {recommendation.rationale.map((reason, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <CheckCircle
                                        className='mr-2 mt-0.5 text-green-500'
                                        size={12}
                                      />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className='mb-2 font-semibold text-orange-700 dark:text-orange-300'>
                                  主要考慮事項
                                </h4>
                                <ul className='space-y-1'>
                                  {recommendation.keyConsiderations.map((consideration, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <AlertTriangle
                                        className='mr-2 mt-0.5 text-orange-500'
                                        size={12}
                                      />
                                      {consideration}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className='mb-2 font-semibold text-purple-700 dark:text-purple-300'>
                                  推奨プラクティス
                                </h4>
                                <ul className='space-y-1'>
                                  {recommendation.suggestedPractices.map((practice, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <Lightbulb
                                        className='mr-2 mt-0.5 text-purple-500'
                                        size={12}
                                      />
                                      {practice}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className='pt-4'>
                              <Button
                                onClick={() => setShowRecommendation(false)}
                                variant='outline'
                                className='w-full'
                              >
                                新しい分析を開始
                              </Button>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TailoringGuide
