/**
 * アジャイル・マインドセット エクスプローラー
 * 「アジャイルをすること」vs「アジャイルであること」の理解とマインドセット診断
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Heart,
  Lightbulb,
  RefreshCw,
} from 'lucide-react'
import { agileMindsetConcepts, agileMindsetElements } from '../../data/pmbok/agileMindsetData.js'

interface AssessmentResult {
  score: number
  level: string
  recommendations: string[]
  strengths: string[]
  areasForImprovement: string[]
}

const AgileMindsetExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('comparison')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({})
  const [showAssessmentResult, setShowAssessmentResult] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // 自己診断質問
  const assessmentQuestions = [
    {
      id: 'q1',
      question: '変化する要求に対してどの程度柔軟に対応できますか？',
      category: 'flexibility',
    },
    {
      id: 'q2',
      question: '失敗を学習機会として捉えることができますか？',
      category: 'learning',
    },
    {
      id: 'q3',
      question: 'チームメンバーとのコラボレーションを重視しますか？',
      category: 'collaboration',
    },
    {
      id: 'q4',
      question: '継続的な改善に取り組んでいますか？',
      category: 'improvement',
    },
    {
      id: 'q5',
      question: '顧客価値の提供を最優先に考えますか？',
      category: 'customer-focus',
    },
    {
      id: 'q6',
      question: 'プロセスよりも個人と対話を重視しますか？',
      category: 'values',
    },
    {
      id: 'q7',
      question: '計画に固執せず、変化に対応できますか？',
      category: 'adaptability',
    },
    {
      id: 'q8',
      question: 'フィードバックを積極的に求めますか？',
      category: 'feedback',
    },
  ]

  const calculateAssessment = useCallback((): AssessmentResult => {
    const totalScore = Object.values(assessmentAnswers).reduce((sum, score) => sum + score, 0)
    const maxScore = assessmentQuestions.length * 5
    const percentage = (totalScore / maxScore) * 100

    let level: string
    let recommendations: string[]
    let strengths: string[]
    let areasForImprovement: string[]

    if (percentage >= 80) {
      level = 'アジャイル・チャンピオン'
      strengths = ['アジャイル価値観の深い理解', '優れた適応能力', '強力なコラボレーションスキル']
      recommendations = [
        '他のチームメンバーをメンター',
        'アジャイル・コーチングの役割を検討',
        '組織レベルでの変革推進',
      ]
      areasForImprovement = ['継続的な自己反省', '知識の共有']
    } else if (percentage >= 60) {
      level = 'アジャイル・プラクティショナー'
      strengths = ['アジャイル原則の理解', '実践的なスキル', 'チームワークの重視']
      recommendations = [
        'より深いアジャイル原則の学習',
        'リーダーシップスキルの向上',
        '継続的な実践とフィードバック',
      ]
      areasForImprovement = ['変化への対応力', 'フィードバック活用']
    } else if (percentage >= 40) {
      level = 'アジャイル・学習者'
      strengths = ['基本的な理解', '学習意欲', '改善への取り組み']
      recommendations = [
        'アジャイル基礎の体系的学習',
        '小さな実践から始める',
        'メンターやコーチとの連携',
      ]
      areasForImprovement = ['実践的スキル', 'チームコラボレーション']
    } else {
      level = 'アジャイル・初心者'
      strengths = ['学習への意欲', '成長の可能性']
      recommendations = [
        'アジャイル・マニフェストの理解',
        '基本的なアジャイル手法の学習',
        '実践的なトレーニング参加',
      ]
      areasForImprovement = ['基本概念の理解', 'マインドセットの変革']
    }

    return {
      score: percentage,
      level,
      recommendations,
      strengths,
      areasForImprovement,
    }
  }, [assessmentAnswers, assessmentQuestions.length])

  const handleAssessmentSubmit = () => {
    if (Object.keys(assessmentAnswers).length === assessmentQuestions.length) {
      setShowAssessmentResult(true)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const { doingVsBeing } = agileMindsetConcepts
  const { elements } = agileMindsetElements

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
          <Heart className='mr-3 inline-block text-blue-600' size={40} />
          アジャイル・マインドセット エクスプローラー
        </motion.h1>
        <motion.p
          className='mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          アジャイル・マインドセットの本質を理解し、自分のマインドセットレベルを評価しましょう
        </motion.p>
      </div>

      {/* メインタブ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='comparison'>Doing vs Being</TabsTrigger>
          <TabsTrigger value='elements'>マインドセット要素</TabsTrigger>
          <TabsTrigger value='characteristics'>アジャイル特徴</TabsTrigger>
          <TabsTrigger value='assessment'>自己診断</TabsTrigger>
        </TabsList>

        {/* Doing vs Being 比較 */}
        <TabsContent value='comparison' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <ArrowRight className='mr-2 text-blue-600' />
                  {doingVsBeing.title}
                </CardTitle>
                <CardDescription>{doingVsBeing.description}</CardDescription>
              </CardHeader>
            </Card>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Doing Agile */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className='h-full border-orange-200 dark:border-orange-800'>
                  <CardHeader className='bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'>
                    <CardTitle className='text-orange-700 dark:text-orange-300'>
                      {doingVsBeing.doingAgile.title}
                    </CardTitle>
                    <CardDescription>{doingVsBeing.doingAgile.description}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <h4 className='mb-2 flex items-center font-semibold'>
                        <CheckCircle className='mr-2 text-green-600' size={16} />
                        特徴
                      </h4>
                      <ul className='space-y-1'>
                        {doingVsBeing.doingAgile.characteristics.map((char, index) => (
                          <li key={index} className='flex items-start text-sm'>
                            <Badge variant='outline' className='mr-2 mt-0.5 text-xs'>
                              {index + 1}
                            </Badge>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className='mb-2 flex items-center font-semibold'>
                        <AlertTriangle className='mr-2 text-yellow-600' size={16} />
                        制限事項
                      </h4>
                      <ul className='space-y-1'>
                        {doingVsBeing.doingAgile.limitations.map((limit, index) => (
                          <li key={index} className='text-sm text-gray-600 dark:text-gray-400'>
                            • {limit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Being Agile */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className='h-full border-green-200 dark:border-green-800'>
                  <CardHeader className='bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'>
                    <CardTitle className='text-green-700 dark:text-green-300'>
                      {doingVsBeing.beingAgile.title}
                    </CardTitle>
                    <CardDescription>{doingVsBeing.beingAgile.description}</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <h4 className='mb-2 flex items-center font-semibold'>
                        <CheckCircle className='mr-2 text-green-600' size={16} />
                        特徴
                      </h4>
                      <ul className='space-y-1'>
                        {doingVsBeing.beingAgile.characteristics.map((char, index) => (
                          <li key={index} className='flex items-start text-sm'>
                            <Badge variant='outline' className='mr-2 mt-0.5 text-xs'>
                              {index + 1}
                            </Badge>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className='mb-2 flex items-center font-semibold'>
                        <TrendingUp className='mr-2 text-blue-600' size={16} />
                        メリット
                      </h4>
                      <ul className='space-y-1'>
                        {doingVsBeing.beingAgile.benefits.map((benefit, index) => (
                          <li key={index} className='text-sm text-gray-600 dark:text-gray-400'>
                            • {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* 主要な違い */}
            <Card>
              <CardHeader>
                <CardTitle>主要な違い</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full table-auto'>
                    <thead>
                      <tr className='border-b'>
                        <th className='p-3 text-left font-semibold'>観点</th>
                        <th className='p-3 text-left font-semibold text-orange-700 dark:text-orange-300'>
                          Doing Agile
                        </th>
                        <th className='p-3 text-left font-semibold text-green-700 dark:text-green-300'>
                          Being Agile
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doingVsBeing.keyDifferences.map((diff, index) => (
                        <motion.tr
                          key={index}
                          className='border-b hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td className='p-3 font-medium'>{diff.aspect}</td>
                          <td className='p-3 text-gray-600 dark:text-gray-400'>{diff.doing}</td>
                          <td className='p-3 text-gray-600 dark:text-gray-400'>{diff.being}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* マインドセット要素 */}
        <TabsContent value='elements' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {elements.map((element, index) => (
              <motion.div
                key={element.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedElement === element.id
                      ? 'shadow-lg ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() =>
                    setSelectedElement(selectedElement === element.id ? null : element.id)
                  }
                >
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Lightbulb className='mr-2 text-blue-600' size={20} />
                        {element.title}
                      </span>
                      {selectedElement === element.id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </CardTitle>
                    <CardDescription>{element.description}</CardDescription>
                  </CardHeader>

                  <AnimatePresence>
                    {selectedElement === element.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className='space-y-4'>
                          <div>
                            <h4 className='mb-2 font-semibold'>実践方法</h4>
                            <ul className='space-y-1'>
                              {element.practices.map((practice, idx) => (
                                <li key={idx} className='flex items-start text-sm'>
                                  <Badge variant='outline' className='mr-2 mt-0.5 text-xs'>
                                    {idx + 1}
                                  </Badge>
                                  {practice}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {element.benefits && (
                            <div>
                              <h4 className='mb-2 font-semibold text-green-700 dark:text-green-300'>
                                メリット
                              </h4>
                              <ul className='space-y-1'>
                                {element.benefits.map((benefit, idx) => (
                                  <li
                                    key={idx}
                                    className='text-sm text-gray-600 dark:text-gray-400'
                                  >
                                    • {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {element.challenges && (
                            <div>
                              <h4 className='mb-2 font-semibold text-orange-700 dark:text-orange-300'>
                                課題
                              </h4>
                              <ul className='space-y-1'>
                                {element.challenges.map((challenge, idx) => (
                                  <li
                                    key={idx}
                                    className='text-sm text-gray-600 dark:text-gray-400'
                                  >
                                    • {challenge}
                                  </li>
                                ))}
                              </ul>
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

        {/* アジャイル特徴 */}
        <TabsContent value='characteristics' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <Card>
              <CardHeader>
                <CardTitle>より短いイテレーション</CardTitle>
                <CardDescription>短期間での価値提供とフィードバック獲得</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Alert>
                  <Target className='h-4 w-4' />
                  <AlertDescription>
                    1-4週間の短いサイクルでの開発とデリバリーにより、早期の価値提供と迅速なフィードバック獲得を実現
                  </AlertDescription>
                </Alert>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <h4 className='mb-2 font-semibold text-green-700 dark:text-green-300'>
                      メリット
                    </h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• 早期の価値提供</li>
                      <li>• 迅速なフィードバック獲得</li>
                      <li>• リスクの早期発見</li>
                      <li>• 学習サイクルの高速化</li>
                      <li>• ステークホルダーエンゲージメントの向上</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-blue-700 dark:text-blue-300'>
                      実装プラクティス
                    </h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• スプリント計画</li>
                      <li>• デイリースタンドアップ</li>
                      <li>• スプリントレビュー</li>
                      <li>• スプリントレトロスペクティブ</li>
                      <li>• 継続的統合・デプロイ</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ステークホルダーのフィードバックに基づくプロダクトの進化</CardTitle>
                <CardDescription>
                  継続的なフィードバックによるプロダクトの適応的改善
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div>
                    <h4 className='mb-2 font-semibold text-purple-700 dark:text-purple-300'>
                      フィードバック源
                    </h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• エンドユーザー</li>
                      <li>• プロダクトオーナー</li>
                      <li>• ビジネスステークホルダー</li>
                      <li>• 内部チームメンバー</li>
                      <li>• 技術専門家</li>
                      <li>• 規制当局</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-cyan-700 dark:text-cyan-300'>
                      フィードバック手法
                    </h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• デモセッション</li>
                      <li>• ユーザビリティテスト</li>
                      <li>• プロトタイプレビュー</li>
                      <li>• ベータ版リリース</li>
                      <li>• A/Bテスト</li>
                      <li>• 顧客インタビュー</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='mb-2 font-semibold text-emerald-700 dark:text-emerald-300'>
                      進化プロセス
                    </h4>
                    <ul className='space-y-1 text-sm'>
                      <li>1. フィードバックの収集</li>
                      <li>2. 優先順位付け</li>
                      <li>3. バックログへの反映</li>
                      <li>4. 次イテレーションでの実装</li>
                      <li>5. 結果の検証</li>
                      <li>6. 継続的な調整</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* 自己診断 */}
        <TabsContent value='assessment' className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <BookOpen className='mr-2 text-blue-600' />
                  アジャイル・マインドセット自己診断
                </CardTitle>
                <CardDescription>
                  以下の質問に答えて、あなたのアジャイル・マインドセットレベルを評価してください
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {assessmentQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className='space-y-3'
                  >
                    <h4 className='font-medium'>
                      {index + 1}. {question.question}
                    </h4>
                    <div className='flex space-x-2'>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <Button
                          key={score}
                          variant={assessmentAnswers[question.id] === score ? 'default' : 'outline'}
                          size='sm'
                          onClick={() =>
                            setAssessmentAnswers((prev) => ({ ...prev, [question.id]: score }))
                          }
                          className='h-12 w-12'
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                    <div className='flex justify-between text-xs text-gray-500'>
                      <span>全く当てはまらない</span>
                      <span>非常に当てはまる</span>
                    </div>
                  </motion.div>
                ))}

                <div className='pt-4'>
                  <Button
                    onClick={handleAssessmentSubmit}
                    disabled={Object.keys(assessmentAnswers).length !== assessmentQuestions.length}
                    className='w-full'
                  >
                    診断結果を表示
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 診断結果 */}
            <AnimatePresence>
              {showAssessmentResult && (
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
                        診断結果
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      {(() => {
                        const result = calculateAssessment()
                        return (
                          <>
                            <div className='space-y-2 text-center'>
                              <div className='text-3xl font-bold text-blue-600'>
                                {result.score.toFixed(1)}%
                              </div>
                              <div className='text-xl font-semibold'>{result.level}</div>
                              <Progress value={result.score} className='w-full' />
                            </div>

                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                              <div>
                                <h4 className='mb-2 font-semibold text-green-700 dark:text-green-300'>
                                  強み
                                </h4>
                                <ul className='space-y-1'>
                                  {result.strengths.map((strength, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <CheckCircle
                                        className='mr-2 mt-0.5 text-green-500'
                                        size={12}
                                      />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className='mb-2 font-semibold text-blue-700 dark:text-blue-300'>
                                  推奨事項
                                </h4>
                                <ul className='space-y-1'>
                                  {result.recommendations.map((rec, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <Lightbulb className='mr-2 mt-0.5 text-blue-500' size={12} />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className='mb-2 font-semibold text-orange-700 dark:text-orange-300'>
                                  改善領域
                                </h4>
                                <ul className='space-y-1'>
                                  {result.areasForImprovement.map((area, idx) => (
                                    <li key={idx} className='flex items-start text-sm'>
                                      <RefreshCw
                                        className='mr-2 mt-0.5 text-orange-500'
                                        size={12}
                                      />
                                      {area}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className='pt-4'>
                              <Button
                                onClick={() => {
                                  setAssessmentAnswers({})
                                  setShowAssessmentResult(false)
                                }}
                                variant='outline'
                                className='w-full'
                              >
                                再診断する
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

export default AgileMindsetExplorer
