import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Progress } from '../../ui/progress'
import { Alert, AlertDescription } from '../../ui/alert'
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Shield,
  Heart,
  Building,
  Zap,
} from 'lucide-react'
import BusinessValueAssessment from './BusinessValueAssessment'
import OKRManagement from './OKRManagement'
import FinancialMetricsCalculator from './FinancialMetricsCalculator'
import { Link } from 'react-router-dom'

const ProjectBenefitLearning = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSections, setCompletedSections] = useState(new Set())
  const [selectedValueType, setSelectedValueType] = useState(null)
  const [learningProgress, setLearningProgress] = useState(0)

  // ベネフィット学習データ
  const learningModules = [
    {
      id: 'introduction',
      title: 'プロジェクトベネフィットの基礎',
      description: 'ベネフィット管理の重要性と基本概念を学習',
      duration: '15分',
      topics: [
        'ベネフィットとは何か',
        'ベネフィット実現のプロセス',
        'ステークホルダーへの価値提供',
        '測定可能な成果の定義',
      ],
    },
    {
      id: 'value-types',
      title: 'ビジネス価値の種類',
      description: '多様な価値の形態とその評価方法',
      duration: '20分',
      topics: [
        '財務的価値（ROI、NPV、IRR）',
        '戦略的価値（競争優位、市場シェア）',
        '社会的価値（CSR、持続可能性）',
        '運用効率性の向上',
      ],
    },
    {
      id: 'assessment',
      title: 'ニーズアセスメント',
      description: 'ステークホルダーのニーズと期待の分析',
      duration: '25分',
      topics: [
        'ステークホルダー分析手法',
        'ニーズの優先順位付け',
        '期待値の管理',
        'ギャップ分析の実施',
      ],
    },
    {
      id: 'business-case',
      title: 'ビジネスケース作成',
      description: 'プロジェクト承認のための説得力のある提案書作成',
      duration: '30分',
      topics: [
        'ビジネスケースの構成要素',
        '投資対効果の計算',
        'リスクと機会の評価',
        'タイムラインと成果物の定義',
      ],
    },
    {
      id: 'benefit-plan',
      title: 'ベネフィット管理計画',
      description: 'ベネフィット実現のための包括的な計画策定',
      duration: '35分',
      topics: [
        'ベネフィット実現マップ',
        'KPIと測定指標の設定',
        'モニタリング体制の構築',
        '継続的改善プロセス',
      ],
    },
  ]

  const valueTypes = [
    {
      id: 'financial',
      name: '財務的価値',
      icon: DollarSign,
      color: 'bg-green-500',
      description: '収益増加、コスト削減、投資効率の改善',
      metrics: ['ROI', 'NPV', 'IRR', 'Payback Period'],
      examples: [
        '売上高の20%増加',
        'オペレーションコストの15%削減',
        '新規顧客獲得による収益向上',
        'プロセス自動化による効率化',
      ],
    },
    {
      id: 'strategic',
      name: '戦略的価値',
      icon: Target,
      color: 'bg-blue-500',
      description: '競争優位性、市場地位、ブランド価値の向上',
      metrics: ['Market Share', 'Brand Value', 'Competitive Position', 'Innovation Index'],
      examples: [
        '市場シェアの拡大',
        '新市場への参入',
        'ブランド認知度の向上',
        'イノベーション能力の強化',
      ],
    },
    {
      id: 'social',
      name: '社会的価値',
      icon: Heart,
      color: 'bg-purple-500',
      description: 'CSR、持続可能性、社会貢献',
      metrics: ['ESG Score', 'Carbon Footprint', 'Community Impact', 'Employee Satisfaction'],
      examples: [
        'CO2排出量の削減',
        '地域コミュニティへの貢献',
        'ダイバーシティの促進',
        '働きがいのある職場環境',
      ],
    },
    {
      id: 'operational',
      name: '運用価値',
      icon: Activity,
      color: 'bg-orange-500',
      description: '業務効率、品質向上、プロセス改善',
      metrics: ['Efficiency Ratio', 'Quality Score', 'Process Time', 'Error Rate'],
      examples: ['処理時間の短縮', '品質指標の改善', 'エラー率の削減', 'システム可用性の向上'],
    },
    {
      id: 'compliance',
      name: 'コンプライアンス価値',
      icon: Shield,
      color: 'bg-red-500',
      description: '規制遵守、リスク軽減、セキュリティ強化',
      metrics: ['Compliance Rate', 'Risk Score', 'Security Index', 'Audit Results'],
      examples: [
        '法規制への完全準拠',
        'セキュリティリスクの軽減',
        '監査結果の改善',
        'データ保護の強化',
      ],
    },
    {
      id: 'market',
      name: '市場価値',
      icon: Globe,
      color: 'bg-teal-500',
      description: '顧客満足度、市場機会、競争力',
      metrics: ['Customer Satisfaction', 'Market Opportunity', 'NPS', 'Customer Retention'],
      examples: [
        '顧客満足度の向上',
        '新しい収益機会の創出',
        '顧客ロイヤルティの強化',
        'サービス品質の向上',
      ],
    },
  ]

  const assessmentSteps = [
    {
      title: 'ステークホルダー特定',
      description: 'プロジェクトに関わる全ステークホルダーを洗い出し',
      actions: ['内部ステークホルダーの識別', '外部ステークホルダーの識別', '影響度と関心度の評価'],
    },
    {
      title: 'ニーズ分析',
      description: '各ステークホルダーの具体的なニーズと期待を調査',
      actions: ['インタビューの実施', 'アンケート調査', 'ワークショップの開催'],
    },
    {
      title: '優先順位付け',
      description: 'ニーズの重要度と実現可能性による優先順位の決定',
      actions: ['MoSCoW法の適用', 'コスト・ベネフィット分析', 'リスク評価'],
    },
    {
      title: 'ギャップ分析',
      description: '現状と理想状態の差異を明確化',
      actions: ['現状分析', '目標状態の定義', 'ギャップの定量化'],
    },
  ]

  useEffect(() => {
    const completed = completedSections.size
    const total = learningModules.length
    setLearningProgress((completed / total) * 100)
  }, [completedSections, learningModules.length])

  const markSectionComplete = (sectionId) => {
    setCompletedSections((prev) => new Set([...prev, sectionId]))
  }

  const isCompleted = (sectionId) => completedSections.has(sectionId)

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto max-w-7xl'>
        {/* ヘッダー */}
        <div className='mb-8 text-center'>
          <h1 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'>
            プロジェクトのベネフィットと価値
          </h1>
          <p className='text-lg text-gray-600'>
            ビジネス価値の創造とベネフィット実現のための包括的学習プログラム
          </p>
          <div className='mt-4'>
            <Progress value={learningProgress} className='h-3' />
            <p className='mt-2 text-sm text-gray-500'>
              学習進捗: {Math.round(learningProgress)}% ({completedSections.size}/
              {learningModules.length} モジュール完了)
            </p>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 lg:grid-cols-6'>
            <TabsTrigger value='overview'>概要</TabsTrigger>
            <TabsTrigger value='value-types'>価値の種類</TabsTrigger>
            <TabsTrigger value='assessment'>アセスメント</TabsTrigger>
            <TabsTrigger value='business-case'>ビジネスケース</TabsTrigger>
            <TabsTrigger value='incremental'>漸進型価値</TabsTrigger>
            <TabsTrigger value='tools'>実践ツール</TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value='overview' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-6 w-6 text-blue-600' />
                  学習モジュール一覧
                </CardTitle>
                <CardDescription>
                  プロジェクトベネフィット管理の基礎から実践まで段階的に学習
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {learningModules.map((module, index) => (
                  <Card key={module.id} className='transition-all hover:shadow-md'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              isCompleted(module.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isCompleted(module.id) ? (
                              <CheckCircle2 className='h-4 w-4' />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <CardTitle className='text-lg'>{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant='outline'>{module.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        {module.topics.map((topic, topicIndex) => (
                          <div
                            key={topicIndex}
                            className='flex items-center gap-2 text-sm text-gray-600'
                          >
                            <div className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                            {topic}
                          </div>
                        ))}
                      </div>
                      <div className='mt-4 flex justify-between'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => markSectionComplete(module.id)}
                          disabled={isCompleted(module.id)}
                        >
                          {isCompleted(module.id) ? '完了済み' : '学習開始'}
                        </Button>
                        <Button variant='ghost' size='sm'>
                          詳細を見る <ArrowRight className='ml-1 h-3 w-3' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* 学習のポイント */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lightbulb className='h-6 w-6 text-yellow-600' />
                  学習のポイント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Alert>
                    <Target className='h-4 w-4' />
                    <AlertDescription>
                      <strong>価値の明確化</strong>
                      <br />
                      プロジェクトが提供する価値を具体的に定義し、測定可能な指標で表現する
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Users className='h-4 w-4' />
                    <AlertDescription>
                      <strong>ステークホルダー中心</strong>
                      <br />
                      全ステークホルダーの視点から価値を評価し、期待値を適切に管理する
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <BarChart3 className='h-4 w-4' />
                    <AlertDescription>
                      <strong>継続的監視</strong>
                      <br />
                      ベネフィット実現を継続的にモニタリングし、必要に応じて計画を調整する
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 価値の種類タブ */}
          <TabsContent value='value-types' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <PieChart className='h-6 w-6 text-purple-600' />
                  ビジネス価値の分類
                </CardTitle>
                <CardDescription>プロジェクトが創出する多様な価値の種類と評価方法</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                  {valueTypes.map((valueType) => {
                    const IconComponent = valueType.icon
                    return (
                      <Card
                        key={valueType.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedValueType === valueType.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() =>
                          setSelectedValueType(
                            selectedValueType === valueType.id ? null : valueType.id
                          )
                        }
                      >
                        <CardHeader>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${valueType.color} text-white`}
                            >
                              <IconComponent className='h-5 w-5' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>{valueType.name}</CardTitle>
                              <CardDescription className='text-sm'>
                                {valueType.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-3'>
                            <div>
                              <h4 className='mb-2 text-sm font-medium text-gray-700'>主要指標</h4>
                              <div className='flex flex-wrap gap-1'>
                                {valueType.metrics.map((metric) => (
                                  <Badge key={metric} variant='secondary' className='text-xs'>
                                    {metric}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {selectedValueType === valueType.id && (
                              <div>
                                <h4 className='mb-2 text-sm font-medium text-gray-700'>具体例</h4>
                                <ul className='space-y-1'>
                                  {valueType.examples.map((example, index) => (
                                    <li
                                      key={index}
                                      className='flex items-start gap-2 text-xs text-gray-600'
                                    >
                                      <div className='mt-1.5 h-1 w-1 rounded-full bg-gray-400' />
                                      {example}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* アセスメントタブ */}
          <TabsContent value='assessment' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-6 w-6 text-green-600' />
                  ニーズアセスメントプロセス
                </CardTitle>
                <CardDescription>
                  ステークホルダーのニーズと期待を体系的に分析する手法
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {assessmentSteps.map((step, index) => (
                    <div key={index} className='flex gap-4'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600'>
                        {index + 1}
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-900'>{step.title}</h3>
                        <p className='mb-3 text-gray-600'>{step.description}</p>
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                          {step.actions.map((action, actionIndex) => (
                            <div
                              key={actionIndex}
                              className='flex items-center gap-2 rounded bg-gray-50 p-2 text-sm text-gray-600'
                            >
                              <CheckCircle2 className='h-3 w-3 text-green-500' />
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ベストプラクティス */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-6 w-6 text-orange-600' />
                  アセスメントのベストプラクティス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <Alert>
                    <Zap className='h-4 w-4' />
                    <AlertDescription>
                      <strong>早期実施</strong>
                      <br />
                      プロジェクト開始前にニーズアセスメントを完了し、要件定義に反映させる
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Building className='h-4 w-4' />
                    <AlertDescription>
                      <strong>組織的アプローチ</strong>
                      <br />
                      部門横断的なチームでアセスメントを実施し、組織全体の視点を取り入れる
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ビジネスケースタブ */}
          <TabsContent value='business-case' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-6 w-6 text-blue-600' />
                  ビジネスケース作成ガイド
                </CardTitle>
                <CardDescription>説得力のあるプロジェクト提案書の作成方法</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <div>
                      <h3 className='mb-4 text-lg font-semibold text-gray-900'>必須構成要素</h3>
                      <div className='space-y-3'>
                        {[
                          '問題の定義と背景',
                          '提案するソリューション',
                          '期待される成果とベネフィット',
                          '投資対効果の分析',
                          'リスクと軽減策',
                          '実装計画とタイムライン',
                        ].map((item, index) => (
                          <div
                            key={index}
                            className='flex items-center gap-3 rounded-lg bg-blue-50 p-3'
                          >
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white'>
                              {index + 1}
                            </div>
                            <span className='text-sm font-medium text-gray-700'>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className='mb-4 text-lg font-semibold text-gray-900'>財務指標の計算</h3>
                      <div className='space-y-4'>
                        <div className='rounded-lg bg-green-50 p-4'>
                          <h4 className='font-medium text-green-900'>ROI (投資収益率)</h4>
                          <p className='text-sm text-green-700'>
                            ROI = (利益 - 投資額) / 投資額 × 100
                          </p>
                        </div>
                        <div className='rounded-lg bg-purple-50 p-4'>
                          <h4 className='font-medium text-purple-900'>NPV (正味現在価値)</h4>
                          <p className='text-sm text-purple-700'>
                            将来のキャッシュフローを現在価値に割引
                          </p>
                        </div>
                        <div className='rounded-lg bg-orange-50 p-4'>
                          <h4 className='font-medium text-orange-900'>IRR (内部収益率)</h4>
                          <p className='text-sm text-orange-700'>NPVをゼロにする割引率</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 漸進型価値タブ */}
          <TabsContent value='incremental' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-6 w-6 text-blue-600' />
                  漸進型価値実現の視覚化
                </CardTitle>
                <CardDescription>
                  アジャイル開発における段階的な価値提供とビジネスインパクトの詳細分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-center'>
                  <p className='mb-6 text-gray-600'>
                    アジャイル開発における価値実現パターンを対話的な視覚化で学習できます。
                    スプリントごとの価値提供、フィードバックループ効果、ROI分析などを包括的に分析します。
                  </p>
                  <Link
                    to='/incremental-value'
                    className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700'
                  >
                    <Activity className='h-5 w-5' />
                    漸進型価値実現の視覚化を開く
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>

                <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='rounded-lg bg-blue-50 p-4 text-center'>
                    <Activity className='mx-auto mb-2 h-8 w-8 text-blue-600' />
                    <h3 className='font-semibold text-blue-900'>価値タイムライン</h3>
                    <p className='text-sm text-blue-700'>
                      アジャイル vs ウォーターフォールの価値実現パターン比較
                    </p>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 text-center'>
                    <BarChart3 className='mx-auto mb-2 h-8 w-8 text-green-600' />
                    <h3 className='font-semibold text-green-900'>ROI分析</h3>
                    <p className='text-sm text-green-700'>
                      投資対効果の詳細な財務分析とシミュレーション
                    </p>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4 text-center'>
                    <Target className='mx-auto mb-2 h-8 w-8 text-purple-600' />
                    <h3 className='font-semibold text-purple-900'>MVP進捗</h3>
                    <p className='text-sm text-purple-700'>段階的なMVP構築と価値向上プロセス</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 実践ツールタブ */}
          <TabsContent value='tools' className='space-y-6'>
            <div className='mb-6'>
              <FinancialMetricsCalculator />
            </div>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <BusinessValueAssessment />
              <OKRManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default React.memo(ProjectBenefitLearning)
