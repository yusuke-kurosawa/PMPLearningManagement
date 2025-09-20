/**
 * PMOTypeSelector.tsx
 * 組織特性に基づいて最適なPMOタイプを推奨するウィザード
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Target,
  CheckCircle,
  Users,
  Shield,
  Command,
  Zap,
  Building,
  Puzzle as Complexity,
  TrendingUp,
  Factory as Industry,
  Clock,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  FileText,
  Star,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

// UIコンポーネント
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
// Radio group component removed due to missing dependency
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'

// データとタイプ
import { recommendPMOType } from '../../data/pmbok/pmoData.js'
import type { PMOAssessment } from '../../data/schemas/pmbok/pmoTypes'

// PMOタイプの設定
const PMO_CONFIG = {
  supportive: {
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700 dark:text-blue-300',
    name: '支援型PMO',
  },
  controlling: {
    icon: Shield,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    name: 'コントロール型PMO',
  },
  directive: {
    icon: Command,
    color: 'bg-red-500',
    lightColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200',
    textColor: 'text-red-700 dark:text-red-300',
    name: '指令型PMO',
  },
  acoe: {
    icon: Zap,
    color: 'bg-green-500',
    lightColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200',
    textColor: 'text-green-700 dark:text-green-300',
    name: 'アジャイル・センター・オブ・エクセレンス（ACoE）',
  },
}

// 質問設定
const ASSESSMENT_QUESTIONS = [
  {
    id: 'organizationSize',
    title: '組織規模',
    description: 'あなたの組織の規模を選択してください',
    icon: Building,
    options: [
      { value: 'small', label: '小規模（50名未満）', description: 'スタートアップや小規模企業' },
      { value: 'medium', label: '中規模（50-500名）', description: '成長企業や中小企業' },
      { value: 'large', label: '大規模（500-5000名）', description: '大企業や上場企業' },
      {
        value: 'enterprise',
        label: '超大規模（5000名以上）',
        description: '多国籍企業や大手企業グループ',
      },
    ],
  },
  {
    id: 'projectComplexity',
    title: 'プロジェクト複雑度',
    description: '主に扱うプロジェクトの複雑度はどの程度ですか？',
    icon: Complexity,
    options: [
      { value: 'low', label: '低複雑度', description: '単発プロジェクト、明確な要件' },
      { value: 'medium', label: '中複雑度', description: '複数部門関与、一定の不確実性' },
      {
        value: 'high',
        label: '高複雑度',
        description: '大規模変革、高い不確実性、多数のステークホルダー',
      },
    ],
  },
  {
    id: 'organizationalMaturity',
    title: 'プロジェクトマネジメント成熟度',
    description: '組織のプロジェクトマネジメント成熟度を評価してください',
    icon: TrendingUp,
    options: [
      { value: 'initial', label: '初期段階', description: '場当たり的、成功は個人の能力に依存' },
      { value: 'developing', label: '発展段階', description: '基本的なプロセスは存在、一部標準化' },
      { value: 'defined', label: '定義段階', description: '標準化されたプロセス、一貫した適用' },
      { value: 'managed', label: '管理段階', description: '定量的管理、データによる意思決定' },
      { value: 'optimizing', label: '最適化段階', description: '継続的改善、イノベーション文化' },
    ],
  },
  {
    id: 'industryType',
    title: '業界・業種',
    description: 'あなたの組織が属する主要な業界を選択してください',
    icon: Industry,
    options: [
      {
        value: 'technology',
        label: 'テクノロジー・IT',
        description: 'ソフトウェア開発、IT サービス',
      },
      { value: 'manufacturing', label: '製造業', description: '自動車、機械、電子機器' },
      { value: 'finance', label: '金融・保険', description: '銀行、証券、保険会社' },
      { value: 'healthcare', label: 'ヘルスケア', description: '医療機器、製薬、病院' },
      {
        value: 'consulting',
        label: 'コンサルティング',
        description: '経営コンサルティング、システム導入',
      },
      { value: 'construction', label: '建設・インフラ', description: '土木、建築、公共事業' },
      { value: 'retail', label: '小売・消費財', description: '小売業、消費者向け製品' },
      { value: 'other', label: 'その他', description: '上記以外の業界' },
    ],
  },
]

interface PMOTypeSelectorProps {
  className?: string
  onComplete?: (result: any) => void
}

const PMOTypeSelector: React.FC<PMOTypeSelectorProps> = ({ className = '', onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)

  // 進捗率の計算
  const progress = useMemo(() => {
    return ((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100
  }, [currentStep])

  // 現在の質問
  const currentQuestion = ASSESSMENT_QUESTIONS[currentStep]

  // 回答の更新
  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  // 次へ進む
  const handleNext = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // 評価完了
      handleComplete()
    }
  }

  // 前に戻る
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // 評価完了処理
  const handleComplete = () => {
    const assessment = {
      organizationSize: answers.organizationSize,
      projectComplexity: answers.projectComplexity,
      organizationalMaturity: answers.organizationalMaturity,
      industryType: answers.industryType,
    }

    const result = recommendPMOType(assessment as any)
    setRecommendation(result)
    setIsCompleted(true)

    if (onComplete) {
      onComplete(result)
    }
  }

  // やり直し
  const handleRestart = () => {
    setCurrentStep(0)
    setAnswers({})
    setIsCompleted(false)
    setRecommendation(null)
  }

  // 選択済みかどうかのチェック
  const isAnswered = answers[currentQuestion?.id] !== undefined

  if (isCompleted && recommendation) {
    const config = PMO_CONFIG[recommendation.recommendedPMOType as keyof typeof PMO_CONFIG]
    const IconComponent = config.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-6 ${className}`}
      >
        <Card className={`${config.lightColor} ${config.borderColor} border-2`}>
          <CardHeader className='text-center'>
            <div className='mb-4 flex items-center justify-center space-x-3'>
              <div className={`rounded-full p-4 ${config.color} text-white`}>
                <IconComponent className='h-8 w-8' />
              </div>
              <div>
                <CardTitle className='text-2xl'>評価完了!</CardTitle>
                <CardDescription>あなたの組織に最適なPMOタイプを推奨します</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* 推奨結果 */}
            <div className='text-center'>
              <div
                className={`inline-flex items-center space-x-2 rounded-full px-4 py-2 ${config.color} text-lg font-semibold text-white`}
              >
                <Star className='h-5 w-5' />
                <span>推奨: {config.name}</span>
              </div>
            </div>

            {/* 推奨理由 */}
            <div>
              <h3 className='mb-3 flex items-center space-x-2 text-lg font-semibold'>
                <Lightbulb className='h-5 w-5' />
                <span>推奨理由</span>
              </h3>
              <ul className='space-y-2'>
                {recommendation.reasoning.map((reason: string, index: number) => (
                  <li key={index} className='flex items-start space-x-2'>
                    <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                    <span className='text-sm'>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 実装ロードマップ */}
            <div>
              <h3 className='mb-3 flex items-center space-x-2 text-lg font-semibold'>
                <FileText className='h-5 w-5' />
                <span>実装ロードマップ</span>
              </h3>
              <div className='space-y-3'>
                {recommendation.implementationRoadmap.map((phase: string, index: number) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div
                      className={`h-6 w-6 rounded-full ${config.color} flex items-center justify-center text-sm font-bold text-white`}
                    >
                      {index + 1}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm'>{phase}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 回答サマリー */}
            <Separator />
            <div>
              <h3 className='mb-3 text-lg font-semibold'>あなたの回答サマリー</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {ASSESSMENT_QUESTIONS.map((question) => {
                  const answer = answers[question.id]
                  const option = question.options.find((opt) => opt.value === answer)
                  const QuestionIcon = question.icon

                  return (
                    <div
                      key={question.id}
                      className='flex items-start space-x-3 rounded-lg bg-white p-3 dark:bg-gray-800'
                    >
                      <QuestionIcon className='mt-0.5 h-5 w-5 text-gray-500' />
                      <div>
                        <div className='text-sm font-medium'>{question.title}</div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          {option?.label}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* アクションボタン */}
            <div className='flex justify-center space-x-4 pt-4'>
              <Button
                variant='outline'
                onClick={handleRestart}
                className='flex items-center space-x-2'
              >
                <RotateCcw className='h-4 w-4' />
                <span>もう一度評価</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center'
      >
        <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
          PMOタイプ選択ウィザード
        </h2>
        <p className='text-gray-600 dark:text-gray-300'>
          組織の特性に基づいて最適なPMOタイプを推奨します
        </p>
      </motion.div>

      {/* 進捗バー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className='p-4'>
            <div className='mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
              <span>進捗</span>
              <span>
                {currentStep + 1} / {ASSESSMENT_QUESTIONS.length}
              </span>
            </div>
            <Progress value={progress} className='h-2' />
          </CardContent>
        </Card>
      </motion.div>

      {/* 質問カード */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <currentQuestion.icon className='h-6 w-6' />
              <span>{currentQuestion.title}</span>
            </CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className='flex cursor-pointer items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800'>
                    <input
                      type='radio'
                      id={option.value}
                      name={currentQuestion.id}
                      value={option.value}
                      checked={answers[currentQuestion.id] === option.value}
                      onChange={() => handleAnswer(option.value)}
                      className='mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <Label htmlFor={option.value} className='flex-1 cursor-pointer'>
                      <div className='font-medium'>{option.label}</div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        {option.description}
                      </div>
                    </Label>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ナビゲーションボタン */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='flex justify-between'
      >
        <Button
          variant='outline'
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className='flex items-center space-x-2'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>前へ</span>
        </Button>

        <Button onClick={handleNext} disabled={!isAnswered} className='flex items-center space-x-2'>
          <span>{currentStep === ASSESSMENT_QUESTIONS.length - 1 ? '結果を見る' : '次へ'}</span>
          {currentStep === ASSESSMENT_QUESTIONS.length - 1 ? (
            <Target className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </Button>
      </motion.div>

      {/* ヘルプテキスト */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Alert>
          <Lightbulb className='h-4 w-4' />
          <AlertDescription>
            <strong>ヒント:</strong>{' '}
            各質問に正直に答えることで、より正確な推奨結果を得ることができます。
            組織の現状を客観的に評価してください。
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  )
}

export default PMOTypeSelector
