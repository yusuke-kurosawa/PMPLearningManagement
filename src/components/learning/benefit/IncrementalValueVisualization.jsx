import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Slider } from '../../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Alert, AlertDescription } from '../../ui/alert'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
  Scatter,
  ScatterChart,
} from 'recharts'
import {
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  Award,
  Zap,
  ArrowRight,
  BarChart3,
  Activity,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Settings,
  Info,
  Calculator,
  Gauge,
  MessageCircle,
} from 'lucide-react'

const IncrementalValueVisualization = () => {
  const [sprintCount, setSprintCount] = useState([8])
  const [sprintDuration, setSprintDuration] = useState([2])
  const [teamVelocity, setTeamVelocity] = useState([75])
  const [valuePerSprint, setValuePerSprint] = useState([12])
  const [selectedScenario, setSelectedScenario] = useState('balanced')
  const [activeTab, setActiveTab] = useState('timeline')
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [customSprintValues, setCustomSprintValues] = useState([])
  const [feedbackImpact, setFeedbackImpact] = useState([15])

  // シナリオ定義
  const scenarios = {
    conservative: {
      name: '保守的アプローチ',
      description: '慎重な段階的リリース',
      color: '#8b5cf6',
      valuePattern: [8, 10, 12, 14, 16, 18, 20, 22],
      riskReduction: 0.8,
      feedbackValue: 10,
    },
    balanced: {
      name: 'バランス型',
      description: '適度なリスクテイク',
      color: '#06b6d4',
      valuePattern: [10, 12, 15, 18, 20, 22, 25, 28],
      riskReduction: 0.6,
      feedbackValue: 15,
    },
    aggressive: {
      name: 'アグレッシブ',
      description: '早期価値最大化',
      color: '#10b981',
      valuePattern: [15, 18, 22, 25, 28, 30, 32, 35],
      riskReduction: 0.4,
      feedbackValue: 20,
    },
  }

  // タイムラインデータ生成
  const timelineData = useMemo(() => {
    const sprints = sprintCount[0]
    const scenario = scenarios[selectedScenario]
    const customValues = customSprintValues.length > 0 ? customSprintValues : scenario.valuePattern

    const data = []
    let cumulativeAgile = 0
    const waterfallDelay = Math.ceil(sprints * 0.6) // ウォーターフォールは60%遅延

    for (let i = 0; i <= sprints; i++) {
      const week = i * sprintDuration[0]
      const sprintValue = i === 0 ? 0 : customValues[i - 1] || valuePerSprint[0]

      // フィードバック効果を考慮
      const feedbackBonus = i > 2 ? (i - 2) * (feedbackImpact[0] / 100) : 0
      const adjustedValue = sprintValue * (1 + feedbackBonus)

      cumulativeAgile += adjustedValue

      // ウォーターフォールの価値実現（プロジェクト終了後に一括）
      const waterfallValue = i >= waterfallDelay ? cumulativeAgile * 1.2 : 0

      data.push({
        week,
        sprint: i,
        sprintValue: adjustedValue,
        cumulativeAgile,
        waterfallValue,
        riskLevel: Math.max(100 - i * 10, 20),
        mvpReadiness: Math.min((i / 3) * 100, 100),
      })
    }

    return data
  }, [
    sprintCount,
    sprintDuration,
    valuePerSprint,
    selectedScenario,
    customSprintValues,
    feedbackImpact,
  ])

  // MVPマイルストーンデータ
  const mvpMilestones = useMemo(() => {
    const sprints = sprintCount[0]
    return [
      { sprint: 2, name: 'MVP Alpha', value: 20, description: '基本機能完成' },
      {
        sprint: Math.ceil(sprints * 0.4),
        name: 'MVP Beta',
        value: 50,
        description: 'コア機能統合',
      },
      {
        sprint: Math.ceil(sprints * 0.7),
        name: 'MVP Release',
        value: 80,
        description: '市場投入準備',
      },
      { sprint: sprints, name: 'Full Product', value: 100, description: '全機能完成' },
    ]
  }, [sprintCount])

  // ROI比較データ
  const roiComparisonData = useMemo(() => {
    const totalAgileValue = timelineData[timelineData.length - 1]?.cumulativeAgile || 0
    const totalWaterfallValue = totalAgileValue * 1.2
    const investment = 100

    return [
      {
        approach: 'ウォーターフォール',
        roi: (((totalWaterfallValue - investment) / investment) * 100).toFixed(1),
        timeToValue: sprintCount[0] * sprintDuration[0] * 0.6,
        risk: 'High',
        flexibility: 'Low',
        value: totalWaterfallValue,
      },
      {
        approach: 'アジャイル',
        roi: (((totalAgileValue - investment) / investment) * 100).toFixed(1),
        timeToValue: sprintDuration[0] * 2,
        risk: 'Low',
        flexibility: 'High',
        value: totalAgileValue,
      },
    ]
  }, [timelineData, sprintCount, sprintDuration])

  // 価値実現パターンデータ
  const valuePatternData = useMemo(() => {
    return Object.entries(scenarios).map(([key, scenario]) => ({
      name: scenario.name,
      earlyValue: scenario.valuePattern.slice(0, 3).reduce((a, b) => a + b, 0),
      midValue: scenario.valuePattern.slice(3, 6).reduce((a, b) => a + b, 0),
      lateValue: scenario.valuePattern.slice(6).reduce((a, b) => a + b, 0),
      totalValue: scenario.valuePattern.reduce((a, b) => a + b, 0),
      risk: scenario.riskReduction,
      color: scenario.color,
    }))
  }, [])

  // フィードバックループデータ
  const feedbackLoopData = useMemo(() => {
    const data = []
    for (let i = 1; i <= sprintCount[0]; i++) {
      const baseFeedback = 50
      const improvementRate = feedbackImpact[0] / 100
      const cumulativeImprovement = (i - 1) * improvementRate * 10

      data.push({
        sprint: i,
        userFeedback: baseFeedback + Math.random() * 30 - 15,
        qualityImprovement: Math.min(baseFeedback + cumulativeImprovement, 95),
        featureAdoption: Math.min((i / sprintCount[0]) * 100, 90),
        iteration: i,
      })
    }
    return data
  }, [sprintCount, feedbackImpact])

  const resetToDefaults = () => {
    setSprintCount([8])
    setSprintDuration([2])
    setTeamVelocity([75])
    setValuePerSprint([12])
    setSelectedScenario('balanced')
    setFeedbackImpact([15])
    setCustomSprintValues([])
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded-lg border border-gray-300 bg-white p-3 shadow-lg'>
          <p className='font-medium'>{`スプリント ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto max-w-7xl'>
        {/* ヘッダー */}
        <div className='mb-8 text-center'>
          <h1 className='mb-4 text-3xl font-bold text-gray-900 sm:text-4xl'>
            漸進型価値実現の視覚化
          </h1>
          <p className='mb-6 text-lg text-gray-600'>
            アジャイル開発における段階的な価値提供とビジネスインパクトの分析
          </p>
          <div className='flex flex-wrap justify-center gap-4'>
            <Badge variant='outline' className='bg-green-50 text-green-700'>
              <TrendingUp className='mr-1 h-3 w-3' />
              継続的価値提供
            </Badge>
            <Badge variant='outline' className='bg-blue-50 text-blue-700'>
              <Target className='mr-1 h-3 w-3' />
              リスク軽減
            </Badge>
            <Badge variant='outline' className='bg-purple-50 text-purple-700'>
              <Zap className='mr-1 h-3 w-3' />
              早期フィードバック
            </Badge>
          </div>
        </div>

        {/* コントロールパネル */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5 text-blue-600' />
              シミュレーション設定
            </CardTitle>
            <CardDescription>
              プロジェクトパラメータを調整して価値実現パターンを分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>スプリント数: {sprintCount[0]}</label>
                <Slider
                  value={sprintCount}
                  onValueChange={setSprintCount}
                  max={12}
                  min={4}
                  step={1}
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>スプリント期間: {sprintDuration[0]}週</label>
                <Slider
                  value={sprintDuration}
                  onValueChange={setSprintDuration}
                  max={4}
                  min={1}
                  step={1}
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>価値/スプリント: {valuePerSprint[0]}</label>
                <Slider
                  value={valuePerSprint}
                  onValueChange={setValuePerSprint}
                  max={30}
                  min={5}
                  step={1}
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  フィードバック効果: {feedbackImpact[0]}%
                </label>
                <Slider
                  value={feedbackImpact}
                  onValueChange={setFeedbackImpact}
                  max={50}
                  min={0}
                  step={5}
                  className='w-full'
                />
              </div>
            </div>
            <div className='mt-6 flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>実現シナリオ:</label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger className='w-40'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scenarios).map(([key, scenario]) => (
                      <SelectItem key={key} value={key}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={resetToDefaults} variant='outline' size='sm'>
                <RotateCcw className='mr-2 h-4 w-4' />
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 lg:grid-cols-5'>
            <TabsTrigger value='timeline'>価値タイムライン</TabsTrigger>
            <TabsTrigger value='comparison'>比較分析</TabsTrigger>
            <TabsTrigger value='mvp'>MVP進捗</TabsTrigger>
            <TabsTrigger value='feedback'>フィードバックループ</TabsTrigger>
            <TabsTrigger value='roi'>ROI分析</TabsTrigger>
          </TabsList>

          {/* 価値タイムライン */}
          <TabsContent value='timeline' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-6 w-6 text-blue-600' />
                  累積価値実現タイムライン
                </CardTitle>
                <CardDescription>
                  アジャイル vs ウォーターフォールの価値提供パターン比較
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-96'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart data={timelineData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        dataKey='week'
                        label={{ value: '週', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis label={{ value: '累積価値', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={customTooltip} />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='cumulativeAgile'
                        stroke='#06b6d4'
                        fill='#06b6d4'
                        fillOpacity={0.3}
                        name='アジャイル (累積)'
                      />
                      <Line
                        type='monotone'
                        dataKey='waterfallValue'
                        stroke='#ef4444'
                        strokeWidth={3}
                        name='ウォーターフォール'
                        strokeDasharray='5 5'
                      />
                      <Bar
                        dataKey='sprintValue'
                        fill='#10b981'
                        name='スプリント価値'
                        fillOpacity={0.7}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* マイルストーン表示 */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-6 w-6 text-green-600' />
                  価値実現マイルストーン
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  {mvpMilestones.map((milestone, index) => (
                    <Card key={index} className='text-center'>
                      <CardContent className='pt-6'>
                        <div className='mb-2'>
                          <div
                            className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
                              milestone.sprint <= sprintCount[0]
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}
                          >
                            {milestone.sprint <= sprintCount[0] ? (
                              <CheckCircle2 className='h-6 w-6' />
                            ) : (
                              <Clock className='h-6 w-6' />
                            )}
                          </div>
                          <h3 className='font-semibold'>{milestone.name}</h3>
                        </div>
                        <p className='mb-2 text-sm text-gray-600'>{milestone.description}</p>
                        <Badge
                          variant={milestone.sprint <= sprintCount[0] ? 'default' : 'secondary'}
                        >
                          スプリント {milestone.sprint}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 比較分析 */}
          <TabsContent value='comparison' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* 価値実現パターン比較 */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BarChart3 className='h-6 w-6 text-purple-600' />
                    価値実現パターン比較
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={valuePatternData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='earlyValue' stackId='a' fill='#10b981' name='初期価値' />
                        <Bar dataKey='midValue' stackId='a' fill='#06b6d4' name='中期価値' />
                        <Bar dataKey='lateValue' stackId='a' fill='#8b5cf6' name='後期価値' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* リスク軽減効果 */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <AlertCircle className='h-6 w-6 text-orange-600' />
                    リスク軽減効果
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='sprint' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type='monotone'
                          dataKey='riskLevel'
                          stroke='#ef4444'
                          strokeWidth={3}
                          name='リスクレベル (%)'
                        />
                        <Line
                          type='monotone'
                          dataKey='mvpReadiness'
                          stroke='#10b981'
                          strokeWidth={3}
                          name='MVP準備度 (%)'
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* アプローチ比較テーブル */}
            <Card>
              <CardHeader>
                <CardTitle>開発アプローチ比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='p-2 text-left'>アプローチ</th>
                        <th className='p-2 text-left'>ROI (%)</th>
                        <th className='p-2 text-left'>価値実現開始</th>
                        <th className='p-2 text-left'>リスク</th>
                        <th className='p-2 text-left'>柔軟性</th>
                        <th className='p-2 text-left'>総価値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiComparisonData.map((row, index) => (
                        <tr key={index} className='border-b'>
                          <td className='p-2 font-medium'>{row.approach}</td>
                          <td className='p-2'>{row.roi}%</td>
                          <td className='p-2'>{row.timeToValue}週</td>
                          <td className='p-2'>
                            <Badge variant={row.risk === 'High' ? 'destructive' : 'default'}>
                              {row.risk}
                            </Badge>
                          </td>
                          <td className='p-2'>
                            <Badge variant={row.flexibility === 'High' ? 'default' : 'secondary'}>
                              {row.flexibility}
                            </Badge>
                          </td>
                          <td className='p-2'>{row.value.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MVP進捗 */}
          <TabsContent value='mvp' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-6 w-6 text-yellow-600' />
                  MVP段階的構築プロセス
                </CardTitle>
                <CardDescription>Minimum Viable Productの段階的な価値向上</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-96'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart data={timelineData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='sprint' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type='monotone'
                        dataKey='mvpReadiness'
                        stroke='#f59e0b'
                        fill='#f59e0b'
                        fillOpacity={0.3}
                        name='MVP準備度 (%)'
                      />
                      <Bar
                        dataKey='sprintValue'
                        fill='#10b981'
                        name='スプリント価値'
                        fillOpacity={0.7}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* MVP価値マップ */}
            <Card>
              <CardHeader>
                <CardTitle>MVP価値マップ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {[
                    {
                      phase: 'Alpha',
                      features: ['基本ユーザー登録', 'コア機能', 'シンプルUI'],
                      value: 25,
                    },
                    {
                      phase: 'Beta',
                      features: ['統合テスト完了', 'パフォーマンス最適化', 'フィードバック収集'],
                      value: 60,
                    },
                    {
                      phase: 'Release',
                      features: ['本番環境準備', 'ドキュメント完備', '運用監視'],
                      value: 100,
                    },
                  ].map((mvp, index) => (
                    <Card key={index} className='text-center'>
                      <CardHeader>
                        <CardTitle className='text-lg'>MVP {mvp.phase}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='mb-4'>
                          <div className='mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-bold text-white'>
                            {mvp.value}%
                          </div>
                        </div>
                        <ul className='space-y-1 text-sm'>
                          {mvp.features.map((feature, fIndex) => (
                            <li key={fIndex} className='flex items-center gap-2'>
                              <CheckCircle2 className='h-3 w-3 text-green-500' />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* フィードバックループ */}
          <TabsContent value='feedback' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MessageCircle className='h-6 w-6 text-green-600' />
                  フィードバックループ効果
                </CardTitle>
                <CardDescription>
                  継続的フィードバックによる品質とユーザー満足度の向上
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-96'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={feedbackLoopData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='sprint' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='userFeedback'
                        stroke='#06b6d4'
                        strokeWidth={2}
                        name='ユーザーフィードバック'
                      />
                      <Line
                        type='monotone'
                        dataKey='qualityImprovement'
                        stroke='#10b981'
                        strokeWidth={2}
                        name='品質改善'
                      />
                      <Line
                        type='monotone'
                        dataKey='featureAdoption'
                        stroke='#8b5cf6'
                        strokeWidth={2}
                        name='機能採用率'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* フィードバック価値 */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>早期フィードバック</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <div className='mb-2 text-3xl font-bold text-green-600'>
                      +{feedbackImpact[0]}%
                    </div>
                    <p className='text-sm text-gray-600'>価値向上効果</p>
                  </div>
                  <Alert className='mt-4'>
                    <Lightbulb className='h-4 w-4' />
                    <AlertDescription>
                      早期のユーザーフィードバックにより、機能の価値と使いやすさが向上
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>継続的改善</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <div className='mb-2 text-3xl font-bold text-blue-600'>
                      {Math.round((feedbackImpact[0] / 100) * sprintCount[0] * 10)}%
                    </div>
                    <p className='text-sm text-gray-600'>品質向上率</p>
                  </div>
                  <Alert className='mt-4'>
                    <Target className='h-4 w-4' />
                    <AlertDescription>
                      スプリントごとの改善により、最終品質が大幅に向上
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>市場適応性</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <div className='mb-2 text-3xl font-bold text-purple-600'>90%</div>
                    <p className='text-sm text-gray-600'>市場ニーズ適合</p>
                  </div>
                  <Alert className='mt-4'>
                    <Activity className='h-4 w-4' />
                    <AlertDescription>
                      継続的な市場フィードバックにより、ニーズに合致した製品を開発
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ROI分析 */}
          <TabsContent value='roi' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calculator className='h-6 w-6 text-blue-600' />
                  投資対効果（ROI）分析
                </CardTitle>
                <CardDescription>漸進型開発による財務的メリットの詳細分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <div>
                    <h3 className='mb-4 text-lg font-semibold'>累積ROI推移</h3>
                    <div className='h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={timelineData}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='sprint' />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type='monotone'
                            dataKey='cumulativeAgile'
                            stroke='#10b981'
                            fill='#10b981'
                            fillOpacity={0.3}
                            name='累積価値'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className='mb-4 text-lg font-semibold'>価値実現速度</h3>
                    <div className='space-y-4'>
                      <div className='rounded-lg bg-green-50 p-4'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>アジャイル</span>
                          <span className='font-bold text-green-600'>
                            {(
                              timelineData[Math.ceil(timelineData.length / 2)]?.cumulativeAgile || 0
                            ).toFixed(1)}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>中間点での価値実現</p>
                      </div>
                      <div className='rounded-lg bg-red-50 p-4'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium'>ウォーターフォール</span>
                          <span className='font-bold text-red-600'>0</span>
                        </div>
                        <p className='text-sm text-gray-600'>中間点での価値実現</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI指標サマリー */}
                <div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='rounded-lg bg-blue-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {roiComparisonData[1]?.roi}%
                    </div>
                    <p className='text-sm text-gray-600'>アジャイルROI</p>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {sprintDuration[0] * 2}週
                    </div>
                    <p className='text-sm text-gray-600'>初期価値実現</p>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {100 - Math.round(scenarios[selectedScenario].riskReduction * 100)}%
                    </div>
                    <p className='text-sm text-gray-600'>リスク軽減</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 財務メトリクス */}
            <Card>
              <CardHeader>
                <CardTitle>主要財務メトリクス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                  <div>
                    <h4 className='mb-3 font-semibold'>アジャイル開発のメリット</h4>
                    <ul className='space-y-2'>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        早期の収益化開始
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        キャッシュフロー改善
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        市場リスクの軽減
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <CheckCircle2 className='h-4 w-4 text-green-500' />
                        投資効率の最適化
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='mb-3 font-semibold'>価値実現の要因</h4>
                    <ul className='space-y-2'>
                      <li className='flex items-center gap-2 text-sm'>
                        <Zap className='h-4 w-4 text-yellow-500' />
                        短いサイクルでの価値提供
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <Target className='h-4 w-4 text-blue-500' />
                        継続的な市場フィードバック
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <Activity className='h-4 w-4 text-purple-500' />
                        適応的な開発プロセス
                      </li>
                      <li className='flex items-center gap-2 text-sm'>
                        <TrendingUp className='h-4 w-4 text-green-500' />
                        学習による価値向上
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 学習ポイント */}
        <Card className='mt-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Lightbulb className='h-6 w-6 text-yellow-600' />
              漸進型価値実現の学習ポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Alert>
                <TrendingUp className='h-4 w-4' />
                <AlertDescription>
                  <strong>早期価値実現</strong>
                  <br />
                  短いサイクルで価値を提供し、早期にビジネス成果を実現する
                </AlertDescription>
              </Alert>
              <Alert>
                <Target className='h-4 w-4' />
                <AlertDescription>
                  <strong>リスク軽減</strong>
                  <br />
                  段階的な開発により、プロジェクトリスクを継続的に軽減する
                </AlertDescription>
              </Alert>
              <Alert>
                <MessageCircle className='h-4 w-4' />
                <AlertDescription>
                  <strong>継続的改善</strong>
                  <br />
                  フィードバックループにより製品品質と市場適合性を向上させる
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default React.memo(IncrementalValueVisualization)
