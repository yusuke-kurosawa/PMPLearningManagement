import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Slider } from '../../ui/slider'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Alert, AlertDescription } from '../../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Textarea } from '../../ui/textarea'
import {
  TrendingUp,
  AlertTriangle,
  User,
  Users,
  Crown,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  FileText,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Activity,
  Target,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react'
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
} from 'recharts'

const EscalationManagement = () => {
  const [activeTab, setActiveTab] = useState('levels')
  const [escalationLevels, setEscalationLevels] = useState([
    {
      id: 1,
      name: 'プロジェクトマネージャー',
      role: 'PM',
      authority: 'operational',
      responseTime: 4,
      escalationCriteria: [
        { type: 'budget', threshold: 5, unit: '%' },
        { type: 'schedule', threshold: 3, unit: '日' },
        { type: 'quality', threshold: 'medium', unit: 'impact' },
        { type: 'risk', threshold: 'medium', unit: 'level' },
      ],
    },
    {
      id: 2,
      name: 'プログラムマネージャー',
      role: 'Program Manager',
      authority: 'tactical',
      responseTime: 8,
      escalationCriteria: [
        { type: 'budget', threshold: 15, unit: '%' },
        { type: 'schedule', threshold: 10, unit: '日' },
        { type: 'quality', threshold: 'high', unit: 'impact' },
        { type: 'risk', threshold: 'high', unit: 'level' },
      ],
    },
    {
      id: 3,
      name: 'エグゼクティブスポンサー',
      role: 'Executive Sponsor',
      authority: 'strategic',
      responseTime: 24,
      escalationCriteria: [
        { type: 'budget', threshold: 25, unit: '%' },
        { type: 'schedule', threshold: 30, unit: '日' },
        { type: 'quality', threshold: 'critical', unit: 'impact' },
        { type: 'risk', threshold: 'critical', unit: 'level' },
      ],
    },
    {
      id: 4,
      name: 'ステアリングコミッティ',
      role: 'Steering Committee',
      authority: 'governance',
      responseTime: 72,
      escalationCriteria: [
        { type: 'budget', threshold: 50, unit: '%' },
        { type: 'schedule', threshold: 60, unit: '日' },
        { type: 'quality', threshold: 'critical', unit: 'impact' },
        { type: 'risk', threshold: 'critical', unit: 'level' },
      ],
    },
  ])

  const [thresholds, setThresholds] = useState({
    budget: [5, 15, 25, 50],
    schedule: [3, 10, 30, 60],
    quality: ['low', 'medium', 'high', 'critical'],
    risk: ['low', 'medium', 'high', 'critical'],
  })

  const [simulationData, setSimulationData] = useState([])
  const [activeScenario, setActiveScenario] = useState(null)
  const [simulationRunning, setSimulationRunning] = useState(false)

  // エスカレーション履歴データ
  const escalationHistory = useMemo(() => [
    { month: '1月', level1: 12, level2: 4, level3: 2, level4: 0 },
    { month: '2月', level1: 15, level2: 6, level3: 3, level4: 1 },
    { month: '3月', level1: 18, level2: 8, level3: 4, level4: 1 },
    { month: '4月', level1: 10, level2: 3, level3: 1, level4: 0 },
    { month: '5月', level1: 14, level2: 5, level3: 2, level4: 0 },
    { month: '6月', level1: 16, level2: 7, level3: 3, level4: 2 },
  ], [])

  // エスカレーション分布データ
  const escalationDistribution = useMemo(() => [
    { name: 'レベル1 (PM)', value: 85, color: '#22c55e' },
    { name: 'レベル2 (Program)', value: 33, color: '#f59e0b' },
    { name: 'レベル3 (Executive)', value: 15, color: '#ef4444' },
    { name: 'レベル4 (Committee)', value: 4, color: '#8b5cf6' },
  ], [])

  // シミュレーションシナリオ
  const scenarios = [
    {
      id: 1,
      name: '予算超過シナリオ',
      description: 'プロジェクト予算が段階的に超過する場合',
      type: 'budget',
      progression: [
        { time: 0, value: 0, level: 0 },
        { time: 1, value: 6, level: 1 },
        { time: 2, value: 18, level: 2 },
        { time: 3, value: 30, level: 3 },
        { time: 4, value: 55, level: 4 },
      ],
    },
    {
      id: 2,
      name: 'スケジュール遅延シナリオ',
      description: '重要なマイルストーンでの遅延',
      type: 'schedule',
      progression: [
        { time: 0, value: 0, level: 0 },
        { time: 1, value: 5, level: 1 },
        { time: 2, value: 15, level: 2 },
        { time: 3, value: 35, level: 3 },
        { time: 4, value: 70, level: 4 },
      ],
    },
    {
      id: 3,
      name: '品質問題シナリオ',
      description: '品質基準を満たさない問題の発見',
      type: 'quality',
      progression: [
        { time: 0, value: 'none', level: 0 },
        { time: 1, value: 'low', level: 1 },
        { time: 2, value: 'medium', level: 2 },
        { time: 3, value: 'high', level: 3 },
        { time: 4, value: 'critical', level: 4 },
      ],
    },
  ]

  const runSimulation = (scenario) => {
    setActiveScenario(scenario)
    setSimulationRunning(true)
    setSimulationData([])

    scenario.progression.forEach((step, index) => {
      setTimeout(() => {
        setSimulationData((prev) => [...prev, {
          ...step,
          timestamp: new Date().toLocaleTimeString(),
          levelName: escalationLevels[step.level]?.name || 'なし',
          responseTime: escalationLevels[step.level]?.responseTime || 0,
        }])

        if (index === scenario.progression.length - 1) {
          setSimulationRunning(false)
        }
      }, index * 2000)
    })
  }

  const stopSimulation = () => {
    setSimulationRunning(false)
    setSimulationData([])
    setActiveScenario(null)
  }

  const updateThreshold = (type, level, value) => {
    setThresholds(prev => ({
      ...prev,
      [type]: prev[type].map((threshold, index) => 
        index === level ? value : threshold
      )
    }))
  }

  const exportEscalationMatrix = () => {
    const matrix = {
      escalationLevels,
      thresholds,
      createdAt: new Date().toISOString(),
      configuration: {
        totalLevels: escalationLevels.length,
        averageResponseTime: escalationLevels.reduce((acc, level) => acc + level.responseTime, 0) / escalationLevels.length,
      },
    }

    const blob = new Blob([JSON.stringify(matrix, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `escalation-matrix-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getAuthorityIcon = (authority) => {
    switch (authority) {
      case 'operational': return <User className="h-4 w-4" />
      case 'tactical': return <Users className="h-4 w-4" />
      case 'strategic': return <Crown className="h-4 w-4" />
      case 'governance': return <Shield className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getAuthorityColor = (authority) => {
    switch (authority) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'tactical': return 'text-blue-600 bg-blue-100'
      case 'strategic': return 'text-purple-600 bg-purple-100'
      case 'governance': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (value, type) => {
    if (type === 'budget' || type === 'schedule') {
      if (value < thresholds[type][0]) return 'text-green-600'
      if (value < thresholds[type][1]) return 'text-yellow-600'
      if (value < thresholds[type][2]) return 'text-orange-600'
      return 'text-red-600'
    }
    
    if (type === 'quality' || type === 'risk') {
      const index = thresholds[type].indexOf(value)
      switch (index) {
        case 0: return 'text-green-600'
        case 1: return 'text-yellow-600'
        case 2: return 'text-orange-600'
        case 3: return 'text-red-600'
        default: return 'text-gray-600'
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            エスカレーション管理システム
          </CardTitle>
          <CardDescription>
            プロジェクト問題の段階的エスカレーション戦略の設計と管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="levels">エスカレーションレベル</TabsTrigger>
              <TabsTrigger value="matrix">エスカレーションマトリックス</TabsTrigger>
              <TabsTrigger value="simulation">シミュレーション</TabsTrigger>
              <TabsTrigger value="analytics">分析・履歴</TabsTrigger>
            </TabsList>

            {/* エスカレーションレベル設定 */}
            <TabsContent value="levels" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    エスカレーションレベル定義
                  </CardTitle>
                  <CardDescription>
                    階層的なエスカレーション構造と権限レベルを定義
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {escalationLevels.map((level) => (
                    <Card key={level.id} className="border-2 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{level.id}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{level.name}</h3>
                              <p className="text-sm text-gray-600">{level.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAuthorityColor(level.authority)}>
                              {getAuthorityIcon(level.authority)}
                              <span className="ml-1 capitalize">{level.authority}</span>
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {level.responseTime}h
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {level.escalationCriteria.map((criteria, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                {criteria.type === 'budget' && <DollarSign className="h-4 w-4 text-green-600" />}
                                {criteria.type === 'schedule' && <Clock className="h-4 w-4 text-blue-600" />}
                                {criteria.type === 'quality' && <Target className="h-4 w-4 text-purple-600" />}
                                {criteria.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                <span className="text-sm font-medium capitalize">{criteria.type}</span>
                              </div>
                              <p className={`text-lg font-bold ${getSeverityColor(criteria.threshold, criteria.type)}`}>
                                {criteria.threshold}{criteria.unit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* エスカレーションマトリックス */}
            <TabsContent value="matrix" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    エスカレーションマトリックス設定
                  </CardTitle>
                  <CardDescription>
                    各レベルのしきい値とトリガー条件を調整
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(thresholds).map(([type, values]) => (
                    <Card key={type} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {type === 'budget' && <DollarSign className="h-5 w-5 text-green-600" />}
                          {type === 'schedule' && <Clock className="h-5 w-5 text-blue-600" />}
                          {type === 'quality' && <Target className="h-5 w-5 text-purple-600" />}
                          {type === 'risk' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <span className="capitalize">{type} しきい値</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          {values.map((value, index) => (
                            <div key={index} className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                レベル {index + 1}
                              </label>
                              {type === 'budget' || type === 'schedule' ? (
                                <Input
                                  type="number"
                                  value={value}
                                  onChange={(e) => updateThreshold(type, index, parseInt(e.target.value))}
                                  className="w-full"
                                />
                              ) : (
                                <Select
                                  value={value}
                                  onValueChange={(newValue) => updateThreshold(type, index, newValue)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-between items-center">
                    <Alert className="flex-1 mr-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        しきい値は下位レベルから上位レベルへ段階的に厳しくなるよう設定してください。
                      </AlertDescription>
                    </Alert>
                    <Button onClick={exportEscalationMatrix} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* シミュレーション */}
            <TabsContent value="simulation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    エスカレーションシミュレーション
                  </CardTitle>
                  <CardDescription>
                    様々なシナリオでエスカレーション過程を実演
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {scenarios.map((scenario) => (
                      <Card key={scenario.id} className="border-2 border-gray-200">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                          <Button 
                            onClick={() => runSimulation(scenario)}
                            disabled={simulationRunning}
                            className="w-full"
                            variant={activeScenario?.id === scenario.id ? "default" : "outline"}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            実行
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {simulationRunning && (
                    <Card className="border-2 border-orange-300 bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-orange-800">
                            シミュレーション実行中: {activeScenario?.name}
                          </h3>
                          <Button onClick={stopSimulation} variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-2" />
                            停止
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {simulationData.map((step, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{step.timestamp}</Badge>
                                <span className="text-sm">
                                  {activeScenario.type}: {step.value}
                                  {activeScenario.type === 'budget' || activeScenario.type === 'schedule' ? '%' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">→ {step.levelName}</span>
                                <Badge>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {step.responseTime}h
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 分析・履歴 */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    エスカレーション分析
                  </CardTitle>
                  <CardDescription>
                    エスカレーション履歴の分析とトレンド
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">月次エスカレーション履歴</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={escalationHistory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="level1" stroke="#22c55e" name="レベル1" />
                          <Line type="monotone" dataKey="level2" stroke="#f59e0b" name="レベル2" />
                          <Line type="monotone" dataKey="level3" stroke="#ef4444" name="レベル3" />
                          <Line type="monotone" dataKey="level4" stroke="#8b5cf6" name="レベル4" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">エスカレーション分布</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={escalationDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {escalationDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">解決率</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">87%</div>
                        <div className="text-xs text-green-600">レベル1で解決</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">平均解決時間</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">6.2h</div>
                        <div className="text-xs text-blue-600">前月比 -12%</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">エスカレーション率</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">31%</div>
                        <div className="text-xs text-purple-600">レベル2以上</div>
                      </CardContent>
                    </Card>

                    <Card className="border border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-medium text-red-800">重大問題</span>
                        </div>
                        <div className="text-2xl font-bold text-red-700">4</div>
                        <div className="text-xs text-red-600">レベル4到達</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>推奨アクション:</strong> レベル1での解決率が高く、良好なエスカレーション管理が行われています。
                      しかし、レベル4への到達が4件あるため、早期発見と予防策の強化を検討してください。
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default EscalationManagement