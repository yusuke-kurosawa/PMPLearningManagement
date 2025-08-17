import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

// ==================== Type Definitions ====================

interface LighthouseScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
}

interface CoreWebVitals {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
}

interface BundleSize {
  total: number
  js: number
  css: number
  images: number
}

interface NetworkInfo {
  effectiveType: string
  downlink: number
  rtt: number
}

interface ServiceWorkerInfo {
  status: string
  cacheHitRatio: number
  offlineRequests: number
}

interface Metrics {
  lighthouse: LighthouseScores
  coreWebVitals: CoreWebVitals
  bundleSize: BundleSize
  networkInfo: NetworkInfo
  serviceWorker: ServiceWorkerInfo
  timestamp?: string
}

interface RealTimeDataPoint {
  timestamp: number
  performance: number
  lcp: number
  cls: number
}

interface Optimization {
  id: string
  title: string
  description: string
  impact: 'Low' | 'Medium' | 'High'
  savings: string
  status: 'recommended' | 'in-progress' | 'completed'
}

interface Alert {
  id: number
  type: 'warning' | 'error'
  message: string
  timestamp: string
}

// Extended Navigator interface for connection API
interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

// Extended Window interface for global variables
interface ExtendedWindow extends Window {
  coreWebVitalsData?: CoreWebVitals
  serviceWorkerManager?: {
    getAnalytics: () => {
      registrationStatus: string
      offlineCount: number
    }
  }
}

/**
 * PWA Optimization Dashboard
 * Real-time monitoring and reporting for PWA performance
 */
const PWAOptimizationDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, pwa: 0 },
    coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
    bundleSize: { total: 0, js: 0, css: 0, images: 0 },
    networkInfo: { effectiveType: 'unknown', downlink: 0, rtt: 0 },
    serviceWorker: { status: 'unknown', cacheHitRatio: 0, offlineRequests: 0 },
  })

  const [realTimeData, setRealTimeData] = useState<RealTimeDataPoint[]>([])
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false)
  const [optimizations, setOptimizations] = useState<Optimization[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    initializeDashboard()
    startRealTimeMonitoring()

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [])

  const initializeDashboard = async (): Promise<void> => {
    try {
      // Initialize Core Web Vitals monitoring
      if (typeof window !== 'undefined') {
        await import('../lib/pwa/coreWebVitals.js')
      }

      // Get initial metrics
      await updateMetrics()

      // Load historical data
      await loadHistoricalData()

      // Check for optimization opportunities
      await analyzeOptimizations()
    } catch (error) {
      console.error('Dashboard initialization failed:', error)
    }
  }

  const startRealTimeMonitoring = (): void => {
    setIsMonitoring(true)

    // Update metrics every 30 seconds
    metricsIntervalRef.current = setInterval(async () => {
      await updateMetrics()
    }, 30000)
  }

  const updateMetrics = async (): Promise<void> => {
    try {
      // Lighthouse scores simulation (in real app, this would come from API)
      const lighthouseScores = await simulateLighthouseScores()

      // Core Web Vitals from browser APIs
      const webVitals = await getCoreWebVitals()

      // Bundle size information
      const bundleInfo = await getBundleInformation()

      // Network information
      const networkInfo = getNetworkInformation()

      // Service Worker status
      const swStatus = await getServiceWorkerStatus()

      const newMetrics: Metrics = {
        lighthouse: lighthouseScores,
        coreWebVitals: webVitals,
        bundleSize: bundleInfo,
        networkInfo,
        serviceWorker: swStatus,
        timestamp: new Date().toISOString(),
      }

      setMetrics(newMetrics)

      // Add to real-time data (keep last 50 data points)
      setRealTimeData((prev) => [
        ...prev.slice(-49),
        {
          timestamp: Date.now(),
          performance: lighthouseScores.performance,
          lcp: webVitals.lcp,
          cls: webVitals.cls,
        },
      ])

      // Check for performance alerts
      checkPerformanceAlerts(newMetrics)
    } catch (error) {
      console.error('Failed to update metrics:', error)
    }
  }

  const simulateLighthouseScores = async (): Promise<LighthouseScores> => {
    // In a real implementation, this would fetch from Lighthouse CI API
    return {
      performance: 88 + Math.random() * 10,
      accessibility: 94 + Math.random() * 5,
      bestPractices: 91 + Math.random() * 8,
      seo: 89 + Math.random() * 10,
      pwa: 87 + Math.random() * 12,
    }
  }

  const getCoreWebVitals = async (): Promise<CoreWebVitals> => {
    // Get metrics from web-vitals library
    const extendedWindow = window as ExtendedWindow

    if (typeof window !== 'undefined' && extendedWindow.coreWebVitalsData) {
      return extendedWindow.coreWebVitalsData
    }

    // Simulate for demo
    return {
      lcp: 2000 + Math.random() * 1000,
      fid: 50 + Math.random() * 100,
      cls: 0.05 + Math.random() * 0.1,
    }
  }

  const getBundleInformation = async (): Promise<BundleSize> => {
    // In real implementation, this would analyze actual bundle sizes
    return {
      total: 1.8 + Math.random() * 0.4, // MB
      js: 1.2 + Math.random() * 0.3,
      css: 0.2 + Math.random() * 0.1,
      images: 0.4 + Math.random() * 0.2,
    }
  }

  const getNetworkInformation = (): NetworkInfo => {
    const extendedNavigator = navigator as ExtendedNavigator

    if (typeof navigator !== 'undefined' && extendedNavigator.connection) {
      return {
        effectiveType: extendedNavigator.connection.effectiveType || 'unknown',
        downlink: extendedNavigator.connection.downlink || 0,
        rtt: extendedNavigator.connection.rtt || 0,
      }
    }

    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
    }
  }

  const getServiceWorkerStatus = async (): Promise<ServiceWorkerInfo> => {
    const extendedWindow = window as ExtendedWindow

    if (typeof window !== 'undefined' && extendedWindow.serviceWorkerManager) {
      const analytics = extendedWindow.serviceWorkerManager.getAnalytics()
      return {
        status: analytics.registrationStatus,
        cacheHitRatio: 85 + Math.random() * 10,
        offlineRequests: analytics.offlineCount || 0,
      }
    }

    return {
      status: 'registered',
      cacheHitRatio: 85,
      offlineRequests: 0,
    }
  }

  const loadHistoricalData = async (): Promise<void> => {
    // Load historical performance data
    try {
      const stored = localStorage.getItem('pwa-performance-history')
      if (stored) {
        const history: RealTimeDataPoint[] = JSON.parse(stored)
        setRealTimeData(history.slice(-50))
      }
    } catch (error) {
      console.warn('Failed to load historical data:', error)
    }
  }

  const analyzeOptimizations = async (): Promise<void> => {
    const optimizationOpportunities: Optimization[] = [
      {
        id: 'image-optimization',
        title: 'Image Optimization',
        description: 'Convert images to WebP/AVIF format',
        impact: 'High',
        savings: '~300KB',
        status: 'recommended',
      },
      {
        id: 'code-splitting',
        title: 'Code Splitting',
        description: 'Implement route-based code splitting',
        impact: 'Medium',
        savings: '~200KB initial bundle',
        status: 'in-progress',
      },
      {
        id: 'tree-shaking',
        title: 'Tree Shaking',
        description: 'Remove unused JavaScript code',
        impact: 'Medium',
        savings: '~150KB',
        status: 'completed',
      },
      {
        id: 'font-optimization',
        title: 'Font Optimization',
        description: 'Optimize web font loading',
        impact: 'Low',
        savings: '~50KB',
        status: 'recommended',
      },
    ]

    setOptimizations(optimizationOpportunities)
  }

  const checkPerformanceAlerts = (newMetrics: Metrics): void => {
    const newAlerts: Alert[] = []

    // Performance score alert
    if (newMetrics.lighthouse.performance < 85) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        message: `Performance score dropped to ${Math.round(newMetrics.lighthouse.performance)}`,
        timestamp: new Date().toISOString(),
      })
    }

    // LCP alert
    if (newMetrics.coreWebVitals.lcp > 2500) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'error',
        message: `LCP is ${Math.round(newMetrics.coreWebVitals.lcp)}ms (exceeds 2.5s threshold)`,
        timestamp: new Date().toISOString(),
      })
    }

    // CLS alert
    if (newMetrics.coreWebVitals.cls > 0.1) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'warning',
        message: `CLS is ${newMetrics.coreWebVitals.cls.toFixed(3)} (exceeds 0.1 threshold)`,
        timestamp: new Date().toISOString(),
      })
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev.slice(0, 10)]) // Keep last 10 alerts
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) {
      return 'text-green-600'
    }
    if (score >= 70) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getScoreBackground = (score: number): string => {
    if (score >= 90) {
      return 'bg-green-100'
    }
    if (score >= 70) {
      return 'bg-yellow-100'
    }
    return 'bg-red-100'
  }

  const getStatusBadgeVariant = (status: Optimization['status']): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'recommended':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatBytes = (mb: number): string => {
    return `${mb.toFixed(1)} MB`
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    }
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>PWA Performance Dashboard</h1>
              <p className='mt-1 text-gray-600'>Real-time monitoring and optimization insights</p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <div
                  className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}
                />
                <span className='text-sm text-gray-600'>
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </span>
              </div>
              <Button variant='outline' onClick={() => updateMetrics()}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Performance Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border-l-4 p-3 ${
                      alert.type === 'error'
                        ? 'border-red-400 bg-red-50'
                        : 'border-yellow-400 bg-yellow-50'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium'>{alert.message}</p>
                      <span className='text-xs text-gray-500'>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='lighthouse'>Lighthouse</TabsTrigger>
            <TabsTrigger value='vitals'>Core Web Vitals</TabsTrigger>
            <TabsTrigger value='bundle'>Bundle Analysis</TabsTrigger>
            <TabsTrigger value='optimizations'>Optimizations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Performance Score</p>
                      <p
                        className={`text-2xl font-bold ${getScoreColor(metrics.lighthouse.performance)}`}
                      >
                        {Math.round(metrics.lighthouse.performance)}
                      </p>
                    </div>
                    <div
                      className={`rounded-full p-3 ${getScoreBackground(metrics.lighthouse.performance)}`}
                    >
                      ⚡
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>LCP</p>
                      <p
                        className={`text-2xl font-bold ${metrics.coreWebVitals.lcp <= 2500 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formatTime(metrics.coreWebVitals.lcp)}
                      </p>
                    </div>
                    <div className='rounded-full bg-blue-100 p-3'>🎯</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Bundle Size</p>
                      <p
                        className={`text-2xl font-bold ${metrics.bundleSize.total <= 2 ? 'text-green-600' : 'text-yellow-600'}`}
                      >
                        {formatBytes(metrics.bundleSize.total)}
                      </p>
                    </div>
                    <div className='rounded-full bg-purple-100 p-3'>📦</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Cache Hit Rate</p>
                      <p className='text-2xl font-bold text-green-600'>
                        {Math.round(metrics.serviceWorker.cacheHitRatio)}%
                      </p>
                    </div>
                    <div className='rounded-full bg-green-100 p-3'>💾</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex h-64 items-center justify-center rounded-lg bg-gray-100'>
                  <p className='text-gray-500'>Performance chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lighthouse Tab */}
          <TabsContent value='lighthouse' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {(Object.entries(metrics.lighthouse) as [keyof LighthouseScores, number][]).map(([key, score]) => (
                <Card key={key}>
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-center justify-between'>
                      <h3 className='text-lg font-semibold capitalize'>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </h3>
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {Math.round(score)}
                      </span>
                    </div>
                    <Progress value={score} className='h-2' />
                    <p className='mt-2 text-sm text-gray-600'>
                      {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Core Web Vitals Tab */}
          <TabsContent value='vitals' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <Card>
                <CardHeader>
                  <CardTitle>Largest Contentful Paint (LCP)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <p
                      className={`mb-2 text-3xl font-bold ${metrics.coreWebVitals.lcp <= 2500 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatTime(metrics.coreWebVitals.lcp)}
                    </p>
                    <p className='text-sm text-gray-600'>Target: ≤ 2.5s</p>
                    <div className='mt-4'>
                      <Progress
                        value={Math.min((metrics.coreWebVitals.lcp / 2500) * 100, 100)}
                        className='h-2'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>First Input Delay (FID)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <p
                      className={`mb-2 text-3xl font-bold ${metrics.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatTime(metrics.coreWebVitals.fid)}
                    </p>
                    <p className='text-sm text-gray-600'>Target: ≤ 100ms</p>
                    <div className='mt-4'>
                      <Progress
                        value={Math.min((metrics.coreWebVitals.fid / 100) * 100, 100)}
                        className='h-2'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Layout Shift (CLS)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center'>
                    <p
                      className={`mb-2 text-3xl font-bold ${metrics.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metrics.coreWebVitals.cls.toFixed(3)}
                    </p>
                    <p className='text-sm text-gray-600'>Target: ≤ 0.1</p>
                    <div className='mt-4'>
                      <Progress
                        value={Math.min((metrics.coreWebVitals.cls / 0.1) * 100, 100)}
                        className='h-2'
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bundle Analysis Tab */}
          <TabsContent value='bundle' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Bundle Size Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {(Object.entries(metrics.bundleSize) as [keyof BundleSize, number][]).map(([type, size]) => (
                    <div key={type} className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <span className='font-medium capitalize'>{type}</span>
                        <Badge variant='outline'>{formatBytes(size)}</Badge>
                      </div>
                      <div className='w-32'>
                        <Progress
                          value={
                            type === 'total'
                              ? (size / 3) * 100
                              : (size / metrics.bundleSize.total) * 100
                          }
                          className='h-2'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <p className='text-sm text-gray-600'>Connection Type</p>
                    <p className='text-lg font-semibold uppercase'>
                      {metrics.networkInfo.effectiveType}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Downlink</p>
                    <p className='text-lg font-semibold'>{metrics.networkInfo.downlink} Mbps</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>RTT</p>
                    <p className='text-lg font-semibold'>{metrics.networkInfo.rtt}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimizations Tab */}
          <TabsContent value='optimizations' className='space-y-6'>
            <div className='space-y-4'>
              {optimizations.map((opt) => (
                <Card key={opt.id}>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center space-x-3'>
                          <h3 className='text-lg font-semibold'>{opt.title}</h3>
                          <Badge variant={getStatusBadgeVariant(opt.status)}>
                            {opt.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant='outline'>{opt.impact} Impact</Badge>
                        </div>
                        <p className='mb-2 text-gray-600'>{opt.description}</p>
                        <p className='text-sm font-medium text-green-600'>
                          Potential Savings: {opt.savings}
                        </p>
                      </div>
                      <Button variant='outline' size='sm'>
                        {opt.status === 'completed' ? 'Review' : 'Implement'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PWAOptimizationDashboard