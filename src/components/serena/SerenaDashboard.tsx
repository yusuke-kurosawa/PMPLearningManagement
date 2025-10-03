import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  Brain,
  Database,
  Activity,
  Zap,
  GitBranch,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  FileText,
  Clock,
  Cpu,
  HardDrive,
  Gauge,
  Search,
  Filter,
  Download,
} from 'lucide-react'

/**
 * Serena Real-time Monitoring Dashboard
 * リアルタイム監視とパフォーマンス分析
 */
const SerenaDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cacheHitRate: 0,
    memoryUpdates: 0,
    filesScanned: 0,
    parallelEfficiency: 0,
    healthScore: 0,
    lastUpdate: null as Date | null,
  })

  const [memoryStatus, setMemoryStatus] = useState([
    { name: 'project_overview', size: 0, version: 0, lastModified: '' },
    { name: 'performance_optimization', size: 0, version: 0, lastModified: '' },
    { name: 'testing_strategy', size: 0, version: 0, lastModified: '' },
    { name: 'security_guidelines', size: 0, version: 0, lastModified: '' },
  ])

  const [performanceHistory, setPerformanceHistory] = useState([
    { time: '00:00', cacheHit: 0, updates: 0, efficiency: 0 },
    { time: '00:05', cacheHit: 0, updates: 0, efficiency: 0 },
    { time: '00:10', cacheHit: 0, updates: 0, efficiency: 0 },
  ])

  const [cacheDistribution, setCacheDistribution] = useState([
    { name: 'Source Files', value: 40, color: '#8884d8' },
    { name: 'Dependencies', value: 30, color: '#82ca9d' },
    { name: 'Documentation', value: 20, color: '#ffc658' },
    { name: 'Tests', value: 10, color: '#ff8042' },
  ])

  const [qualityMetrics, setQualityMetrics] = useState([
    { metric: 'Coverage', score: 85, target: 90 },
    { metric: 'Complexity', score: 92, target: 85 },
    { metric: 'Performance', score: 88, target: 90 },
    { metric: 'Security', score: 95, target: 95 },
    { metric: 'Documentation', score: 78, target: 80 },
  ])

  const [activeTab, setActiveTab] = useState('overview')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  // Simulated data updates
  useEffect(() => {
    if (!isAutoRefresh) {
      return
    }

    const interval = setInterval(() => {
      updateMetrics()
      updatePerformanceHistory()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isAutoRefresh, refreshInterval])

  const updateMetrics = () => {
    setMetrics((prev) => ({
      cacheHitRate: Math.min(100, prev.cacheHitRate + Math.random() * 5),
      memoryUpdates: prev.memoryUpdates + Math.floor(Math.random() * 3),
      filesScanned: prev.filesScanned + Math.floor(Math.random() * 50),
      parallelEfficiency: 85 + Math.random() * 15,
      healthScore: 90 + Math.random() * 10,
      lastUpdate: new Date(),
    }))
  }

  const updatePerformanceHistory = () => {
    setPerformanceHistory((prev) => {
      const newData = [...prev]
      newData.shift()
      const now = new Date()
      newData.push({
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        cacheHit: 70 + Math.random() * 30,
        updates: Math.floor(Math.random() * 10),
        efficiency: 80 + Math.random() * 20,
      })
      return newData
    })
  }

  const handleManualRefresh = () => {
    updateMetrics()
    updatePerformanceHistory()
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) {
      return '0 B'
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) {
      return 'text-green-600'
    }
    if (score >= 70) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  return (
    <div className='w-full space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <Brain className='h-8 w-8 text-blue-600' />
          <div>
            <h1 className='text-2xl font-bold'>Serena MCP Server Dashboard</h1>
            <p className='text-sm text-gray-600'>Real-time Monitoring & Analytics</p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <Badge variant='outline' className='px-3 py-1'>
            <Activity className='mr-1 h-3 w-3' />
            {isAutoRefresh ? 'Live' : 'Paused'}
          </Badge>
          <Button variant='outline' size='sm' onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
            {isAutoRefresh ? 'Pause' : 'Resume'}
          </Button>
          <Button variant='outline' size='sm' onClick={handleManualRefresh}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600'>Cache Hit Rate</p>
                <p className='text-2xl font-bold'>{metrics.cacheHitRate.toFixed(1)}%</p>
              </div>
              <Gauge className='h-8 w-8 text-blue-500' />
            </div>
            <Progress value={metrics.cacheHitRate} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600'>Memory Updates</p>
                <p className='text-2xl font-bold'>{metrics.memoryUpdates}</p>
              </div>
              <Database className='h-8 w-8 text-green-500' />
            </div>
            <div className='mt-2 text-xs text-gray-500'>+12% from last hour</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600'>Files Scanned</p>
                <p className='text-2xl font-bold'>{metrics.filesScanned}</p>
              </div>
              <Search className='h-8 w-8 text-purple-500' />
            </div>
            <div className='mt-2 text-xs text-gray-500'>Avg: 150/min</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600'>Parallel Efficiency</p>
                <p className='text-2xl font-bold'>{metrics.parallelEfficiency.toFixed(0)}%</p>
              </div>
              <Zap className='h-8 w-8 text-yellow-500' />
            </div>
            <Progress value={metrics.parallelEfficiency} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-600'>Health Score</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.healthScore)}`}>
                  {metrics.healthScore.toFixed(0)}/100
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-500' />
            </div>
            <div className='mt-2 text-xs text-gray-500'>Optimal</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='memory'>Memory</TabsTrigger>
          <TabsTrigger value='quality'>Quality</TabsTrigger>
          <TabsTrigger value='predictions'>AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <AreaChart data={performanceHistory}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='cacheHit'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                    />
                    <Area
                      type='monotone'
                      dataKey='efficiency'
                      stroke='#82ca9d'
                      fill='#82ca9d'
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cache Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Cache Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={200}>
                  <PieChart>
                    <Pie
                      data={cacheDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {cacheDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='time' />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='cacheHit'
                    stroke='#8884d8'
                    strokeWidth={2}
                    name='Cache Hit Rate'
                  />
                  <Line
                    type='monotone'
                    dataKey='updates'
                    stroke='#82ca9d'
                    strokeWidth={2}
                    name='Memory Updates'
                  />
                  <Line
                    type='monotone'
                    dataKey='efficiency'
                    stroke='#ffc658'
                    strokeWidth={2}
                    name='Efficiency'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='memory' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Memory Files Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {memoryStatus.map((memory, index) => (
                  <div key={index} className='flex items-center justify-between rounded border p-3'>
                    <div className='flex items-center space-x-3'>
                      <FileText className='h-5 w-5 text-gray-500' />
                      <div>
                        <p className='font-medium'>{memory.name}.md</p>
                        <p className='text-xs text-gray-500'>
                          Version {memory.version} • {formatBytes(memory.size)}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='outline'>Active</Badge>
                      <Clock className='h-4 w-4 text-gray-400' />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='quality' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Code Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart data={qualityMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='metric' />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name='Current'
                    dataKey='score'
                    stroke='#8884d8'
                    fill='#8884d8'
                    fillOpacity={0.6}
                  />
                  <Radar
                    name='Target'
                    dataKey='target'
                    stroke='#82ca9d'
                    fill='#82ca9d'
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='predictions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>AI-Driven Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Based on current patterns, cache hit rate is predicted to reach 95% in the next
                  hour.
                </AlertDescription>
              </Alert>
              <div className='mt-4 space-y-3'>
                <div className='rounded border p-3'>
                  <p className='text-sm font-medium'>Predicted Memory Updates</p>
                  <p className='text-2xl font-bold text-blue-600'>127</p>
                  <p className='text-xs text-gray-500'>Next 30 minutes</p>
                </div>
                <div className='rounded border p-3'>
                  <p className='text-sm font-medium'>Optimal Cache Size</p>
                  <p className='text-2xl font-bold text-green-600'>85.3 MB</p>
                  <p className='text-xs text-gray-500'>Based on usage patterns</p>
                </div>
                <div className='rounded border p-3'>
                  <p className='text-sm font-medium'>Suggested Actions</p>
                  <ul className='mt-2 space-y-1 text-sm text-gray-600'>
                    <li>• Increase parallel workers to 6</li>
                    <li>• Enable aggressive caching for /src</li>
                    <li>• Schedule memory cleanup at 03:00</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Status */}
      <div className='flex items-center justify-between text-sm text-gray-500'>
        <div className='flex items-center space-x-4'>
          <span>Last Update: {metrics.lastUpdate?.toLocaleTimeString() || 'Never'}</span>
          <span>•</span>
          <span>Refresh Interval: {refreshInterval / 1000}s</span>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='ghost' size='sm'>
            <Settings className='mr-1 h-4 w-4' />
            Configure
          </Button>
          <Button variant='ghost' size='sm'>
            <Download className='mr-1 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SerenaDashboard
