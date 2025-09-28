/**
 * AI Coaching Prototype
 * AIコーチング機能のUX改善プロトタイプ
 *
 * 主な機能:
 * - 対話型学習インターフェース
 * - 個別学習プラン生成と提示
 * - リアルタイムフィードバック
 * - 学習進捗の可視化
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import {
  Brain,
  MessageSquare,
  Send,
  Target,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  metadata?: {
    suggestions?: string[]
    relatedTopics?: string[]
    confidence?: number
  }
}

interface LearningWeakness {
  area: string
  knowledgeArea: string
  score: number
  severity: 'critical' | 'moderate' | 'minor'
  recommendation: string
  estimatedTime: string
  priority: number
}

interface StudyPlanModule {
  week: number
  focus: string
  topics: string[]
  estimatedHours: number
  status: 'upcoming' | 'current' | 'completed'
}

const AICoachingPrototype: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'plan' | 'analysis'>('chat')
  const [userInput, setUserInput] = useState('')
  const [isAITyping, setIsAITyping] = useState(false)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content:
        'こんにちは！私はあなたの学習をサポートするAIコーチです。学習データを分析した結果、あなたに最適な学習プランを作成しました。何か質問はありますか？',
      timestamp: new Date(),
      metadata: {
        suggestions: ['リスク管理の学習方法を教えて', '模擬試験の攻略法は？', '弱点を改善したい'],
      },
    },
  ])

  // 学習分析データ（モック）
  const learningAnalysis = {
    overallMastery: 67,
    daysUntilExam: 42,
    weeklyStudyHours: 15,
    grade: 'B+',
    strengthAreas: [
      { name: '統合管理', score: 85 },
      { name: 'スコープ管理', score: 78 },
      { name: '人的資源管理', score: 72 },
    ],
    weaknesses: [
      {
        area: 'リスク管理',
        knowledgeArea: 'プロジェクトリスク管理',
        score: 45,
        severity: 'critical' as const,
        recommendation:
          '毎日30分、リスク識別と分析の練習問題を解いてください。特にリスク対応戦略（回避、転嫁、軽減、受容）の理解を深めましょう。',
        estimatedTime: '週5時間',
        priority: 1,
      },
      {
        area: '調達管理',
        knowledgeArea: 'プロジェクト調達管理',
        score: 52,
        severity: 'moderate' as const,
        recommendation:
          '週3回、契約タイプとサプライヤー選定のケーススタディを学習してください。実務での調達プロセスをイメージしながら進めましょう。',
        estimatedTime: '週3時間',
        priority: 2,
      },
      {
        area: '品質管理',
        knowledgeArea: 'プロジェクト品質管理',
        score: 58,
        severity: 'moderate' as const,
        recommendation:
          'QA/QCの違いと品質ツール（パレート図、管理図など）をフラッシュカードで復習してください。',
        estimatedTime: '週2時間',
        priority: 3,
      },
    ] as LearningWeakness[],
  }

  const studyPlan: StudyPlanModule[] = [
    {
      week: 1,
      focus: 'リスク管理 集中強化',
      topics: ['リスク識別', 'リスク分析', 'リスク対応計画'],
      estimatedHours: 10,
      status: 'current',
    },
    {
      week: 2,
      focus: 'リスク管理 実践演習',
      topics: ['リスク監視', 'ケーススタディ', '模擬問題'],
      estimatedHours: 8,
      status: 'upcoming',
    },
    {
      week: 3,
      focus: '調達管理 基礎',
      topics: ['契約タイプ', '調達プロセス', 'サプライヤー選定'],
      estimatedHours: 6,
      status: 'upcoming',
    },
    {
      week: 4,
      focus: '品質管理 ツール習得',
      topics: ['品質計画', '品質保証', '品質管理ツール'],
      estimatedHours: 5,
      status: 'upcoming',
    },
    {
      week: 5,
      focus: '総合復習',
      topics: ['弱点再チェック', '模擬試験', '最終調整'],
      estimatedHours: 12,
      status: 'upcoming',
    },
    {
      week: 6,
      focus: '試験直前対策',
      topics: ['重要ポイント暗記', '時間配分練習', 'メンタル準備'],
      estimatedHours: 15,
      status: 'upcoming',
    },
  ]

  // AI応答シミュレーション
  const sendMessage = () => {
    if (!userInput.trim()) return

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])
    setUserInput('')
    setIsAITyping(true)

    // AI応答をシミュレート
    setTimeout(() => {
      const aiResponse = generateAIResponse(userInput)
      setChatMessages((prev) => [...prev, aiResponse])
      setIsAITyping(false)
    }, 1500)
  }

  const generateAIResponse = (input: string): ChatMessage => {
    const lowerInput = input.toLowerCase()

    let content = ''
    let suggestions: string[] = []

    if (lowerInput.includes('リスク')) {
      content =
        'リスク管理は現在あなたの最大の弱点です（習熟度45%）。以下のステップで改善しましょう：\n\n1. リスク対応戦略（回避、転嫁、軽減、受容）の違いを明確に理解\n2. 毎日10問のリスク管理問題を解く\n3. 実際のプロジェクト例でリスク識別の練習\n\n今週は毎日30分、リスク管理に集中することをお勧めします。'
      suggestions = ['リスク対応戦略の例を教えて', '練習問題を始める', '学習スケジュールを確認']
    } else if (lowerInput.includes('模擬試験') || lowerInput.includes('試験')) {
      content =
        '模擬試験の攻略法をお教えします：\n\n1. 時間配分: 180問を230分で解く（1問あたり約1.3分）\n2. 不明問題はフラグを立てて後回し\n3. 消去法を活用して選択肢を絞る\n4. キーワードに注目（「最も」「最初に」など）\n\nあなたの現在の正解率は67%です。目標80%まであと一息です！'
      suggestions = ['模擬試験を開始', '弱点分野の問題を解く', '時間配分のコツをもっと知りたい']
    } else if (lowerInput.includes('弱点') || lowerInput.includes('改善')) {
      content =
        'あなたの弱点トップ3は：\n\n1. リスク管理（45%）- 最優先で改善すべき\n2. 調達管理（52%）- 週3回の学習が必要\n3. 品質管理（58%）- フラッシュカード復習推奨\n\n6週間の個別学習プランで、これらの弱点を70%以上に引き上げることができます。今すぐ始めますか？'
      suggestions = ['学習プランを確認', 'リスク管理から始める', '弱点分析の詳細を見る']
    } else {
      content =
        'ご質問ありがとうございます。もう少し具体的に教えていただけますか？\n\n例えば：\n- 特定の知識エリアについて質問\n- 学習方法のアドバイス\n- 試験対策のコツ\n\nなどをお聞かせください。'
      suggestions = ['リスク管理について教えて', '学習スケジュールを見たい', '弱点を改善したい']
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      metadata: {
        suggestions,
        confidence: 0.92,
      },
    }
  }

  const getSeverityColor = (severity: LearningWeakness['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 dark:bg-red-900/20'
      case 'moderate':
        return 'bg-orange-100 border-orange-500 dark:bg-orange-900/20'
      default:
        return 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/20'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* ヘッダー */}
        <div className='text-center'>
          <div className='mb-2 flex items-center justify-center'>
            <Brain className='mr-2 h-8 w-8 text-purple-600' />
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>AIコーチング</h1>
            <Sparkles className='ml-2 h-6 w-6 text-yellow-500' />
          </div>
          <p className='text-gray-600 dark:text-gray-300'>
            あなた専用のAIコーチが最適な学習プランを提案します
          </p>
        </div>

        {/* ダッシュボード概要 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-600 dark:text-gray-300'>総合習熟度</div>
                  <div className='text-2xl font-bold text-blue-600'>
                    {learningAnalysis.overallMastery}%
                  </div>
                </div>
                <Target className='h-8 w-8 text-blue-500' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-600 dark:text-gray-300'>試験まで</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {learningAnalysis.daysUntilExam}日
                  </div>
                </div>
                <Clock className='h-8 w-8 text-green-500' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-600 dark:text-gray-300'>週間学習時間</div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {learningAnalysis.weeklyStudyHours}h
                  </div>
                </div>
                <BookOpen className='h-8 w-8 text-purple-500' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-600 dark:text-gray-300'>学習グレード</div>
                  <div className='text-2xl font-bold text-amber-600'>{learningAnalysis.grade}</div>
                </div>
                <Award className='h-8 w-8 text-amber-500' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* タブナビゲーション */}
        <div className='flex space-x-2 rounded-lg bg-white p-1 shadow dark:bg-gray-800'>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className='mr-2 inline-block h-4 w-4' />
            対話コーチング
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === 'plan'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Target className='mr-2 inline-block h-4 w-4' />
            学習プラン
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === 'analysis'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className='mr-2 inline-block h-4 w-4' />
            弱点分析
          </button>
        </div>

        {/* チャットタブ */}
        {activeTab === 'chat' && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <Card className='flex h-[600px] flex-col'>
                <CardHeader className='border-b dark:border-gray-700'>
                  <CardTitle className='flex items-center'>
                    <Brain className='mr-2 h-5 w-5 text-purple-600' />
                    AIコーチとの対話
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex-1 overflow-hidden p-0'>
                  <ScrollArea className='h-full p-4'>
                    <div className='space-y-4'>
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                            }`}
                          >
                            <p className='whitespace-pre-line text-sm'>{message.content}</p>
                            {message.metadata?.suggestions && (
                              <div className='mt-3 space-y-1'>
                                {message.metadata.suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setUserInput(suggestion)}
                                    className='block w-full rounded border border-gray-300 bg-white px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                  >
                                    <Lightbulb className='mr-1 inline-block h-3 w-3' />
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isAITyping && (
                        <div className='flex justify-start'>
                          <div className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
                            <div className='flex space-x-2'>
                              <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                              <div
                                className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                                style={{ animationDelay: '0.1s' }}
                              ></div>
                              <div
                                className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                                style={{ animationDelay: '0.2s' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className='border-t p-4 dark:border-gray-700'>
                  <div className='flex space-x-2'>
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder='質問や相談を入力してください...'
                      disabled={isAITyping}
                    />
                    <Button onClick={sendMessage} disabled={isAITyping || !userInput.trim()}>
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* 強み・弱みサマリー */}
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-sm'>
                    <TrendingUp className='mr-2 h-4 w-4 text-green-500' />
                    あなたの強み
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {learningAnalysis.strengthAreas.map((area, idx) => (
                    <div key={idx} className='rounded-lg bg-green-50 p-3 dark:bg-green-900/20'>
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {area.name}
                        </span>
                        <span className='text-sm font-bold text-green-600'>{area.score}%</span>
                      </div>
                      <Progress value={area.score} className='h-1' />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center text-sm'>
                    <TrendingDown className='mr-2 h-4 w-4 text-red-500' />
                    改善が必要な領域
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {learningAnalysis.weaknesses.slice(0, 3).map((weakness, idx) => (
                    <div
                      key={idx}
                      className='rounded-lg border-l-4 bg-red-50 p-3 dark:bg-red-900/20'
                      style={{
                        borderColor:
                          weakness.severity === 'critical'
                            ? '#ef4444'
                            : weakness.severity === 'moderate'
                              ? '#f97316'
                              : '#f59e0b',
                      }}
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <span className='text-sm font-medium text-gray-900 dark:text-white'>
                          {weakness.area}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(weakness.score)}`}>
                          {weakness.score}%
                        </span>
                      </div>
                      <Progress value={weakness.score} className='h-1' />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 学習プランタブ */}
        {activeTab === 'plan' && (
          <Card>
            <CardHeader>
              <CardTitle>6週間個別学習プラン</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {studyPlan.map((module) => (
                  <div
                    key={module.week}
                    className={`rounded-lg border-2 p-4 ${
                      module.status === 'current'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : module.status === 'completed'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <Badge
                            variant={
                              module.status === 'current'
                                ? 'default'
                                : module.status === 'completed'
                                  ? 'default'
                                  : 'outline'
                            }
                          >
                            第{module.week}週
                          </Badge>
                          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {module.focus}
                          </h3>
                        </div>
                        <div className='mb-2 flex flex-wrap gap-2'>
                          {module.topics.map((topic, idx) => (
                            <Badge key={idx} variant='secondary'>
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-300'>
                          推定学習時間: {module.estimatedHours}時間
                        </div>
                      </div>
                      {module.status === 'current' && (
                        <Button>
                          <BookOpen className='mr-2 h-4 w-4' />
                          学習開始
                        </Button>
                      )}
                      {module.status === 'completed' && (
                        <CheckCircle2 className='h-8 w-8 text-green-500' />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 弱点分析タブ */}
        {activeTab === 'analysis' && (
          <div className='space-y-6'>
            {learningAnalysis.weaknesses.map((weakness, idx) => (
              <Card key={idx} className={`border-2 ${getSeverityColor(weakness.severity)}`}>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <AlertCircle
                        className={`h-6 w-6 ${
                          weakness.severity === 'critical'
                            ? 'text-red-600'
                            : weakness.severity === 'moderate'
                              ? 'text-orange-600'
                              : 'text-yellow-600'
                        }`}
                      />
                      <div>
                        <CardTitle>{weakness.area}</CardTitle>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>
                          {weakness.knowledgeArea}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className={`text-3xl font-bold ${getScoreColor(weakness.score)}`}>
                        {weakness.score}%
                      </div>
                      <Badge
                        variant={
                          weakness.severity === 'critical'
                            ? 'destructive'
                            : weakness.severity === 'moderate'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        優先度 {weakness.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <div className='mb-2 flex items-center justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-300'>現在の習熟度</span>
                      <span className='font-medium'>{weakness.score}% → 目標: 75%</span>
                    </div>
                    <Progress value={weakness.score} className='h-2' />
                  </div>

                  <div className='rounded-lg bg-white p-4 dark:bg-gray-800'>
                    <h4 className='mb-2 flex items-center font-semibold text-gray-900 dark:text-white'>
                      <Lightbulb className='mr-2 h-5 w-5 text-yellow-500' />
                      改善アドバイス
                    </h4>
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      {weakness.recommendation}
                    </p>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300'>
                      <Clock className='h-4 w-4' />
                      <span>推定学習時間: {weakness.estimatedTime}</span>
                    </div>
                    <Button>
                      <Target className='mr-2 h-4 w-4' />
                      集中学習を開始
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* プロトタイプ情報 */}
        <div className='rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20'>
          <h3 className='mb-2 font-semibold text-purple-900 dark:text-purple-100'>
            プロトタイプ情報
          </h3>
          <p className='text-sm text-purple-700 dark:text-purple-200'>
            このプロトタイプは、AIコーチング機能のUX改善を検証するためのものです。
            実際の実装では、機械学習モデル、自然言語処理、個別化アルゴリズムを使用して
            より高度な学習支援を実現します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default AICoachingPrototype
