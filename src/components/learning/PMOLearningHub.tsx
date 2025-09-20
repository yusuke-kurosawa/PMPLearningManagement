/**
 * PMOLearningHub.tsx
 * PMOタイプとACoEを学習するためのメインコンポーネント
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Shield,
  Command,
  Zap,
  BookOpen,
  Target,
  CheckCircle,
  TrendingUp,
  Star,
  ArrowRight,
  Play,
  Info,
  Filter,
  Search,
} from 'lucide-react'

// UIコンポーネント
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'

// 子コンポーネント
import PMOComparisonChart from '../visualizations/PMOComparisonChart'
import PMOTypeSelector from './PMOTypeSelector'

// データとタイプ
import {
  pmoData,
  getAllPMOTypes,
  getPMOComparison,
  getPMOMaturityModel,
} from '../../data/pmbok/pmoData.js'
import type {
  PMOTypeDefinition,
  PMOComparison,
  PMOMaturityLevel,
} from '../../data/schemas/pmbok/pmoTypes'

// PMOタイプごとのアイコンとカラー設定
const PMO_CONFIG = {
  supportive: {
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    gradient: 'from-blue-500 to-blue-600',
  },
  controlling: {
    icon: Shield,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  directive: {
    icon: Command,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    gradient: 'from-red-500 to-red-600',
  },
  acoe: {
    icon: Zap,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    gradient: 'from-green-500 to-green-600',
  },
}

interface PMOLearningHubProps {
  className?: string
}

const PMOLearningHub: React.FC<PMOLearningHubProps> = ({ className = '' }) => {
  // 状態管理
  const [selectedPMOType, setSelectedPMOType] = useState<string>('supportive')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [learningProgress, setLearningProgress] = useState<Record<string, boolean>>({})

  // データの取得
  const pmoTypes = useMemo(() => getAllPMOTypes(), [])
  const comparisonData = useMemo(() => getPMOComparison(), [])
  const maturityModel = useMemo(() => getPMOMaturityModel(), [])

  // 選択されたPMOタイプの詳細
  const selectedPMO = useMemo(
    () => pmoTypes.find((pmo) => pmo.type === selectedPMOType),
    [pmoTypes, selectedPMOType]
  )

  // フィルタリングされた責任・役割
  const filteredResponsibilities = useMemo(() => {
    if (!selectedPMO) {
      return []
    }

    let filtered = selectedPMO.responsibilities

    if (searchTerm) {
      filtered = filtered.filter(
        (resp) =>
          resp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resp.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((resp) => resp.category === selectedCategory)
    }

    return filtered
  }, [selectedPMO, searchTerm, selectedCategory])

  // 学習進捗の更新
  const toggleProgress = (itemId: string) => {
    setLearningProgress((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // カテゴリ一覧の取得
  const categories = useMemo(() => {
    if (!selectedPMO) {
      return []
    }
    const cats = [...new Set(selectedPMO.responsibilities.map((r) => r.category))]
    return cats
  }, [selectedPMO])

  // 進捗率の計算
  const progressPercentage = useMemo(() => {
    if (!selectedPMO) {
      return 0
    }
    const totalItems = selectedPMO.responsibilities.length
    const completedItems = selectedPMO.responsibilities.filter((r) => learningProgress[r.id]).length
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0
  }, [selectedPMO, learningProgress])

  if (!selectedPMO) {
    return (
      <Alert>
        <Info className='h-4 w-4' />
        <AlertDescription>PMOデータの読み込み中です...</AlertDescription>
      </Alert>
    )
  }

  const config = PMO_CONFIG[selectedPMO.type as keyof typeof PMO_CONFIG]
  const IconComponent = config.icon

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダーセクション */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-4 text-center'
      >
        <div className='flex items-center justify-center space-x-3'>
          <div className={`rounded-full p-3 ${config.color} text-white`}>
            <IconComponent className='h-8 w-8' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>PMO学習ハブ</h1>
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              PMOタイプとACoEの包括的学習プラットフォーム
            </p>
          </div>
        </div>

        {/* 学習進捗 */}
        <div className='mx-auto max-w-md'>
          <div className='mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
            <span>学習進捗</span>
            <span>{Math.round(progressPercentage)}%完了</span>
          </div>
          <Progress value={progressPercentage} className='h-2' />
        </div>
      </motion.div>

      {/* PMOタイプ選択カード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Target className='h-5 w-5' />
              <span>PMOタイプ選択</span>
            </CardTitle>
            <CardDescription>学習したいPMOタイプを選択してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {pmoTypes.map((pmo) => {
                const pmoConfig = PMO_CONFIG[pmo.type as keyof typeof PMO_CONFIG]
                const PmoIcon = pmoConfig.icon
                const isSelected = selectedPMOType === pmo.type

                return (
                  <motion.div
                    key={pmo.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? `${pmoConfig.borderColor} border-2 ${pmoConfig.lightColor}`
                          : 'border hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPMOType(pmo.type)}
                    >
                      <CardContent className='p-4 text-center'>
                        <div
                          className={`mx-auto mb-3 w-fit rounded-full p-3 ${pmoConfig.color} text-white`}
                        >
                          <PmoIcon className='h-6 w-6' />
                        </div>
                        <h3 className='mb-1 text-sm font-semibold'>{pmo.japanName}</h3>
                        <p className='text-xs leading-relaxed text-gray-600 dark:text-gray-400'>
                          {pmo.description.slice(0, 80)}...
                        </p>
                        <Badge variant={isSelected ? 'default' : 'secondary'} className='mt-2'>
                          {pmo.controlLevel}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* メインコンテンツ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='overview'>概要</TabsTrigger>
            <TabsTrigger value='responsibilities'>責任・役割</TabsTrigger>
            <TabsTrigger value='best-practices'>ベストプラクティス</TabsTrigger>
            <TabsTrigger value='comparison'>比較</TabsTrigger>
            <TabsTrigger value='maturity'>成熟度モデル</TabsTrigger>
            <TabsTrigger value='selector'>推奨選択</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value='overview' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <IconComponent className='h-5 w-5' />
                  <span>{selectedPMO.japanName} - 概要</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <p className='leading-relaxed text-gray-700 dark:text-gray-300'>
                  {selectedPMO.description}
                </p>

                {/* 特性 */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>主要特性</h3>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {Object.entries(selectedPMO.characteristics).map(([key, value]) => (
                      <div
                        key={key}
                        className='flex items-start space-x-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'
                      >
                        <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-500' />
                        <div>
                          <div className='font-medium capitalize'>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className='text-sm text-gray-600 dark:text-gray-400'>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* メリット・デメリット */}
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <div>
                    <h3 className='mb-4 text-lg font-semibold text-green-700 dark:text-green-400'>
                      メリット
                    </h3>
                    <ul className='space-y-2'>
                      {selectedPMO.advantages.map((advantage, index) => (
                        <li key={index} className='flex items-start space-x-2'>
                          <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                          <span className='text-sm'>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className='mb-4 text-lg font-semibold text-orange-700 dark:text-orange-400'>
                      デメリット・課題
                    </h3>
                    <ul className='space-y-2'>
                      {selectedPMO.disadvantages.map((disadvantage, index) => (
                        <li key={index} className='flex items-start space-x-2'>
                          <Info className='mt-1 h-4 w-4 flex-shrink-0 text-orange-500' />
                          <span className='text-sm'>{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 適用シナリオ */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>適用シナリオ</h3>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                    {selectedPMO.applicableScenarios.map((scenario, index) => (
                      <Badge key={index} variant='outline' className='justify-start p-2'>
                        {scenario}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 責任・役割タブ */}
          <TabsContent value='responsibilities' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>責任・役割</CardTitle>
                <CardDescription>
                  {selectedPMO.japanName}の主要な責任と役割を学習します
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* フィルター */}
                <div className='flex flex-col gap-4 sm:flex-row'>
                  <div className='flex-1'>
                    <Label htmlFor='search'>検索</Label>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                      <Input
                        id='search'
                        placeholder='責任・役割を検索...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10'
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='category'>カテゴリ</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='カテゴリを選択' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>すべて</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 責任・役割リスト */}
                <div className='space-y-4'>
                  <AnimatePresence>
                    {filteredResponsibilities.map((responsibility, index) => (
                      <motion.div
                        key={responsibility.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className='transition-shadow hover:shadow-md'>
                          <CardContent className='p-4'>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-start space-x-3'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => toggleProgress(responsibility.id)}
                                    className={`p-1 ${
                                      learningProgress[responsibility.id]
                                        ? 'text-green-600'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    <CheckCircle className='h-5 w-5' />
                                  </Button>
                                  <div className='flex-1'>
                                    <h4 className='text-lg font-semibold'>
                                      {responsibility.title}
                                    </h4>
                                    <p className='mt-1 leading-relaxed text-gray-600 dark:text-gray-400'>
                                      {responsibility.description}
                                    </p>
                                    <div className='mt-3 flex items-center space-x-2'>
                                      <Badge variant='secondary'>{responsibility.category}</Badge>
                                      <Badge
                                        variant={
                                          responsibility.priority === 'high'
                                            ? 'destructive'
                                            : responsibility.priority === 'medium'
                                              ? 'default'
                                              : 'outline'
                                        }
                                      >
                                        {responsibility.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredResponsibilities.length === 0 && (
                  <div className='py-8 text-center text-gray-500 dark:text-gray-400'>
                    検索条件に一致する項目が見つかりません
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ベストプラクティスタブ */}
          <TabsContent value='best-practices' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>ベストプラクティス</CardTitle>
                <CardDescription>
                  {selectedPMO.japanName}の実装と運用のベストプラクティス
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {selectedPMO.bestPractices.map((practice, index) => (
                    <motion.div
                      key={practice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className='border-l-4'
                        style={{ borderLeftColor: config.color.replace('bg-', '#') }}
                      >
                        <CardContent className='p-6'>
                          <h3 className='mb-3 text-xl font-semibold'>{practice.title}</h3>
                          <p className='mb-4 leading-relaxed text-gray-700 dark:text-gray-300'>
                            {practice.description}
                          </p>

                          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            <div>
                              <h4 className='mb-3 font-semibold text-green-700 dark:text-green-400'>
                                実装方法
                              </h4>
                              <ul className='space-y-2'>
                                {practice.implementation.map((impl, i) => (
                                  <li key={i} className='flex items-start space-x-2'>
                                    <ArrowRight className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
                                    <span className='text-sm'>{impl}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className='mb-3 font-semibold text-blue-700 dark:text-blue-400'>
                                期待効果
                              </h4>
                              <ul className='space-y-2'>
                                {practice.benefits.map((benefit, i) => (
                                  <li key={i} className='flex items-start space-x-2'>
                                    <Star className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
                                    <span className='text-sm'>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className='mt-6 border-t pt-4'>
                            <h4 className='mb-3 font-semibold text-gray-700 dark:text-gray-300'>
                              適用コンテキスト
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {practice.applicableContexts.map((context, i) => (
                                <Badge key={i} variant='outline'>
                                  {context}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 比較タブ */}
          <TabsContent value='comparison'>
            <PMOComparisonChart data={comparisonData} />
          </TabsContent>

          {/* 成熟度モデルタブ */}
          <TabsContent value='maturity' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>PMO成熟度モデル</CardTitle>
                <CardDescription>
                  組織のプロジェクトマネジメント成熟度レベルと発展段階
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {maturityModel.map((level, index) => (
                    <motion.div
                      key={level.level}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`border-l-4 ${
                          level.level === 1
                            ? 'border-l-red-400'
                            : level.level === 2
                              ? 'border-l-orange-400'
                              : level.level === 3
                                ? 'border-l-yellow-400'
                                : level.level === 4
                                  ? 'border-l-blue-400'
                                  : 'border-l-green-400'
                        }`}
                      >
                        <CardContent className='p-6'>
                          <div className='mb-4 flex items-center space-x-3'>
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                                level.level === 1
                                  ? 'bg-red-400'
                                  : level.level === 2
                                    ? 'bg-orange-400'
                                    : level.level === 3
                                      ? 'bg-yellow-400'
                                      : level.level === 4
                                        ? 'bg-blue-400'
                                        : 'bg-green-400'
                              }`}
                            >
                              {level.level}
                            </div>
                            <h3 className='text-xl font-semibold'>{level.name}</h3>
                          </div>

                          <p className='mb-4 leading-relaxed text-gray-700 dark:text-gray-300'>
                            {level.description}
                          </p>

                          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            <div>
                              <h4 className='mb-3 font-semibold'>特徴</h4>
                              <ul className='space-y-1'>
                                {level.characteristics.map((char, i) => (
                                  <li key={i} className='text-sm text-gray-600 dark:text-gray-400'>
                                    • {char}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className='mb-3 font-semibold'>能力</h4>
                              <ul className='space-y-1'>
                                {level.capabilities.map((cap, i) => (
                                  <li key={i} className='text-sm text-gray-600 dark:text-gray-400'>
                                    • {cap}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className='mb-3 font-semibold'>次レベルへの要件</h4>
                              <ul className='space-y-1'>
                                {level.nextLevelRequirements.map((req, i) => (
                                  <li key={i} className='text-sm text-gray-600 dark:text-gray-400'>
                                    • {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 推奨選択タブ */}
          <TabsContent value='selector'>
            <PMOTypeSelector />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

export default PMOLearningHub
