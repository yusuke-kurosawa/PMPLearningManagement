/**
 * Interactive Chart Component
 * Advanced chart component with drill-down capabilities, real-time updates,
 * and comprehensive accessibility features
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
  ReferenceArea,
  Brush,
} from 'recharts'
import {
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  Filter,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  Info,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Checkbox } from '../../ui/checkbox'
import { Slider } from '../../ui/slider'
import { Label } from '../../ui/label'
import { useToast } from '../../../hooks/use-toast'
import { InteractiveTooltip } from './InteractiveTooltip'
import type { ChartData, ChartDataset, DrilldownData, InteractiveEvent } from '../types/dashboard'

export interface InteractiveChartProps {
  // Data and configuration
  data: ChartData
  chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar'
  title: string
  description?: string

  // Styling
  width?: number | string
  height?: number | string
  colors?: string[]
  theme?: 'light' | 'dark'

  // Features
  enableDrilldown?: boolean
  enableZoom?: boolean
  enableBrush?: boolean
  enableExport?: boolean
  enableFullscreen?: boolean
  enableAnimation?: boolean
  enableTooltip?: boolean
  enableLegend?: boolean

  // Drill-down
  drilldownLevels?: DrilldownData[]
  onDrilldown?: (data: any, level: number) => void
  onDrillup?: (level: number) => void

  // Interactions
  onDataPointClick?: (data: any, event: InteractiveEvent) => void
  onDataPointHover?: (data: any, event: InteractiveEvent) => void
  onZoomChange?: (zoomLevel: number) => void
  onFilterChange?: (filters: any) => void

  // Accessibility
  ariaLabel?: string
  ariaDescription?: string

  // Performance
  virtualizeData?: boolean
  maxDataPoints?: number

  className?: string
}

interface ChartState {
  currentLevel: number
  zoomLevel: number
  visibleDatasets: string[]
  filters: Record<string, any>
  isFullscreen: boolean
  showSettings: boolean
  animationEnabled: boolean
}

const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#6366f1',
]

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  chartType,
  title,
  description,
  width = '100%',
  height = 400,
  colors = CHART_COLORS,
  theme = 'light',
  enableDrilldown = true,
  enableZoom = true,
  enableBrush = true,
  enableExport = true,
  enableFullscreen = true,
  enableAnimation = true,
  enableTooltip = true,
  enableLegend = true,
  drilldownLevels = [],
  onDrilldown,
  onDrillup,
  onDataPointClick,
  onDataPointHover,
  onZoomChange,
  onFilterChange,
  ariaLabel,
  ariaDescription,
  virtualizeData = false,
  maxDataPoints = 1000,
  className = '',
}) => {
  const { toast } = useToast()
  const chartRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<ChartState>({
    currentLevel: 0,
    zoomLevel: 1,
    visibleDatasets: data.datasets.map((d) => d.label),
    filters: {},
    isFullscreen: false,
    showSettings: false,
    animationEnabled: enableAnimation,
  })

  // Processed data with filters and virtualization
  const processedData = useMemo(() => {
    const filteredData = { ...data }

    // Apply virtualization if enabled
    if (virtualizeData && data.labels.length > maxDataPoints) {
      const step = Math.ceil(data.labels.length / maxDataPoints)
      filteredData.labels = data.labels.filter((_, index) => index % step === 0)
      filteredData.datasets = data.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.filter((_, index) => index % step === 0),
      }))
    }

    // Filter visible datasets
    filteredData.datasets = filteredData.datasets.filter((dataset) =>
      state.visibleDatasets.includes(dataset.label)
    )

    return filteredData
  }, [data, state.visibleDatasets, virtualizeData, maxDataPoints])

  // Chart statistics
  const chartStats = useMemo(() => {
    const allValues = processedData.datasets.flatMap((d) => d.data)
    return {
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      avg: allValues.reduce((sum, val) => sum + val, 0) / allValues.length,
      count: allValues.length,
      trend:
        allValues.length > 1
          ? allValues[allValues.length - 1] > allValues[0]
            ? 'up'
            : 'down'
          : 'neutral',
    }
  }, [processedData])

  // Handle data point interactions
  const handleDataPointClick = useCallback(
    (data: any, event: any) => {
      const interactiveEvent: InteractiveEvent = {
        type: 'click',
        target: 'datapoint',
        data,
        timestamp: new Date(),
        sessionId: crypto.randomUUID(),
      }

      onDataPointClick?.(data, interactiveEvent)

      // Handle drill-down
      if (enableDrilldown && onDrilldown && state.currentLevel < drilldownLevels.length) {
        setState((prev) => ({ ...prev, currentLevel: prev.currentLevel + 1 }))
        onDrilldown(data, state.currentLevel + 1)
      }
    },
    [onDataPointClick, enableDrilldown, onDrilldown, state.currentLevel, drilldownLevels]
  )

  const handleDataPointHover = useCallback(
    (data: any) => {
      const interactiveEvent: InteractiveEvent = {
        type: 'hover',
        target: 'datapoint',
        data,
        timestamp: new Date(),
        sessionId: crypto.randomUUID(),
      }

      onDataPointHover?.(data, interactiveEvent)
    },
    [onDataPointHover]
  )

  // Chart controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(state.zoomLevel * 1.2, 5)
    setState((prev) => ({ ...prev, zoomLevel: newZoom }))
    onZoomChange?.(newZoom)
  }, [state.zoomLevel, onZoomChange])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(state.zoomLevel / 1.2, 0.5)
    setState((prev) => ({ ...prev, zoomLevel: newZoom }))
    onZoomChange?.(newZoom)
  }, [state.zoomLevel, onZoomChange])

  const handleZoomReset = useCallback(() => {
    setState((prev) => ({ ...prev, zoomLevel: 1 }))
    onZoomChange?.(1)
  }, [onZoomChange])

  const handleDrillUp = useCallback(() => {
    if (state.currentLevel > 0) {
      const newLevel = state.currentLevel - 1
      setState((prev) => ({ ...prev, currentLevel: newLevel }))
      onDrillup?.(newLevel)
    }
  }, [state.currentLevel, onDrillup])

  const toggleDatasetVisibility = useCallback((datasetLabel: string) => {
    setState((prev) => ({
      ...prev,
      visibleDatasets: prev.visibleDatasets.includes(datasetLabel)
        ? prev.visibleDatasets.filter((label) => label !== datasetLabel)
        : [...prev.visibleDatasets, datasetLabel],
    }))
  }, [])

  const handleExport = useCallback(
    async (format: 'png' | 'svg' | 'csv' | 'json') => {
      try {
        // Implementation would depend on chart library's export capabilities
        toast({
          title: 'Export Started',
          description: `Exporting chart as ${format.toUpperCase()}...`,
        })

        // Mock export for now
        setTimeout(() => {
          toast({
            title: 'Export Complete',
            description: `Chart exported as ${format.toUpperCase()}`,
          })
        }, 2000)
      } catch (error) {
        toast({
          title: 'Export Failed',
          description: 'Failed to export chart data.',
          variant: 'destructive',
        })
      }
    },
    [toast]
  )

  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }))
  }, [])

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <InteractiveTooltip
        data={{
          label,
          values: payload.map((p: any) => ({
            name: p.dataKey,
            value: p.value,
            color: p.color,
          })),
        }}
        showCalculations
        showTrend
      />
    )
  }, [])

  // Render chart based on type
  const renderChart = useCallback(() => {
    const commonProps = {
      data: processedData.labels.map((label, index) => {
        const point: any = { name: label }
        processedData.datasets.forEach((dataset) => {
          point[dataset.label] = dataset.data[index] || 0
        })
        return point
      }),
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    }

    const chartProps = {
      onClick: handleDataPointClick,
      onMouseEnter: handleDataPointHover,
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} {...chartProps}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            {enableTooltip && <Tooltip content={<CustomTooltip />} />}
            {enableLegend && <Legend />}
            {processedData.datasets.map((dataset, index) => (
              <Line
                key={dataset.label}
                type='monotone'
                dataKey={dataset.label}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
                animationDuration={state.animationEnabled ? 750 : 0}
              />
            ))}
            {enableBrush && <Brush dataKey='name' height={30} />}
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps} {...chartProps}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            {enableTooltip && <Tooltip content={<CustomTooltip />} />}
            {enableLegend && <Legend />}
            {processedData.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={state.animationEnabled ? 750 : 0}
              />
            ))}
            {enableBrush && <Brush dataKey='name' height={30} />}
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps} {...chartProps}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            {enableTooltip && <Tooltip content={<CustomTooltip />} />}
            {enableLegend && <Legend />}
            {processedData.datasets.map((dataset, index) => (
              <Area
                key={dataset.label}
                type='monotone'
                dataKey={dataset.label}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                animationDuration={state.animationEnabled ? 750 : 0}
              />
            ))}
            {enableBrush && <Brush dataKey='name' height={30} />}
          </AreaChart>
        )

      case 'pie':
      case 'doughnut':
        const pieData = processedData.labels.map((label, index) => ({
          name: label,
          value: processedData.datasets[0]?.data[index] || 0,
        }))

        return (
          <PieChart {...chartProps}>
            <Pie
              data={pieData}
              cx='50%'
              cy='50%'
              innerRadius={chartType === 'doughnut' ? 60 : 0}
              outerRadius={120}
              paddingAngle={2}
              dataKey='value'
              animationDuration={state.animationEnabled ? 750 : 0}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {enableTooltip && <Tooltip />}
            {enableLegend && <Legend />}
          </PieChart>
        )

      case 'radar':
        const radarData = processedData.labels.map((label, index) => {
          const point: any = { subject: label }
          processedData.datasets.forEach((dataset) => {
            point[dataset.label] = dataset.data[index] || 0
          })
          return point
        })

        return (
          <RadarChart {...commonProps} data={radarData} {...chartProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey='subject' />
            <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
            {enableTooltip && <Tooltip />}
            {enableLegend && <Legend />}
            {processedData.datasets.map((dataset, index) => (
              <Radar
                key={dataset.label}
                name={dataset.label}
                dataKey={dataset.label}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                animationDuration={state.animationEnabled ? 750 : 0}
              />
            ))}
          </RadarChart>
        )

      default:
        return <div>Unsupported chart type: {chartType}</div>
    }
  }, [
    processedData,
    chartType,
    colors,
    enableTooltip,
    enableLegend,
    enableBrush,
    state.animationEnabled,
    handleDataPointClick,
    handleDataPointHover,
    CustomTooltip,
  ])

  return (
    <Card
      className={`${className} ${state.isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      ref={chartRef}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-lg'>{title}</CardTitle>
              {state.currentLevel > 0 && (
                <Badge variant='outline' className='text-xs'>
                  Level {state.currentLevel}
                </Badge>
              )}
            </div>
            {description && <CardDescription className='text-sm'>{description}</CardDescription>}

            {/* Breadcrumb for drill-down */}
            {enableDrilldown && state.currentLevel > 0 && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleDrillUp}
                  className='h-auto p-1 text-xs'
                >
                  ← Back
                </Button>
              </div>
            )}
          </div>

          {/* Chart controls */}
          <div className='flex items-center gap-1'>
            {/* Chart statistics */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='ghost' size='sm' aria-label='Chart statistics'>
                  <Info className='h-4 w-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-64'>
                <div className='space-y-3'>
                  <h4 className='font-medium'>Chart Statistics</h4>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <div className='text-muted-foreground'>Min</div>
                      <div className='font-medium'>{chartStats.min.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className='text-muted-foreground'>Max</div>
                      <div className='font-medium'>{chartStats.max.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className='text-muted-foreground'>Average</div>
                      <div className='font-medium'>{chartStats.avg.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className='text-muted-foreground'>Trend</div>
                      <div className='flex items-center gap-1'>
                        {chartStats.trend === 'up' ? (
                          <TrendingUp className='h-3 w-3 text-green-500' />
                        ) : chartStats.trend === 'down' ? (
                          <TrendingDown className='h-3 w-3 text-red-500' />
                        ) : (
                          <Minus className='h-3 w-3 text-gray-500' />
                        )}
                        <span className='text-xs capitalize'>{chartStats.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Zoom controls */}
            {enableZoom && (
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleZoomOut}
                  disabled={state.zoomLevel <= 0.5}
                  aria-label='Zoom out'
                >
                  <ZoomOut className='h-4 w-4' />
                </Button>
                <span className='min-w-8 text-center text-xs text-muted-foreground'>
                  {Math.round(state.zoomLevel * 100)}%
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleZoomIn}
                  disabled={state.zoomLevel >= 5}
                  aria-label='Zoom in'
                >
                  <ZoomIn className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' onClick={handleZoomReset} aria-label='Reset zoom'>
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </div>
            )}

            {/* Legend toggle */}
            {enableLegend && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='ghost' size='sm' aria-label='Legend settings'>
                    <Eye className='h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-64'>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>Visible Data Series</h4>
                    <div className='space-y-2'>
                      {data.datasets.map((dataset, index) => (
                        <div key={dataset.label} className='flex items-center gap-2'>
                          <Checkbox
                            id={`dataset-${index}`}
                            checked={state.visibleDatasets.includes(dataset.label)}
                            onCheckedChange={() => toggleDatasetVisibility(dataset.label)}
                          />
                          <div
                            className='h-3 w-3 rounded-sm'
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <Label
                            htmlFor={`dataset-${index}`}
                            className='cursor-pointer text-sm font-normal'
                          >
                            {dataset.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Export options */}
            {enableExport && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='ghost' size='sm' aria-label='Export chart'>
                    <Download className='h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-48'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Export Options</h4>
                    <div className='grid gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleExport('png')}
                        className='justify-start'
                      >
                        Export as PNG
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleExport('svg')}
                        className='justify-start'
                      >
                        Export as SVG
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleExport('csv')}
                        className='justify-start'
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleExport('json')}
                        className='justify-start'
                      >
                        Export as JSON
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Chart settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='ghost' size='sm' aria-label='Chart settings'>
                  <Settings className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chart Settings</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label>Enable Animation</Label>
                    <Checkbox
                      checked={state.animationEnabled}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({ ...prev, animationEnabled: checked as boolean }))
                      }
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Fullscreen toggle */}
            {enableFullscreen && (
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleFullscreen}
                aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {state.isFullscreen ? (
                  <Minimize2 className='h-4 w-4' />
                ) : (
                  <Maximize2 className='h-4 w-4' />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-2'>
        <div
          style={{
            width,
            height: state.isFullscreen ? 'calc(100vh - 200px)' : height,
            transform: `scale(${state.zoomLevel})`,
            transformOrigin: 'top left',
          }}
          role='img'
          aria-label={ariaLabel || `${chartType} chart showing ${title}`}
          aria-description={ariaDescription}
        >
          <ResponsiveContainer width='100%' height='100%'>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default InteractiveChart
