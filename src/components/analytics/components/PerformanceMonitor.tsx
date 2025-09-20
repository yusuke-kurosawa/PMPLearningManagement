/**
 * Performance Monitor Component
 * Monitors dashboard performance metrics, memory usage, and optimization suggestions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Activity,
  Zap,
  MemoryStick,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Settings,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { useToast } from '../../../hooks/use-toast'
import type { PerformanceMetrics } from '../types/dashboard'

interface PerformanceMonitorProps {
  enabled?: boolean
  showNotifications?: boolean
  thresholds?: {
    renderTime: number
    memoryUsage: number
    errorRate: number
  }
  onOptimizationSuggestion?: (suggestion: string) => void
  className?: string
}

interface PerformanceEntry {
  timestamp: Date
  renderTime: number
  memoryUsage: number
  dataFetchTime: number
  chartRenderTime: number
  errorCount: number
}

const DEFAULT_THRESHOLDS = {
  renderTime: 1000, // ms
  memoryUsage: 75, // percentage
  errorRate: 5, // percentage
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showNotifications = true,
  thresholds = DEFAULT_THRESHOLDS,
  onOptimizationSuggestion,
  className = '',
}) => {
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceEntry[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    dataFetchTime: 0,
    chartRenderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    errorCount: 0,
    warningCount: 0,
  })

  // Performance observer for measuring render times
  const measurePerformance = useCallback(() => {
    if (!enabled || !window.performance) {
      return
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paintEntries = performance.getEntriesByType('paint')
    const resourceEntries = performance.getEntriesByType('resource')

    // Calculate render time (time to interactive)
    const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint')?.startTime || 0
    const firstContentfulPaint =
      paintEntries.find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0
    const renderTime = Math.max(firstPaint, firstContentfulPaint)

    // Calculate data fetch time (sum of API calls)
    const dataFetchTime = resourceEntries
      .filter((entry) => entry.name.includes('api') || entry.name.includes('data'))
      .reduce((sum, entry) => sum + entry.duration, 0)

    // Memory usage (if available)
    let memoryUsage = 0
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }

    const newMetrics: PerformanceMetrics = {
      renderTime,
      dataFetchTime,
      chartRenderTime: 0, // Will be updated by chart components
      memoryUsage,
      bundleSize: 0, // Would be set during build
      errorCount: 0, // Would be tracked by error boundary
      warningCount: 0,
    }

    setCurrentMetrics(newMetrics)

    // Add to history
    const historyEntry: PerformanceEntry = {
      timestamp: new Date(),
      renderTime,
      memoryUsage,
      dataFetchTime,
      chartRenderTime: 0,
      errorCount: 0,
    }

    setPerformanceHistory((prev) => [historyEntry, ...prev.slice(0, 99)]) // Keep last 100 entries

    // Check thresholds and show notifications
    if (showNotifications) {
      checkThresholds(newMetrics)
    }
  }, [enabled, showNotifications])

  // Check performance thresholds
  const checkThresholds = useCallback(
    (metrics: PerformanceMetrics) => {
      const issues: string[] = []

      if (metrics.renderTime > thresholds.renderTime) {
        issues.push(`Slow render time: ${metrics.renderTime.toFixed(0)}ms`)
      }

      if (metrics.memoryUsage > thresholds.memoryUsage) {
        issues.push(`High memory usage: ${metrics.memoryUsage.toFixed(1)}%`)
      }

      const errorRate = (metrics.errorCount / Math.max(performanceHistory.length, 1)) * 100
      if (errorRate > thresholds.errorRate) {
        issues.push(`High error rate: ${errorRate.toFixed(1)}%`)
      }

      if (issues.length > 0 && onOptimizationSuggestion) {
        onOptimizationSuggestion(issues.join(', '))
      }
    },
    [thresholds, performanceHistory.length, onOptimizationSuggestion]
  )

  // Performance statistics
  const performanceStats = useMemo(() => {
    if (performanceHistory.length === 0) {
      return {
        avgRenderTime: 0,
        avgMemoryUsage: 0,
        trend: 'neutral' as const,
        score: 100,
      }
    }

    const recent = performanceHistory.slice(0, 10)
    const older = performanceHistory.slice(10, 20)

    const avgRenderTime = recent.reduce((sum, entry) => sum + entry.renderTime, 0) / recent.length
    const avgMemoryUsage = recent.reduce((sum, entry) => sum + entry.memoryUsage, 0) / recent.length

    // Calculate trend
    let trend: 'improving' | 'declining' | 'neutral' = 'neutral'
    if (older.length > 0) {
      const recentAvg = avgRenderTime
      const olderAvg = older.reduce((sum, entry) => sum + entry.renderTime, 0) / older.length

      if (recentAvg < olderAvg * 0.9) {
        trend = 'improving'
      } else if (recentAvg > olderAvg * 1.1) {
        trend = 'declining'
      }
    }

    // Calculate performance score (0-100)
    let score = 100
    if (avgRenderTime > thresholds.renderTime) {
      score -= 30
    }
    if (avgMemoryUsage > thresholds.memoryUsage) {
      score -= 20
    }
    if (currentMetrics.errorCount > 0) {
      score -= 25
    }
    score = Math.max(0, score)

    return {
      avgRenderTime,
      avgMemoryUsage,
      trend,
      score,
    }
  }, [performanceHistory, currentMetrics.errorCount, thresholds])

  // Optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    const suggestions: string[] = []

    if (currentMetrics.renderTime > thresholds.renderTime) {
      suggestions.push('Consider using React.memo for components')
      suggestions.push('Implement virtual scrolling for large lists')
      suggestions.push('Lazy load chart components')
    }

    if (currentMetrics.memoryUsage > thresholds.memoryUsage) {
      suggestions.push('Clear unused data from memory')
      suggestions.push('Optimize image and chart caching')
      suggestions.push('Consider data pagination')
    }

    if (currentMetrics.errorCount > 0) {
      suggestions.push('Fix JavaScript errors')
      suggestions.push('Add error boundaries')
    }

    return suggestions
  }, [currentMetrics, thresholds])

  // Performance monitoring effect
  useEffect(() => {
    if (!enabled) {
      return
    }

    // Initial measurement
    measurePerformance()

    // Set up periodic monitoring
    const interval = setInterval(measurePerformance, 10000) // Every 10 seconds

    // Listen for navigation events
    const handleNavigation = () => {
      setTimeout(measurePerformance, 1000) // Delay to ensure measurement accuracy
    }

    window.addEventListener('beforeunload', handleNavigation)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleNavigation)
    }
  }, [enabled, measurePerformance])

  if (!enabled) {
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-600'
    }
    if (score >= 60) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className='h-3 w-3 text-green-600' />
      case 'declining':
        return <TrendingDown className='h-3 w-3 text-red-600' />
      default:
        return <Minus className='h-3 w-3 text-gray-600' />
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      {/* Performance indicator */}
      <div className='flex items-center gap-2'>
        {/* Main performance badge */}
        <Popover open={isVisible} onOpenChange={setIsVisible}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={`
                flex items-center gap-2 bg-background/95 backdrop-blur-sm
                ${
                  performanceStats.score < 60
                    ? 'border-red-300 text-red-700'
                    : performanceStats.score < 80
                      ? 'border-yellow-300 text-yellow-700'
                      : 'border-green-300 text-green-700'
                }
              `}
            >
              <Activity className='h-3 w-3' />
              <span className='text-xs font-medium'>{performanceStats.score}</span>
              {getTrendIcon(performanceStats.trend)}
            </Button>
          </PopoverTrigger>

          <PopoverContent align='end' side='top' className='w-80 p-0' sideOffset={8}>
            <Card className='border-0 shadow-none'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <Activity className='h-4 w-4' />
                    Performance Monitor
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsVisible(false)}
                    className='h-6 w-6 p-0'
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Performance Score */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Performance Score</span>
                    <span className={`text-lg font-bold ${getScoreColor(performanceStats.score)}`}>
                      {performanceStats.score}
                    </span>
                  </div>
                  <Progress value={performanceStats.score} className='h-2' />
                </div>

                {/* Key Metrics */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-xs text-muted-foreground'>Render Time</span>
                    </div>
                    <div className='text-sm font-medium'>
                      {performanceStats.avgRenderTime.toFixed(0)}ms
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <MemoryStick className='h-3 w-3 text-muted-foreground' />
                      <span className='text-xs text-muted-foreground'>Memory Usage</span>
                    </div>
                    <div className='text-sm font-medium'>
                      {performanceStats.avgMemoryUsage.toFixed(1)}%
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <Zap className='h-3 w-3 text-muted-foreground' />
                      <span className='text-xs text-muted-foreground'>Data Fetch</span>
                    </div>
                    <div className='text-sm font-medium'>
                      {currentMetrics.dataFetchTime.toFixed(0)}ms
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <AlertTriangle className='h-3 w-3 text-muted-foreground' />
                      <span className='text-xs text-muted-foreground'>Errors</span>
                    </div>
                    <div className='text-sm font-medium'>{currentMetrics.errorCount}</div>
                  </div>
                </div>

                {/* Performance Status */}
                <div className='space-y-2'>
                  <span className='text-sm font-medium'>Status</span>
                  <div className='flex items-center gap-2'>
                    {performanceStats.score >= 80 ? (
                      <>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <span className='text-sm text-green-700'>Excellent</span>
                      </>
                    ) : performanceStats.score >= 60 ? (
                      <>
                        <AlertTriangle className='h-4 w-4 text-yellow-600' />
                        <span className='text-sm text-yellow-700'>Needs Attention</span>
                      </>
                    ) : (
                      <>
                        <X className='h-4 w-4 text-red-600' />
                        <span className='text-sm text-red-700'>Poor</span>
                      </>
                    )}
                    <Badge variant='outline' className='ml-auto text-xs'>
                      {performanceHistory.length} samples
                    </Badge>
                  </div>
                </div>

                {/* Optimization Suggestions */}
                {optimizationSuggestions.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>Suggestions</span>
                      <Info className='h-3 w-3 text-muted-foreground' />
                    </div>
                    <div className='space-y-1'>
                      {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className='text-xs text-muted-foreground'>
                          • {suggestion}
                        </div>
                      ))}
                      {optimizationSuggestions.length > 3 && (
                        <div className='text-xs text-muted-foreground'>
                          +{optimizationSuggestions.length - 3} more suggestions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className='flex items-center gap-2 border-t pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={measurePerformance}
                    className='text-xs'
                  >
                    Refresh Metrics
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setPerformanceHistory([])}
                    className='text-xs'
                  >
                    Clear History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default PerformanceMonitor
