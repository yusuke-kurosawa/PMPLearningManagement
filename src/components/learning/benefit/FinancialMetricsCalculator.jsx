import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Badge } from '../../ui/badge'
import { Alert, AlertDescription } from '../../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Slider } from '../../ui/slider'
import { Switch } from '../../ui/switch'
import {
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  Calculator,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  Info,
  Download,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'
import * as financialCalc from '../../../utils/financialCalculations'

const FinancialMetricsCalculator = () => {
  // プロジェクトデータの状態管理
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'プロジェクトA',
      initialInvestment: 10000000,
      cashFlows: [3000000, 3500000, 4000000, 4500000, 5000000],
      discountRate: 10,
      active: true,
    },
  ])

  const [activeProjectId, setActiveProjectId] = useState(1)
  const [showComparison, setShowComparison] = useState(false)
  const [sensitivityParameter, setSensitivityParameter] = useState('initialInvestment')
  const [sensitivityRange, setSensitivityRange] = useState([-30, -20, -10, 0, 10, 20, 30])
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // モンテカルロシミュレーション用の状態
  const [simulationParams, setSimulationParams] = useState({
    investmentVolatility: 0.2,
    cashFlowVolatility: 0.15,
    rateVolatility: 0.1,
    iterations: 1000,
  })

  const [simulationResults, setSimulationResults] = useState(null)

  // アクティブなプロジェクトを取得
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

  // プロジェクトの財務指標を計算
  const calculateMetrics = useCallback((project) => {
    if (!project) {
      return null
    }

    const npv = financialCalc.calculateNPV(
      project.initialInvestment,
      project.cashFlows,
      project.discountRate
    )

    const irr = financialCalc.calculateIRR(project.initialInvestment, project.cashFlows)

    const totalCashFlow = project.cashFlows.reduce((sum, cf) => sum + cf, 0)
    const roi = financialCalc.calculateROI(totalCashFlow, project.initialInvestment)

    const payback = financialCalc.calculatePaybackPeriod(
      project.initialInvestment,
      project.cashFlows
    )

    const discountedPayback = financialCalc.calculateDiscountedPaybackPeriod(
      project.initialInvestment,
      project.cashFlows,
      project.discountRate
    )

    // 便益とコストを分離（簡易的にキャッシュフローを便益、初期投資をコストとして扱う）
    const benefits = project.cashFlows
    const costs = new Array(project.cashFlows.length).fill(
      project.initialInvestment / project.cashFlows.length
    )
    const bcr = financialCalc.calculateBCR(benefits, costs, project.discountRate)

    const pi = financialCalc.calculateProfitabilityIndex(
      project.initialInvestment,
      project.cashFlows,
      project.discountRate
    )

    return { npv, irr, roi, payback, discountedPayback, bcr, pi }
  }, [])

  // すべてのプロジェクトのメトリクスを計算
  const projectMetrics = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      metrics: calculateMetrics(project),
    }))
  }, [projects, calculateMetrics])

  // 感度分析の実行
  const sensitivityAnalysis = useMemo(() => {
    if (!activeProject) {
      return []
    }

    const baseCase = {
      ...activeProject,
      npv: calculateMetrics(activeProject).npv,
    }

    return financialCalc.performSensitivityAnalysis(
      baseCase,
      sensitivityParameter,
      sensitivityRange
    )
  }, [activeProject, sensitivityParameter, sensitivityRange, calculateMetrics])

  // プロジェクトの追加
  const addProject = () => {
    const newId = Math.max(...projects.map((p) => p.id)) + 1
    setProjects([
      ...projects,
      {
        id: newId,
        name: `プロジェクト${String.fromCharCode(65 + projects.length)}`,
        initialInvestment: 10000000,
        cashFlows: [3000000, 3500000, 4000000, 4500000, 5000000],
        discountRate: 10,
        active: true,
      },
    ])
    setActiveProjectId(newId)
  }

  // プロジェクトの削除
  const deleteProject = (id) => {
    if (projects.length === 1) {
      return
    }
    setProjects(projects.filter((p) => p.id !== id))
    if (activeProjectId === id) {
      setActiveProjectId(projects.find((p) => p.id !== id)?.id || 1)
    }
  }

  // プロジェクトの更新
  const updateProject = (id, field, value) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  // キャッシュフローの更新
  const updateCashFlow = (projectId, index, value) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const newCashFlows = [...p.cashFlows]
          newCashFlows[index] = parseFloat(value) || 0
          return { ...p, cashFlows: newCashFlows }
        }
        return p
      })
    )
  }

  // キャッシュフロー年数の変更
  const changeCashFlowYears = (projectId, years) => {
    setProjects(
      projects.map((p) => {
        if (p.id === projectId) {
          const currentLength = p.cashFlows.length
          if (years > currentLength) {
            return {
              ...p,
              cashFlows: [
                ...p.cashFlows,
                ...new Array(years - currentLength).fill(p.cashFlows[currentLength - 1] || 0),
              ],
            }
          } else if (years < currentLength) {
            return {
              ...p,
              cashFlows: p.cashFlows.slice(0, years),
            }
          }
        }
        return p
      })
    )
  }

  // モンテカルロシミュレーションの実行
  const runMonteCarloSimulation = () => {
    if (!activeProject) {
      return
    }

    const params = {
      ...activeProject,
      ...simulationParams,
    }

    const results = financialCalc.monteCarloSimulation(params, simulationParams.iterations)
    setSimulationResults(results)
  }

  // データのエクスポート
  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      projects: projectMetrics,
      sensitivityAnalysis: sensitivityAnalysis,
      simulationResults: simulationResults,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-metrics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // キャッシュフローチャートデータの準備
  const cashFlowChartData = useMemo(() => {
    if (!activeProject) {
      return []
    }
    return activeProject.cashFlows.map((cf, index) => ({
      year: `年${index + 1}`,
      キャッシュフロー: cf,
      累積キャッシュフロー: activeProject.cashFlows
        .slice(0, index + 1)
        .reduce((sum, val) => sum + val, -activeProject.initialInvestment),
    }))
  }, [activeProject])

  // 比較チャートデータの準備
  const comparisonChartData = useMemo(() => {
    return projectMetrics
      .filter((p) => p.active)
      .map((project) => ({
        name: project.name,
        NPV: project.metrics.npv,
        IRR: project.metrics.irr,
        ROI: project.metrics.roi,
        回収期間: project.metrics.payback,
      }))
  }, [projectMetrics])

  // メトリクスレーダーチャートデータの準備
  const radarChartData = useMemo(() => {
    if (!activeProject) {
      return []
    }
    const metrics = calculateMetrics(activeProject)
    return [
      { metric: 'NPV', value: Math.min(100, (metrics.npv / 10000000) * 100) },
      { metric: 'IRR', value: Math.min(100, metrics.irr * 5) },
      { metric: 'ROI', value: Math.min(100, metrics.roi) },
      { metric: '回収期間', value: metrics.payback ? 100 - metrics.payback * 20 : 0 },
      { metric: 'BCR', value: Math.min(100, metrics.bcr * 50) },
      { metric: 'PI', value: Math.min(100, metrics.pi * 50) },
    ]
  }, [activeProject, calculateMetrics])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className='space-y-6'>
      {/* ヘッダー */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-6 w-6 text-blue-600' />
                財務メトリクス計算ツール
              </CardTitle>
              <CardDescription>
                PV、NPV、IRR、ROIなどの財務指標を計算し、プロジェクトの価値を評価
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <Settings className='mr-1 h-4 w-4' />
                詳細設定
              </Button>
              <Button variant='outline' size='sm' onClick={exportData}>
                <Download className='mr-1 h-4 w-4' />
                エクスポート
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* 左側：プロジェクト設定 */}
        <div className='space-y-4 lg:col-span-1'>
          {/* プロジェクトリスト */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm'>プロジェクト</CardTitle>
                <Button size='sm' variant='outline' onClick={addProject}>
                  <Plus className='mr-1 h-3 w-3' />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex cursor-pointer items-center justify-between rounded p-2 transition-colors ${
                    activeProjectId === project.id
                      ? 'border border-blue-200 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={project.active}
                      onCheckedChange={(checked) => updateProject(project.id, 'active', checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className='h-7 w-32'
                    />
                  </div>
                  {projects.length > 1 && (
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              ))}
              <div className='mt-2 border-t pt-2'>
                <label className='flex items-center gap-2'>
                  <Switch checked={showComparison} onCheckedChange={setShowComparison} />
                  <span className='text-sm text-gray-600'>プロジェクト比較</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* パラメータ入力 */}
          {activeProject && (
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>{activeProject.name}の設定</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='initialInvestment'>初期投資額（円）</Label>
                  <Input
                    id='initialInvestment'
                    type='number'
                    value={activeProject.initialInvestment}
                    onChange={(e) =>
                      updateProject(
                        activeProject.id,
                        'initialInvestment',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='discountRate'>割引率（%）</Label>
                  <Input
                    id='discountRate'
                    type='number'
                    value={activeProject.discountRate}
                    onChange={(e) =>
                      updateProject(
                        activeProject.id,
                        'discountRate',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className='mt-1'
                  />
                </div>

                <div>
                  <div className='mb-2 flex items-center justify-between'>
                    <Label>キャッシュフロー（年次）</Label>
                    <Select
                      value={activeProject.cashFlows.length.toString()}
                      onValueChange={(value) =>
                        changeCashFlowYears(activeProject.id, parseInt(value))
                      }
                    >
                      <SelectTrigger className='h-7 w-20'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeProject.cashFlows.map((cf, index) => (
                    <div key={index} className='mt-2 flex items-center gap-2'>
                      <Label className='w-12 text-xs'>年{index + 1}</Label>
                      <Input
                        type='number'
                        value={cf}
                        onChange={(e) => updateCashFlow(activeProject.id, index, e.target.value)}
                        className='h-8'
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右側：計算結果と視覚化 */}
        <div className='space-y-4 lg:col-span-2'>
          <Tabs defaultValue='metrics' className='space-y-4'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='metrics'>指標</TabsTrigger>
              <TabsTrigger value='visualization'>視覚化</TabsTrigger>
              <TabsTrigger value='sensitivity'>感度分析</TabsTrigger>
              <TabsTrigger value='simulation'>シミュレーション</TabsTrigger>
            </TabsList>

            {/* 財務指標タブ */}
            <TabsContent value='metrics' className='space-y-4'>
              {activeProject && (
                <>
                  <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
                    {Object.entries(calculateMetrics(activeProject) || {}).map(([key, value]) => {
                      const evaluation = financialCalc.evaluateMetric(key, value)
                      let label = ''
                      let format = 'currency'

                      switch (key) {
                        case 'npv':
                          label = '正味現在価値（NPV）'
                          break
                        case 'irr':
                          label = '内部収益率（IRR）'
                          format = 'percent'
                          break
                        case 'roi':
                          label = '投資収益率（ROI）'
                          format = 'percent'
                          break
                        case 'payback':
                          label = '回収期間'
                          format = 'years'
                          break
                        case 'discountedPayback':
                          label = '割引回収期間'
                          format = 'years'
                          break
                        case 'bcr':
                          label = '費用便益比率（BCR）'
                          format = 'ratio'
                          break
                        case 'pi':
                          label = '収益性指数（PI）'
                          format = 'ratio'
                          break
                        default:
                          label = key
                      }

                      return (
                        <Card key={key} className='p-3'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <p className='text-xs text-gray-600'>{label}</p>
                              <p className='mt-1 text-lg font-semibold'>
                                {financialCalc.formatFinancialValue(value, format)}
                              </p>
                            </div>
                            {evaluation.label && (
                              <Badge
                                variant={
                                  evaluation.level === 'excellent'
                                    ? 'default'
                                    : evaluation.level === 'good'
                                      ? 'secondary'
                                      : evaluation.level === 'fair'
                                        ? 'outline'
                                        : 'destructive'
                                }
                              >
                                {evaluation.label}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {showComparison && comparisonChartData.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-sm'>プロジェクト比較</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='h-64'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='name' />
                              <YAxis />
                              <Tooltip
                                formatter={(value) =>
                                  financialCalc.formatFinancialValue(value, 'currency')
                                }
                              />
                              <Legend />
                              <Bar dataKey='NPV' fill='#10b981' />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* 視覚化タブ */}
            <TabsContent value='visualization' className='space-y-4'>
              {activeProject && (
                <>
                  {/* キャッシュフローチャート */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <TrendingUp className='h-4 w-4' />
                        キャッシュフロー推移
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='h-64'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <AreaChart data={cashFlowChartData}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='year' />
                            <YAxis />
                            <Tooltip
                              formatter={(value) =>
                                financialCalc.formatFinancialValue(value, 'currency')
                              }
                            />
                            <Legend />
                            <Area
                              type='monotone'
                              dataKey='キャッシュフロー'
                              stackId='1'
                              stroke='#3b82f6'
                              fill='#3b82f6'
                              fillOpacity={0.6}
                            />
                            <Line
                              type='monotone'
                              dataKey='累積キャッシュフロー'
                              stroke='#ef4444'
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* メトリクスレーダーチャート */}
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-sm'>
                        <BarChart3 className='h-4 w-4' />
                        総合評価レーダー
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='h-64'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <RadarChart data={radarChartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey='metric' />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar
                              name='評価'
                              dataKey='value'
                              stroke='#3b82f6'
                              fill='#3b82f6'
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* 感度分析タブ */}
            <TabsContent value='sensitivity' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>感度分析設定</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>分析パラメータ</Label>
                      <Select value={sensitivityParameter} onValueChange={setSensitivityParameter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='initialInvestment'>初期投資額</SelectItem>
                          <SelectItem value='cashFlows'>キャッシュフロー</SelectItem>
                          <SelectItem value='discountRate'>割引率</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>変動範囲</Label>
                      <Select
                        defaultValue='standard'
                        onValueChange={(value) => {
                          if (value === 'narrow') {
                            setSensitivityRange([-15, -10, -5, 0, 5, 10, 15])
                          } else if (value === 'wide') {
                            setSensitivityRange([-50, -30, -20, -10, 0, 10, 20, 30, 50])
                          } else {
                            setSensitivityRange([-30, -20, -10, 0, 10, 20, 30])
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='narrow'>狭い（±15%）</SelectItem>
                          <SelectItem value='standard'>標準（±30%）</SelectItem>
                          <SelectItem value='wide'>広い（±50%）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={sensitivityAnalysis}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='variation' tickFormatter={(value) => `${value}%`} />
                        <YAxis />
                        <Tooltip
                          formatter={(value) =>
                            financialCalc.formatFinancialValue(value, 'currency')
                          }
                          labelFormatter={(label) => `変動率: ${label}%`}
                        />
                        <Legend />
                        <Line
                          type='monotone'
                          dataKey='npv'
                          stroke='#3b82f6'
                          name='NPV'
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Alert>
                    <Info className='h-4 w-4' />
                    <AlertDescription>
                      感度分析により、パラメータの変動がNPVに与える影響を確認できます。
                      傾きが急なほど、そのパラメータに対する感度が高いことを示します。
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* モンテカルロシミュレーションタブ */}
            <TabsContent value='simulation' className='space-y-4'>
              {showAdvancedOptions && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm'>モンテカルロシミュレーション</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>投資額の変動性</Label>
                        <Slider
                          value={[simulationParams.investmentVolatility * 100]}
                          onValueChange={(value) =>
                            setSimulationParams((prev) => ({
                              ...prev,
                              investmentVolatility: value[0] / 100,
                            }))
                          }
                          max={50}
                          step={5}
                          className='mt-2'
                        />
                        <span className='text-xs text-gray-600'>
                          {(simulationParams.investmentVolatility * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div>
                        <Label>キャッシュフローの変動性</Label>
                        <Slider
                          value={[simulationParams.cashFlowVolatility * 100]}
                          onValueChange={(value) =>
                            setSimulationParams((prev) => ({
                              ...prev,
                              cashFlowVolatility: value[0] / 100,
                            }))
                          }
                          max={50}
                          step={5}
                          className='mt-2'
                        />
                        <span className='text-xs text-gray-600'>
                          {(simulationParams.cashFlowVolatility * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>割引率の変動性</Label>
                        <Slider
                          value={[simulationParams.rateVolatility * 100]}
                          onValueChange={(value) =>
                            setSimulationParams((prev) => ({
                              ...prev,
                              rateVolatility: value[0] / 100,
                            }))
                          }
                          max={30}
                          step={5}
                          className='mt-2'
                        />
                        <span className='text-xs text-gray-600'>
                          {(simulationParams.rateVolatility * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div>
                        <Label>シミュレーション回数</Label>
                        <Select
                          value={simulationParams.iterations.toString()}
                          onValueChange={(value) =>
                            setSimulationParams((prev) => ({
                              ...prev,
                              iterations: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='100'>100回</SelectItem>
                            <SelectItem value='500'>500回</SelectItem>
                            <SelectItem value='1000'>1,000回</SelectItem>
                            <SelectItem value='5000'>5,000回</SelectItem>
                            <SelectItem value='10000'>10,000回</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={runMonteCarloSimulation} className='w-full'>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      シミュレーション実行
                    </Button>

                    {simulationResults && (
                      <div className='space-y-3'>
                        <Alert>
                          <AlertTriangle className='h-4 w-4' />
                          <AlertDescription>
                            <div className='space-y-2'>
                              <p>
                                <strong>NPVが正になる確率:</strong>{' '}
                                {simulationResults.probabilityPositive.toFixed(1)}%
                              </p>
                              <p>
                                <strong>期待NPV:</strong>{' '}
                                {financialCalc.formatFinancialValue(
                                  simulationResults.mean,
                                  'currency'
                                )}
                              </p>
                              <p>
                                <strong>中央値:</strong>{' '}
                                {financialCalc.formatFinancialValue(
                                  simulationResults.median,
                                  'currency'
                                )}
                              </p>
                              <p>
                                <strong>95%信頼区間:</strong>{' '}
                                {financialCalc.formatFinancialValue(
                                  simulationResults.percentile5,
                                  'currency'
                                )}{' '}
                                ～{' '}
                                {financialCalc.formatFinancialValue(
                                  simulationResults.percentile95,
                                  'currency'
                                )}
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>

                        <div className='grid grid-cols-2 gap-3'>
                          <Card className='p-3'>
                            <div className='text-xs text-gray-600'>標準偏差</div>
                            <div className='mt-1 text-lg font-semibold'>
                              {financialCalc.formatFinancialValue(
                                simulationResults.standardDeviation,
                                'currency'
                              )}
                            </div>
                          </Card>
                          <Card className='p-3'>
                            <div className='text-xs text-gray-600'>リスク調整後NPV</div>
                            <div className='mt-1 text-lg font-semibold'>
                              {financialCalc.formatFinancialValue(
                                simulationResults.mean - simulationResults.standardDeviation,
                                'currency'
                              )}
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default React.memo(FinancialMetricsCalculator)
