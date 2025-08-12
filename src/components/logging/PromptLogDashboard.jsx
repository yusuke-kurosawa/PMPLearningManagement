/**
 * Prompt Log Dashboard Component
 * Comprehensive UI for viewing, analyzing, and managing prompt logs
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Progress } from '../ui/progress'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Archive,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Bot,
  User,
  Calendar,
  FileText,
  Database,
  Activity,
  Eye,
  Copy,
  Share2,
  Flag,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import promptLogService from '../../services/promptLogService'
import { useToast } from '../ui/use-toast'
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays } from 'date-fns'

const PromptLogDashboard = () => {
  const { toast } = useToast()
  const [logs, setLogs] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
  const [filters, setFilters] = useState({
    type: 'all',
    userId: '',
    sessionId: '',
    status: 'all',
    timeRange: '24h',
    searchQuery: '',
    tags: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortConfig, setSortConfig] = useState({ field: 'timestamp', order: 'desc' })
  const [exportFormat, setExportFormat] = useState('json')
  const [config, setConfig] = useState(promptLogService.getConfig())
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(null)

  // Load initial data
  useEffect(() => {
    loadLogs()
    loadStatistics()

    // Set up auto-refresh if enabled
    if (config.autoRefresh) {
      const interval = setInterval(() => {
        loadLogs()
        loadStatistics()
      }, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)

      return () => clearInterval(interval)
    }
  }, [])

  // Load logs with current filters
  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const timeRange = getTimeRange(filters.timeRange)
      const result = await promptLogService.queryLogs({
        ...filters,
        startTime: timeRange.start,
        endTime: timeRange.end,
        sort: sortConfig,
        page: currentPage,
        limit: pageSize,
      })
      setLogs(result)
    } catch (error) {
      console.error('Failed to load logs:', error)
      toast({
        title: 'Error loading logs',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filters, sortConfig, currentPage, pageSize])

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const timeRange = getTimeRange(filters.timeRange)
      const stats = await promptLogService.getStatistics(timeRange)
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    }
  }, [filters.timeRange])

  // Effect to reload logs when filters change
  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  // Effect to reload statistics when time range changes
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // Get time range based on filter
  const getTimeRange = (range) => {
    const now = Date.now()
    switch (range) {
      case '1h':
        return { start: now - 3600000, end: now }
      case '24h':
        return { start: now - 86400000, end: now }
      case '7d':
        return { start: now - 604800000, end: now }
      case '30d':
        return { start: now - 2592000000, end: now }
      case 'all':
        return { start: 0, end: now }
      default:
        return { start: now - 86400000, end: now }
    }
  }

  // Handle log export
  const handleExport = async () => {
    try {
      const exportData = await promptLogService.exportLogs(exportFormat, filters)
      const blob = new Blob([exportData], { type: getMimeType(exportFormat) })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-logs-${Date.now()}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Logs exported as ${exportFormat.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // Get MIME type for export format
  const getMimeType = (format) => {
    const types = {
      json: 'application/json',
      jsonl: 'application/x-ndjson',
      csv: 'text/csv',
      markdown: 'text/markdown',
    }
    return types[format] || 'text/plain'
  }

  // Handle clear all logs
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      try {
        await promptLogService.clearAllLogs()
        setLogs([])
        setStatistics(null)
        toast({
          title: 'Logs cleared',
          description: 'All logs have been permanently deleted',
        })
      } catch (error) {
        toast({
          title: 'Clear failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  // Handle config update
  const handleConfigUpdate = async (newConfig) => {
    try {
      promptLogService.updateConfig(newConfig)
      setConfig(newConfig)
      toast({
        title: 'Configuration updated',
        description: 'Settings have been saved',
      })
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // Handle sort
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')
  }

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      error: 'bg-red-500',
      processing: 'bg-blue-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      prompt: <MessageSquare className="h-4 w-4" />,
      response: <Bot className="h-4 w-4" />,
      interaction: <User className="h-4 w-4" />,
    }
    return icons[type] || <FileText className="h-4 w-4" />
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!statistics) return {}

    // Activity over time
    const activityData = logs.data?.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd')
      if (!acc[date]) {
        acc[date] = { date, prompts: 0, responses: 0, interactions: 0 }
      }
      acc[date][`${log.type}s`]++
      return acc
    }, {})

    // Cost by model
    const costData = Object.entries(statistics.costAnalysis?.costByModel || {}).map(
      ([model, data]) => ({
        model,
        cost: data.total,
        count: data.count,
      })
    )

    // Top tags
    const tagData = statistics.topTags || []

    return {
      activity: Object.values(activityData || {}),
      cost: costData,
      tags: tagData,
    }
  }, [statistics, logs])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prompt Log Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze AI prompt interactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log Configuration</DialogTitle>
                <DialogDescription>
                  Configure logging behavior and retention policies
                </DialogDescription>
              </DialogHeader>
              <ConfigurationPanel config={config} onUpdate={handleConfigUpdate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Logs"
            value={statistics.totalLogs}
            icon={<Database className="h-4 w-4" />}
            trend={null}
          />
          <StatCard
            title="Avg Response Time"
            value={`${statistics.averageResponseTime.toFixed(2)}ms`}
            icon={<Clock className="h-4 w-4" />}
            trend={statistics.averageResponseTime < 1000 ? 'up' : 'down'}
          />
          <StatCard
            title="Error Rate"
            value={`${statistics.errorRate.toFixed(2)}%`}
            icon={<AlertCircle className="h-4 w-4" />}
            trend={statistics.errorRate > 5 ? 'down' : 'up'}
          />
          <StatCard
            title="Total Cost"
            value={`$${statistics.costAnalysis?.totalCost.toFixed(4) || 0}`}
            icon={<DollarSign className="h-4 w-4" />}
            trend={null}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="prompt">Prompts</SelectItem>
                      <SelectItem value="response">Responses</SelectItem>
                      <SelectItem value="interaction">Interactions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Range</Label>
                  <Select
                    value={filters.timeRange}
                    onValueChange={(value) => setFilters({ ...filters, timeRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Log Entries</CardTitle>
              <CardDescription>
                Showing {logs.pagination?.data?.length || 0} of {logs.pagination?.total || 0} logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                            Type
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('timestamp')}>
                            Timestamp
                          </TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                            Status
                          </TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Tokens</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.data?.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(log.type)}
                                <span className="capitalize">{log.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">{formatTimestamp(log.timestamp)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatRelativeTime(log.timestamp)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{log.userId}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(log.status)}>
                                {log.status || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.model || '-'}</TableCell>
                            <TableCell>{log.metadata?.totalTokens || '-'}</TableCell>
                            <TableCell>
                              {log.metrics?.cost?.total
                                ? `$${log.metrics.cost.total.toFixed(4)}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Pagination */}
                  {logs.pagination && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {logs.pagination.page} of {logs.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={!logs.pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={!logs.pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="prompts" stroke="#8884d8" />
                    <Line type="monotone" dataKey="responses" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="interactions" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.tags}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Activity */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Prompts</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Total Tokens</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statistics?.userActivity || {}).map(([userId, activity]) => (
                    <TableRow key={userId}>
                      <TableCell>{userId}</TableCell>
                      <TableCell>{activity.promptCount}</TableCell>
                      <TableCell>{activity.responseCount}</TableCell>
                      <TableCell>{activity.interactionCount}</TableCell>
                      <TableCell>{activity.totalTokens}</TableCell>
                      <TableCell>{activity.errors}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-bold">
                      ${statistics?.costAnalysis?.totalCost.toFixed(4) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prompt Cost:</span>
                    <span>${statistics?.costAnalysis?.promptCost.toFixed(4) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Cost:</span>
                    <span>${statistics?.costAnalysis?.completionCost.toFixed(4) || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Average Cost/Request:</span>
                    <span>
                      ${statistics?.costAnalysis?.averageCostPerRequest.toFixed(4) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost by Model */}
            <Card>
              <CardHeader>
                <CardTitle>Cost by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.cost}
                      dataKey="cost"
                      nameKey="model"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {chartData.cost?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Logs</CardTitle>
              <CardDescription>
                Export filtered logs in your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="jsonl">JSON Lines</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Export Information</AlertTitle>
                <AlertDescription>
                  Current filters will be applied to the export. You are exporting{' '}
                  {logs.pagination?.total || 0} logs from the selected time range.
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Maintenance</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => promptLogService.cleanupOldLogs()}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Old Logs
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <LogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trend === 'up' ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">Good</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-red-500">Needs attention</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Log Detail Dialog Component
const LogDetailDialog = ({ log, onClose }) => {
  const [activeTab, setActiveTab] = useState('content')

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>
            ID: {log.id} | Type: {log.type} | {format(new Date(log.timestamp), 'PPpp')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {log.type === 'prompt' && (
              <div className="space-y-2">
                <Label>Prompt</Label>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    {log.prompt}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(log.prompt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {log.type === 'response' && (
              <div className="space-y-2">
                <Label>Response</Label>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    {log.response}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(log.response)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {log.type === 'interaction' && (
              <div className="space-y-4">
                <div>
                  <Label>Action</Label>
                  <p className="text-lg font-semibold">{log.action}</p>
                </div>
                {log.feedback && (
                  <div>
                    <Label>Feedback</Label>
                    <p>{log.feedback}</p>
                  </div>
                )}
                {log.rating && (
                  <div>
                    <Label>Rating</Label>
                    <p>{log.rating}/5</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Session ID</Label>
                <p className="font-mono text-sm">{log.sessionId}</p>
              </div>
              <div>
                <Label>User ID</Label>
                <p>{log.userId}</p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(log.status)}>
                  {log.status || 'N/A'}
                </Badge>
              </div>
              {log.model && (
                <div>
                  <Label>Model</Label>
                  <p>{log.model}</p>
                </div>
              )}
            </div>

            {log.metadata && (
              <div>
                <Label>Additional Metadata</Label>
                <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}

            {log.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{log.error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {log.metrics && (
              <div className="grid gap-4 md:grid-cols-2">
                {log.metrics.latency && (
                  <div>
                    <Label>Latency</Label>
                    <p className="text-lg font-semibold">{log.metrics.latency}ms</p>
                  </div>
                )}
                {log.metrics.tokenCount && (
                  <div>
                    <Label>Token Count</Label>
                    <p className="text-lg font-semibold">{log.metrics.tokenCount}</p>
                  </div>
                )}
                {log.metrics.cost && (
                  <div>
                    <Label>Cost</Label>
                    <div className="space-y-1">
                      <p>Prompt: ${log.metrics.cost.prompt.toFixed(4)}</p>
                      <p>Completion: ${log.metrics.cost.completion.toFixed(4)}</p>
                      <p className="font-semibold">
                        Total: ${log.metrics.cost.total.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {log.metadata && (
              <div className="space-y-2">
                {log.metadata.totalTokens && (
                  <div>
                    <Label>Token Usage</Label>
                    <div className="space-y-1">
                      <p>Prompt Tokens: {log.metadata.promptTokens || 0}</p>
                      <p>Completion Tokens: {log.metadata.completionTokens || 0}</p>
                      <p className="font-semibold">Total: {log.metadata.totalTokens}</p>
                    </div>
                  </div>
                )}
                {log.metadata.completionTime && (
                  <div>
                    <Label>Completion Time</Label>
                    <p>{log.metadata.completionTime}ms</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Configuration Panel Component
const ConfigurationPanel = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState(config)

  const handleSave = () => {
    onUpdate(localConfig)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Max Queue Size</Label>
          <Input
            type="number"
            value={localConfig.maxQueueSize}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, maxQueueSize: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Flush Interval (ms)</Label>
          <Input
            type="number"
            value={localConfig.flushInterval}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, flushInterval: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>Max Log Age (days)</Label>
          <Input
            type="number"
            value={localConfig.maxLogAge / (24 * 60 * 60 * 1000)}
            onChange={(e) =>
              setLocalConfig({
                ...localConfig,
                maxLogAge: parseInt(e.target.value) * 24 * 60 * 60 * 1000,
              })
            }
          />
        </div>
        <div>
          <Label>Retention Policy</Label>
          <Select
            value={localConfig.retentionPolicy}
            onValueChange={(value) =>
              setLocalConfig({ ...localConfig, retentionPolicy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rolling">Rolling</SelectItem>
              <SelectItem value="archive">Archive</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="compression"
            checked={localConfig.enableCompression}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, enableCompression: e.target.checked })
            }
          />
          <Label htmlFor="compression">Enable Compression</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="encryption"
            checked={localConfig.enableEncryption}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, enableEncryption: e.target.checked })
            }
          />
          <Label htmlFor="encryption">Enable Encryption</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="analytics"
            checked={localConfig.enableAnalytics}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, enableAnalytics: e.target.checked })
            }
          />
          <Label htmlFor="analytics">Enable Analytics</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="privacy"
            checked={localConfig.privacyMode}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, privacyMode: e.target.checked })
            }
          />
          <Label htmlFor="privacy">Privacy Mode (Redact PII)</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setLocalConfig(config)}>
          Reset
        </Button>
        <Button onClick={handleSave}>Save Configuration</Button>
      </div>
    </div>
  )
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export default PromptLogDashboard