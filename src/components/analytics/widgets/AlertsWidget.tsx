/**
 * Alerts Widget
 * Real-time notification system with categorization, priority handling,
 * and comprehensive alert management
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  AlertTriangle,
  Bell,
  X,
  CheckCircle,
  Info,
  AlertCircle,
  XCircle,
  Filter,
  Archive,
  Clock,
  User,
  Activity,
  BookOpen,
  TrendingDown,
  Zap,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import { Switch } from '../../ui/switch'
import { Label } from '../../ui/label'
import { Separator } from '../../ui/separator'
import { formatDistanceToNow } from 'date-fns'
import type { Alert } from '../../../hooks/useRealTimeAnalytics'

interface AlertsWidgetProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
  onDismissAll?: () => void
  onArchive?: (alertId: string) => void
  onMarkAsRead?: (alertId: string) => void
  onAction?: (alertId: string, actionUrl: string) => void
  showFilters?: boolean
  maxVisible?: number
  groupByCategory?: boolean
  autoHide?: boolean
  autoHideDelay?: number
  className?: string
}

interface AlertFilters {
  priority: string[]
  category: string[]
  type: string[]
  timeRange: string
  showDismissed: boolean
}

const ALERT_ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
}

const ALERT_COLORS = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700 animate-pulse',
}

const CATEGORY_ICONS = {
  engagement: Activity,
  performance: TrendingDown,
  system: Settings,
  achievement: BookOpen,
  risk: AlertTriangle,
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
  onArchive,
  onMarkAsRead,
  onAction,
  showFilters = true,
  maxVisible = 10,
  groupByCategory = false,
  autoHide = false,
  autoHideDelay = 5000,
  className = '',
}) => {
  const [filters, setFilters] = useState<AlertFilters>({
    priority: [],
    category: [],
    type: [],
    timeRange: '24h',
    showDismissed: false,
  })
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    let filtered = alerts

    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter((alert) => filters.priority.includes(alert.priority))
    }

    // Filter by category
    if (filters.category.length > 0) {
      filtered = filtered.filter((alert) => filters.category.includes(alert.category))
    }

    // Filter by type
    if (filters.type.length > 0) {
      filtered = filtered.filter((alert) => filters.type.includes(alert.type))
    }

    // Filter by time range
    const now = new Date()
    const timeRangeHours =
      {
        '1h': 1,
        '6h': 6,
        '24h': 24,
        '7d': 24 * 7,
        all: Number.MAX_SAFE_INTEGER,
      }[filters.timeRange] || 24

    filtered = filtered.filter((alert) => {
      const hoursDiff = (now.getTime() - alert.timestamp.getTime()) / (1000 * 60 * 60)
      return hoursDiff <= timeRangeHours
    })

    // Filter by dismissed status
    if (!filters.showDismissed) {
      filtered = filtered.filter((alert) => !alert.dismissed)
    }

    return filtered
  }, [alerts, filters])

  // Group alerts by category if requested
  const groupedAlerts = useMemo(() => {
    if (!groupByCategory) {
      return { all: filteredAlerts }
    }

    return filteredAlerts.reduce(
      (groups, alert) => {
        const category = alert.category
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(alert)
        return groups
      },
      {} as Record<string, Alert[]>
    )
  }, [filteredAlerts, groupByCategory])

  // Alert statistics
  const alertStats = useMemo(() => {
    const stats = {
      total: filteredAlerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unread: 0,
      categories: {} as Record<string, number>,
    }

    filteredAlerts.forEach((alert) => {
      stats[alert.priority as keyof typeof stats] =
        (stats[alert.priority as keyof typeof stats] as number) + 1
      stats.categories[alert.category] = (stats.categories[alert.category] || 0) + 1
    })

    return stats
  }, [filteredAlerts])

  const toggleAlertExpansion = useCallback((alertId: string) => {
    setExpandedAlerts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(alertId)) {
        newSet.delete(alertId)
      } else {
        newSet.add(alertId)
      }
      return newSet
    })
  }, [])

  const handleFilterChange = useCallback((key: keyof AlertFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const renderAlert = useCallback(
    (alert: Alert, index: number) => {
      const IconComponent = ALERT_ICONS[alert.type] || Info
      const CategoryIcon = CATEGORY_ICONS[alert.category] || Activity
      const isExpanded = expandedAlerts.has(alert.id)

      return (
        <Card
          key={alert.id}
          className={`transition-all duration-300 ${ALERT_COLORS[alert.type]} ${
            alert.priority === 'critical' ? 'ring-2 ring-red-300' : ''
          }`}
        >
          <CardContent className='p-4'>
            <div className='flex items-start justify-between gap-3'>
              {/* Alert Icon and Content */}
              <div className='flex flex-1 items-start gap-3'>
                <div className='mt-0.5 flex-shrink-0'>
                  <IconComponent className='h-5 w-5' />
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <h4 className='truncate text-sm font-semibold'>{alert.title}</h4>
                    <Badge
                      variant='secondary'
                      className={`text-xs ${PRIORITY_COLORS[alert.priority]}`}
                    >
                      {alert.priority.toUpperCase()}
                    </Badge>
                    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                      <CategoryIcon className='h-3 w-3' />
                      <span className='capitalize'>{alert.category}</span>
                    </div>
                  </div>

                  <p className={`text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>{alert.message}</p>

                  <div className='mt-2 flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                    </div>

                    <div className='flex items-center gap-1'>
                      {alert.message.length > 100 && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleAlertExpansion(alert.id)}
                          className='h-6 px-2 text-xs'
                        >
                          {isExpanded ? 'Less' : 'More'}
                        </Button>
                      )}

                      {alert.actionUrl && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onAction?.(alert.id, alert.actionUrl!)}
                          className='h-6 px-2 text-xs'
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-shrink-0 items-center gap-1'>
                {onMarkAsRead && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onMarkAsRead(alert.id)}
                    className='h-8 w-8 p-0'
                    aria-label='Mark as read'
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                )}

                {onArchive && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => onArchive(alert.id)}
                    className='h-8 w-8 p-0'
                    aria-label='Archive alert'
                  >
                    <Archive className='h-4 w-4' />
                  </Button>
                )}

                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onDismiss(alert.id)}
                  className='h-8 w-8 p-0'
                  aria-label='Dismiss alert'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    [expandedAlerts, toggleAlertExpansion, onAction, onMarkAsRead, onArchive, onDismiss]
  )

  if (filteredAlerts.length === 0) {
    return null
  }

  return (
    <Card className={`${className}`} role='region' aria-label='System alerts'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Bell className='h-5 w-5 text-orange-600' />
            <CardTitle className='text-lg'>System Alerts ({alertStats.total})</CardTitle>
            {alertStats.critical > 0 && (
              <Badge variant='destructive' className='animate-pulse'>
                {alertStats.critical} Critical
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {/* Filter Toggle */}
            {showFilters && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={showFiltersPanel ? 'bg-accent' : ''}
              >
                <Filter className='mr-2 h-4 w-4' />
                Filters
              </Button>
            )}

            {/* Dismiss All */}
            {onDismissAll && filteredAlerts.length > 0 && (
              <Button variant='outline' size='sm' onClick={onDismissAll}>
                <X className='mr-2 h-4 w-4' />
                Dismiss All
              </Button>
            )}
          </div>
        </div>

        {/* Alert Stats */}
        {alertStats.total > 0 && (
          <div className='flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-red-500' />
              <span>Critical: {alertStats.critical}</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-orange-500' />
              <span>High: {alertStats.high}</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
              <span>Medium: {alertStats.medium}</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-gray-500' />
              <span>Low: {alertStats.low}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Filters Panel */}
        {showFilters && (
          <Collapsible open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
            <CollapsibleContent className='space-y-4 pb-4'>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Time Range</Label>
                  <Select
                    value={filters.timeRange}
                    onValueChange={(value) => handleFilterChange('timeRange', value)}
                  >
                    <SelectTrigger className='h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1h'>Last hour</SelectItem>
                      <SelectItem value='6h'>Last 6 hours</SelectItem>
                      <SelectItem value='24h'>Last 24 hours</SelectItem>
                      <SelectItem value='7d'>Last 7 days</SelectItem>
                      <SelectItem value='all'>All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Priority</Label>
                  <Select
                    value={filters.priority.join(',')}
                    onValueChange={(value) =>
                      handleFilterChange('priority', value ? value.split(',') : [])
                    }
                  >
                    <SelectTrigger className='h-8'>
                      <SelectValue placeholder='All priorities' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='critical'>Critical</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='low'>Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Category</Label>
                  <Select
                    value={filters.category.join(',')}
                    onValueChange={(value) =>
                      handleFilterChange('category', value ? value.split(',') : [])
                    }
                  >
                    <SelectTrigger className='h-8'>
                      <SelectValue placeholder='All categories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='engagement'>Engagement</SelectItem>
                      <SelectItem value='performance'>Performance</SelectItem>
                      <SelectItem value='system'>System</SelectItem>
                      <SelectItem value='achievement'>Achievement</SelectItem>
                      <SelectItem value='risk'>Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center space-x-2 pt-6'>
                  <Switch
                    id='show-dismissed'
                    checked={filters.showDismissed}
                    onCheckedChange={(checked) => handleFilterChange('showDismissed', checked)}
                  />
                  <Label htmlFor='show-dismissed' className='text-sm'>
                    Show dismissed
                  </Label>
                </div>
              </div>
              <Separator />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Alerts Content */}
        {groupByCategory ? (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className='grid w-full grid-cols-6'>
              <TabsTrigger value='all'>All ({alertStats.total})</TabsTrigger>
              {Object.entries(alertStats.categories).map(([category, count]) => (
                <TabsTrigger key={category} value={category} className='capitalize'>
                  {category} ({count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value='all' className='mt-4'>
              <div className='space-y-3'>
                {filteredAlerts.slice(0, maxVisible).map(renderAlert)}
                {filteredAlerts.length > maxVisible && (
                  <div className='pt-2 text-center'>
                    <Button variant='outline' size='sm'>
                      Show {filteredAlerts.length - maxVisible} more alerts
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {Object.entries(groupedAlerts).map(([category, categoryAlerts]) => {
              if (category === 'all') {
                return null
              }
              return (
                <TabsContent key={category} value={category} className='mt-4'>
                  <div className='space-y-3'>
                    {categoryAlerts.slice(0, maxVisible).map(renderAlert)}
                    {categoryAlerts.length > maxVisible && (
                      <div className='pt-2 text-center'>
                        <Button variant='outline' size='sm'>
                          Show {categoryAlerts.length - maxVisible} more alerts
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        ) : (
          <div className='space-y-3'>
            {filteredAlerts.slice(0, maxVisible).map(renderAlert)}
            {filteredAlerts.length > maxVisible && (
              <div className='pt-2 text-center'>
                <Button variant='outline' size='sm'>
                  Show {filteredAlerts.length - maxVisible} more alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AlertsWidget
