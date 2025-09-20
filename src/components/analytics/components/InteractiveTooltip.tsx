/**
 * Interactive Tooltip Component
 * Enhanced tooltip with contextual information, calculations, and drill-down hints
 */

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Calculator, Info, ChevronRight } from 'lucide-react'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'

interface TooltipValue {
  name: string
  value: number
  color: string
  previousValue?: number
  target?: number
  unit?: string
}

interface InteractiveTooltipProps {
  data: {
    label: string
    values: TooltipValue[]
  }
  showCalculations?: boolean
  showTrend?: boolean
  showComparisons?: boolean
  showDrilldownHint?: boolean
  className?: string
}

export const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  data,
  showCalculations = false,
  showTrend = false,
  showComparisons = false,
  showDrilldownHint = false,
  className = '',
}) => {
  const calculations = useMemo(() => {
    if (!showCalculations || data.values.length === 0) {
      return null
    }

    const values = data.values.map((v) => v.value)
    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)

    return {
      total,
      average,
      max,
      min,
      range: max - min,
    }
  }, [data.values, showCalculations])

  const formatValue = (value: number, unit?: string) => {
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return unit ? `${formatted} ${unit}` : formatted
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getTrendDirection = (current: number, previous: number) => {
    if (current > previous) {
      return 'up'
    }
    if (current < previous) {
      return 'down'
    }
    return 'neutral'
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      className={`
        z-50 max-w-sm rounded-lg border border-gray-200 
        bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}
      `}
      role='tooltip'
      aria-live='polite'
    >
      {/* Header */}
      <div className='mb-3'>
        <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{data.label}</h4>
        {showDrilldownHint && (
          <div className='mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
            <Info className='h-3 w-3' />
            <span>Click to drill down</span>
            <ChevronRight className='h-3 w-3' />
          </div>
        )}
      </div>

      {/* Values */}
      <div className='space-y-2'>
        {data.values.map((item, index) => (
          <div key={`${item.name}-${index}`} className='space-y-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div
                  className='h-3 w-3 flex-shrink-0 rounded-sm'
                  style={{ backgroundColor: item.color }}
                  aria-hidden='true'
                />
                <span className='text-sm text-gray-700 dark:text-gray-300'>{item.name}</span>
              </div>
              <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                {formatValue(item.value, item.unit)}
              </span>
            </div>

            {/* Trend and comparisons */}
            <div className='ml-5 flex items-center gap-3 text-xs'>
              {/* Trend indicator */}
              {showTrend && item.previousValue !== undefined && (
                <div className='flex items-center gap-1'>
                  {(() => {
                    const trend = getTrendDirection(item.value, item.previousValue)
                    const change = Math.abs(item.value - item.previousValue)
                    const changePercent =
                      item.previousValue !== 0 ? change / Math.abs(item.previousValue) : 0

                    return (
                      <>
                        {trend === 'up' ? (
                          <TrendingUp className={`h-3 w-3 ${getTrendColor(trend)}`} />
                        ) : trend === 'down' ? (
                          <TrendingDown className={`h-3 w-3 ${getTrendColor(trend)}`} />
                        ) : null}
                        <span className={getTrendColor(trend)}>
                          {trend !== 'neutral' && (
                            <>
                              {formatValue(change, item.unit)}({formatPercentage(changePercent)})
                            </>
                          )}
                          {trend === 'neutral' && 'No change'}
                        </span>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Target comparison */}
              {showComparisons && item.target !== undefined && (
                <div className='flex items-center gap-1'>
                  <span className='text-gray-500 dark:text-gray-400'>vs Target:</span>
                  {(() => {
                    const diff = item.value - item.target
                    const isAboveTarget = diff > 0
                    const diffPercent =
                      item.target !== 0 ? Math.abs(diff) / Math.abs(item.target) : 0

                    return (
                      <Badge
                        variant={isAboveTarget ? 'default' : 'destructive'}
                        className='px-1 py-0 text-xs'
                      >
                        {isAboveTarget ? '+' : '-'}
                        {formatValue(Math.abs(diff), item.unit)}({formatPercentage(diffPercent)})
                      </Badge>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Calculations */}
      {showCalculations && calculations && (
        <>
          <Separator className='my-3' />
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
              <Calculator className='h-3 w-3' />
              <span>Calculations</span>
            </div>
            <div className='grid grid-cols-2 gap-x-3 gap-y-1 text-xs'>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Total:</span>
                <span className='font-medium'>{formatValue(calculations.total)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Average:</span>
                <span className='font-medium'>{formatValue(calculations.average)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Maximum:</span>
                <span className='font-medium'>{formatValue(calculations.max)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Minimum:</span>
                <span className='font-medium'>{formatValue(calculations.min)}</span>
              </div>
              <div className='col-span-2 flex justify-between'>
                <span className='text-gray-600 dark:text-gray-400'>Range:</span>
                <span className='font-medium'>{formatValue(calculations.range)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Distribution for multiple values */}
      {data.values.length > 1 && calculations && (
        <>
          <Separator className='my-3' />
          <div className='space-y-2'>
            <div className='text-xs text-gray-600 dark:text-gray-400'>Distribution</div>
            <div className='space-y-1'>
              {data.values.map((item, index) => {
                const percentage = calculations.total > 0 ? item.value / calculations.total : 0
                return (
                  <div key={`dist-${item.name}-${index}`} className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full' style={{ backgroundColor: item.color }} />
                    <div className='h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-700'>
                      <div
                        className='h-full rounded-full transition-all duration-300'
                        style={{
                          backgroundColor: item.color,
                          width: `${Math.max(percentage * 100, 2)}%`,
                        }}
                      />
                    </div>
                    <span className='min-w-10 text-right text-xs font-medium'>
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InteractiveTooltip
