/**
 * ECO（Exam Content Outline）マッピングダッシュボード
 * PMP試験内容とアジャイル・マインドセット学習の対応関係を可視化
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import {
  BookOpen,
  Target,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Star,
  Calendar,
  Award,
  Brain,
  Layers,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { ecoMapping, learningSupport } from '../../data/pmbok/agileMindsetData.js'

interface LearningProgress {
  domainId: string
  coveragePercentage: number
  completedTopics: string[]
  studyTime: number
  lastAccessed: Date
  confidence: number
}

interface StudyPlan {
  id: string
  title: string
  estimatedHours: number
  priority: 'high' | 'medium' | 'low'
  topics: string[]
  deadline?: Date
  status: 'not-started' | 'in-progress' | 'completed'
}

const ECOMappingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [showAnalytics, setShowAnalytics] = useState(false)

  // モックデータ：学習進捗
  const [learningProgress] = useState<LearningProgress[]>([
    {
      domainId: 'fundamentals',
      coveragePercentage: 85,
      completedTopics: [
        'アジャイル・マインドセットの理解',
        'プロジェクトライフサイクルの選択',
        'テーラリングの基本概念',
      ],
      studyTime: 15,
      lastAccessed: new Date('2024-01-15'),
      confidence: 80,
    },
    {
      domainId: 'principles',
      coveragePercentage: 70,
      completedTopics: ['アジャイル原則の適用', '継続的改善'],
      studyTime: 12,
      lastAccessed: new Date('2024-01-10'),
      confidence: 75,
    },
    {
      domainId: 'agile-mindset',
      coveragePercentage: 90,
      completedTopics: ['アジャイル価値観と原則', 'アジャイル思考法', '継続的価値提供'],
      studyTime: 20,
      lastAccessed: new Date('2024-01-18'),
      confidence: 85,
    },
    {
      domainId: 'tailoring',
      coveragePercentage: 60,
      completedTopics: ['ライフサイクル選択', 'プロセス適応'],
      studyTime: 8,
      lastAccessed: new Date('2024-01-08'),
      confidence: 65,
    },
  ])

  // モックデータ：学習計画
  const [studyPlans] = useState<StudyPlan[]>([
    {
      id: 'plan-1',
      title: 'ハイブリッドアプローチ深化',
      estimatedHours: 8,
      priority: 'high',
      topics: ['ハイブリッド・アプローチの設計', 'プロセス統合', '組織要因の考慮'],
      deadline: new Date('2024-02-01'),
      status: 'in-progress',
    },
    {
      id: 'plan-2',
      title: 'アジャイル・コーチング',
      estimatedHours: 12,
      priority: 'medium',
      topics: ['サーバントリーダーシップ', '自己組織化チーム', 'ファシリテーション'],
      deadline: new Date('2024-02-15'),
      status: 'not-started',
    },
    {
      id: 'plan-3',
      title: 'テーラリング実践',
      estimatedHours: 6,
      priority: 'high',
      topics: ['実務慣行の調整', '組織文化との整合'],
      status: 'not-started',
    },
  ])

  const { domains } = ecoMapping
  const { keyLearningPoints, commonMisconceptions } = learningSupport

  // 全体進捗の計算
  const overallProgress = useMemo(() => {
    const totalCoverage = learningProgress.reduce(
      (sum, progress) => sum + progress.coveragePercentage,
      0
    )
    const averageCoverage = totalCoverage / learningProgress.length
    const totalStudyTime = learningProgress.reduce((sum, progress) => sum + progress.studyTime, 0)
    const averageConfidence =
      learningProgress.reduce((sum, progress) => sum + progress.confidence, 0) /
      learningProgress.length

    return {
      averageCoverage: Math.round(averageCoverage),
      totalStudyTime,
      averageConfidence: Math.round(averageConfidence),
      completedDomains: learningProgress.filter((p) => p.coveragePercentage >= 80).length,
      totalDomains: learningProgress.length,
    }
  }, [learningProgress])

  // フィルタリングされた学習計画
  const filteredStudyPlans = useMemo(() => {
    return studyPlans.filter((plan) => {
      const matchesSearch =
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesPriority = filterPriority === 'all' || plan.priority === filterPriority
      return matchesSearch && matchesPriority
    })
  }, [studyPlans, searchTerm, filterPriority])

  // ドメイン選択ハンドラー
  const handleDomainSelect = useCallback(
    (domainName: string) => {
      setSelectedDomain(selectedDomain === domainName ? null : domainName)
    },
    [selectedDomain]
  )

  // トピック展開ハンドラー
  const toggleTopicExpansion = useCallback(
    (topicId: string) => {
      setExpandedTopic(expandedTopic === topicId ? null : topicId)
    },
    [expandedTopic]
  )

  // 進捗データの取得
  const getDomainProgress = useCallback(
    (domainName: string) => {
      const domainKey = domainName.toLowerCase().replace(/[^a-z]/g, '-')
      return learningProgress.find((p) => p.domainId.includes(domainKey.split('-')[0]))
    },
    [learningProgress]
  )

  // 優先度カラーの取得
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 border-red-200'
      case 'medium':
        return 'text-yellow-600 border-yellow-200'
      case 'low':
        return 'text-green-600 border-green-200'
      default:
        return 'text-gray-600 border-gray-200'
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
          <BookOpen className='mr-3 inline-block text-blue-600' size={40} />
          ECO マッピングダッシュボード
        </motion.h1>
        <motion.p
          className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          PMP試験内容とアジャイル学習の対応関係を分析し、効率的な学習計画を立てましょう
        </motion.p>
      </div>

      {/* サマリーカード */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='grid grid-cols-1 gap-4 md:grid-cols-4'
      >
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Target className='text-blue-600' size={24} />
              <div>
                <p className='text-2xl font-bold text-blue-600'>
                  {overallProgress.averageCoverage}%
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>全体カバレッジ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Clock className='text-green-600' size={24} />
              <div>
                <p className='text-2xl font-bold text-green-600'>
                  {overallProgress.totalStudyTime}h
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>総学習時間</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Brain className='text-purple-600' size={24} />
              <div>
                <p className='text-2xl font-bold text-purple-600'>
                  {overallProgress.averageConfidence}%
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>平均理解度</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Award className='text-orange-600' size={24} />
              <div>
                <p className='text-2xl font-bold text-orange-600'>
                  {overallProgress.completedDomains}/{overallProgress.totalDomains}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>完了ドメイン</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>概要</TabsTrigger>
          <TabsTrigger value='domains'>ドメイン分析</TabsTrigger>
          <TabsTrigger value='study-plan'>学習計画</TabsTrigger>
          <TabsTrigger value='analytics'>分析レポート</TabsTrigger>
        </TabsList>

        {/* 概要 */}
        <TabsContent value='overview' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            {/* ドメイン概要 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Layers className='mr-2 text-blue-600' />
                  ECOドメイン概要
                </CardTitle>
                <CardDescription>PMP試験の各ドメインとカバレッジ状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {domains.map((domain, index) => {
                    const progress = getDomainProgress(domain.domain)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className='rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      >
                        <div className='mb-3 flex items-start justify-between'>
                          <h4 className='text-lg font-semibold'>{domain.domain}</h4>
                          {progress && (
                            <Badge
                              variant='outline'
                              className={
                                progress.coveragePercentage >= 80
                                  ? 'border-green-500 text-green-700'
                                  : 'border-orange-500 text-orange-700'
                              }
                            >
                              {progress.coveragePercentage}%
                            </Badge>
                          )}
                        </div>

                        {progress && (
                          <div className='mb-3'>
                            <Progress value={progress.coveragePercentage} className='h-2' />
                          </div>
                        )}

                        <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
                          <div>
                            <h5 className='mb-2 font-medium text-blue-700 dark:text-blue-300'>
                              学習カバレッジ
                            </h5>
                            <ul className='space-y-1'>
                              {domain.coverage.map((item, idx) => (
                                <li key={idx} className='flex items-start'>
                                  <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                                  <span className='text-gray-600 dark:text-gray-400'>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className='mb-2 font-medium text-purple-700 dark:text-purple-300'>
                              試験トピック
                            </h5>
                            <ul className='space-y-1'>
                              {domain.examTopics.slice(0, 3).map((topic, idx) => (
                                <li key={idx} className='flex items-start'>
                                  <Bookmark className='mr-2 mt-0.5 text-purple-500' size={12} />
                                  <span className='text-gray-600 dark:text-gray-400'>{topic}</span>
                                </li>
                              ))}
                              {domain.examTopics.length > 3 && (
                                <li className='ml-5 text-xs text-gray-500'>
                                  +{domain.examTopics.length - 3} その他
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 重要ポイント */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Star className='mr-2 text-yellow-600' />
                  重要学習ポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {keyLearningPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='space-y-3'
                    >
                      <h4 className='text-lg font-semibold text-blue-700 dark:text-blue-300'>
                        {point.topic}
                      </h4>
                      <ul className='space-y-2'>
                        {point.points.map((item, idx) => (
                          <li key={idx} className='flex items-start text-sm'>
                            <CheckCircle className='mr-2 mt-0.5 text-green-500' size={12} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* よくある誤解 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <AlertTriangle className='mr-2 text-orange-600' />
                  よくある誤解と正しい理解
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {commonMisconceptions.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='space-y-2 border-l-4 border-l-orange-500 pl-4'
                    >
                      <div className='rounded bg-red-50 p-3 dark:bg-red-900/20'>
                        <p className='text-sm font-medium text-red-700 dark:text-red-300'>
                          ❌ 誤解: {item.misconception}
                        </p>
                      </div>
                      <div className='rounded bg-green-50 p-3 dark:bg-green-900/20'>
                        <p className='text-sm font-medium text-green-700 dark:text-green-300'>
                          ✅ 正解: {item.correction}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ドメイン分析 */}
        <TabsContent value='domains' className='space-y-6'>
          <div className='space-y-6'>
            {domains.map((domain, index) => {
              const progress = getDomainProgress(domain.domain)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedDomain === domain.domain
                        ? 'shadow-lg ring-2 ring-blue-500'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleDomainSelect(domain.domain)}
                  >
                    <CardHeader>
                      <CardTitle className='flex items-center justify-between'>
                        <span className='flex items-center'>
                          <Target className='mr-2 text-blue-600' size={20} />
                          {domain.domain}
                          {progress && (
                            <Badge variant='outline' className='ml-3'>
                              進捗: {progress.coveragePercentage}%
                            </Badge>
                          )}
                        </span>
                        {selectedDomain === domain.domain ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </CardTitle>
                      {progress && (
                        <div className='space-y-1'>
                          <Progress value={progress.coveragePercentage} className='h-2' />
                          <div className='flex justify-between text-sm text-gray-600 dark:text-gray-400'>
                            <span>学習時間: {progress.studyTime}時間</span>
                            <span>理解度: {progress.confidence}%</span>
                          </div>
                        </div>
                      )}
                    </CardHeader>

                    <AnimatePresence>
                      {selectedDomain === domain.domain && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                              <div>
                                <h4 className='mb-3 font-semibold text-green-700 dark:text-green-300'>
                                  学習カバレッジ
                                </h4>
                                <ul className='space-y-2'>
                                  {domain.coverage.map((item, idx) => {
                                    const isCompleted = progress?.completedTopics.includes(item)
                                    return (
                                      <li key={idx} className='flex items-start'>
                                        <CheckCircle
                                          className={`mr-2 mt-0.5 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}
                                          size={14}
                                        />
                                        <span
                                          className={`text-sm ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
                                        >
                                          {item}
                                        </span>
                                      </li>
                                    )
                                  })}
                                </ul>
                              </div>

                              <div>
                                <h4 className='mb-3 font-semibold text-purple-700 dark:text-purple-300'>
                                  試験トピック
                                </h4>
                                <ul className='space-y-2'>
                                  {domain.examTopics.map((topic, idx) => (
                                    <li key={idx} className='flex items-start'>
                                      <Bookmark className='mr-2 mt-0.5 text-purple-500' size={14} />
                                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                                        {topic}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {progress && (
                              <div className='border-t pt-4'>
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                  <div className='text-center'>
                                    <p className='text-2xl font-bold text-blue-600'>
                                      {progress.coveragePercentage}%
                                    </p>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                      カバレッジ
                                    </p>
                                  </div>
                                  <div className='text-center'>
                                    <p className='text-2xl font-bold text-green-600'>
                                      {progress.studyTime}h
                                    </p>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                      学習時間
                                    </p>
                                  </div>
                                  <div className='text-center'>
                                    <p className='text-2xl font-bold text-purple-600'>
                                      {progress.confidence}%
                                    </p>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                      理解度
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* 学習計画 */}
        <TabsContent value='study-plan' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            {/* フィルターとサーチ */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-col gap-4 md:flex-row'>
                  <div className='flex-1'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                      <input
                        type='text'
                        placeholder='学習計画を検索...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Filter className='h-4 w-4 text-gray-400' />
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                      className='rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='all'>全ての優先度</option>
                      <option value='high'>高優先度</option>
                      <option value='medium'>中優先度</option>
                      <option value='low'>低優先度</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 学習計画リスト */}
            <div className='space-y-4'>
              {filteredStudyPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${getPriorityColor(plan.priority)}`}>
                    <CardHeader>
                      <CardTitle className='flex items-center justify-between'>
                        <span className='flex items-center'>
                          <Calendar className='mr-2 text-blue-600' size={20} />
                          {plan.title}
                          <Badge
                            variant='outline'
                            className={`ml-3 ${getPriorityColor(plan.priority)}`}
                          >
                            {plan.priority === 'high'
                              ? '高'
                              : plan.priority === 'medium'
                                ? '中'
                                : '低'}
                            優先度
                          </Badge>
                        </span>
                        <div className='flex items-center space-x-2'>
                          <Badge
                            variant={
                              plan.status === 'completed'
                                ? 'default'
                                : plan.status === 'in-progress'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {plan.status === 'completed'
                              ? '完了'
                              : plan.status === 'in-progress'
                                ? '進行中'
                                : '未開始'}
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        推定時間: {plan.estimatedHours}時間
                        {plan.deadline && ` | 期限: ${plan.deadline.toLocaleDateString('ja-JP')}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h5 className='mb-2 font-semibold'>学習トピック</h5>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                          {plan.topics.map((topic, idx) => (
                            <div key={idx} className='flex items-center'>
                              <BookOpen className='mr-2 text-blue-500' size={14} />
                              <span className='text-sm'>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='mt-4 flex justify-end space-x-2'>
                        <Button variant='outline' size='sm'>
                          編集
                        </Button>
                        <Button
                          size='sm'
                          variant={plan.status === 'not-started' ? 'default' : 'secondary'}
                        >
                          {plan.status === 'not-started'
                            ? '開始'
                            : plan.status === 'in-progress'
                              ? '続行'
                              : '復習'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredStudyPlans.length === 0 && (
              <Card>
                <CardContent className='p-8 text-center'>
                  <Search className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                  <p className='text-gray-600 dark:text-gray-400'>
                    条件に一致する学習計画が見つかりません
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* 分析レポート */}
        <TabsContent value='analytics' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>学習分析レポート</h3>
              <div className='flex space-x-2'>
                <Button variant='outline' size='sm'>
                  <Download className='mr-2 h-4 w-4' />
                  エクスポート
                </Button>
                <Button variant='outline' size='sm'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  更新
                </Button>
              </div>
            </div>

            {/* 学習進捗サマリー */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <BarChart3 className='mr-2 text-blue-600' />
                    ドメイン別進捗
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {learningProgress.map((progress, index) => (
                      <div key={index} className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='font-medium'>
                            {domains.find((d) =>
                              d.domain.toLowerCase().includes(progress.domainId.split('-')[0])
                            )?.domain || progress.domainId}
                          </span>
                          <span>{progress.coveragePercentage}%</span>
                        </div>
                        <Progress value={progress.coveragePercentage} className='h-2' />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <TrendingUp className='mr-2 text-green-600' />
                    学習トレンド
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <p className='text-3xl font-bold text-blue-600'>
                        {overallProgress.totalStudyTime}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>総学習時間</p>
                    </div>
                    <Separator />
                    <div className='grid grid-cols-2 gap-4 text-center'>
                      <div>
                        <p className='text-xl font-semibold text-green-600'>
                          {overallProgress.completedDomains}
                        </p>
                        <p className='text-xs text-gray-600 dark:text-gray-400'>完了ドメイン</p>
                      </div>
                      <div>
                        <p className='text-xl font-semibold text-purple-600'>
                          {overallProgress.averageConfidence}%
                        </p>
                        <p className='text-xs text-gray-600 dark:text-gray-400'>平均理解度</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 推奨事項 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Lightbulb className='mr-2 text-yellow-600' />
                  学習推奨事項
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {learningProgress
                    .filter((p) => p.coveragePercentage < 70)
                    .map((progress, index) => {
                      const domain = domains.find((d) =>
                        d.domain.toLowerCase().includes(progress.domainId.split('-')[0])
                      )
                      return (
                        <Alert key={index}>
                          <AlertTriangle className='h-4 w-4' />
                          <AlertDescription>
                            <strong>{domain?.domain}</strong>の学習を強化することをお勧めします。
                            現在の進捗: {progress.coveragePercentage}% （目標: 80%以上）
                          </AlertDescription>
                        </Alert>
                      )
                    })}

                  {learningProgress.every((p) => p.coveragePercentage >= 70) && (
                    <Alert>
                      <CheckCircle className='h-4 w-4' />
                      <AlertDescription>
                        素晴らしい進捗です！全てのドメインで70%以上の学習進捗を達成しています。
                        より深い理解のため、実践問題や模擬試験に挑戦してみましょう。
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ECOMappingDashboard
