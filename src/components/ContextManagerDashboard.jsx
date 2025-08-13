/**
 * Context Manager Dashboard
 * Visual monitoring interface for context management system
 */

import React, { useState, useEffect } from 'react'
import { useContextMonitoring } from '../contexts/ContextManagerContext'
import {
  Activity,
  Database,
  Gauge,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const ContextManagerDashboard = ({ isOpen = false, onClose }) => {
  const { getStats, getMonitoringData, getPerformanceMetrics, getDiagnostics, setRotationPolicy } =
    useContextMonitoring()

  const [stats, setStats] = useState(null)
  const [monitoring, setMonitoring] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds

  // Auto-refresh data
  useEffect(() => {
    if (!isOpen) return

    const updateData = () => {
      setStats(getStats())
      setMonitoring(getMonitoringData())
      setPerformance(getPerformanceMetrics())
    }

    updateData()
    const interval = setInterval(updateData, refreshInterval)

    return () => clearInterval(interval)
  }, [isOpen, refreshInterval, getStats, getMonitoringData, getPerformanceMetrics])

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const _formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (value) => {
    return (value * 100).toFixed(1) + '%'
  }

  const handlePolicyChange = (policy) => {
    setRotationPolicy(policy)
  }

  const handleRunDiagnostics = () => {
    const diagnostics = getDiagnostics()
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔍 Context Diagnostics:', diagnostics)
    }
    alert('Diagnostics completed. Check console for details.')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Context Manager Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* System Status */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Health</span>
                {getHealthStatusIcon(monitoring?.status)}
              </div>
              <div className="mt-2 text-2xl font-bold capitalize">
                {monitoring?.status || 'Unknown'}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rotation Policy</span>
                <Settings className="h-5 w-5 text-gray-500" />
              </div>
              <div className="mt-2 text-2xl font-bold capitalize">
                {monitoring?.policy || 'Normal'}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                <Gauge className="h-5 w-5 text-gray-500" />
              </div>
              <div className="mt-2 text-2xl font-bold">
                {formatPercentage(stats?.cacheHitRate || 0)}
              </div>
            </div>
          </div>

          {/* Context Statistics */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
              <Database className="mr-2 h-5 w-5" />
              Context Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.totalEntries || 0}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.totalSizeKB || 0} KB
                </div>
                <div className="text-sm text-gray-600">Cache Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(stats?.compressionRatio || 0)}
                </div>
                <div className="text-sm text-gray-600">Compression</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.averageAccessCount || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Access</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
              <Activity className="mr-2 h-5 w-5" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Memory Usage</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Used:</span>
                    <span className="font-mono text-sm">{performance?.memory?.usedMB || 0} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total:</span>
                    <span className="font-mono text-sm">
                      {performance?.memory?.totalMB || 0} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Limit:</span>
                    <span className="font-mono text-sm">
                      {performance?.memory?.limitMB || 0} MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Cache Performance</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Lazy Load Cache:</span>
                    <span className="font-mono text-sm">
                      {performance?.cache?.lazyLoadCacheSize || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hit Rate:</span>
                    <span className="font-mono text-sm">
                      {formatPercentage(monitoring?.metrics?.cacheHitRate || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Retrieval:</span>
                    <span className="font-mono text-sm">
                      {(monitoring?.metrics?.avgRetrievalTime || 0).toFixed(2)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 flex items-center text-lg font-semibold">
              <Settings className="mr-2 h-5 w-5" />
              Controls
            </h3>

            <div className="space-y-4">
              {/* Rotation Policy */}
              <div>
                <label className="mb-2 block text-sm font-medium">Rotation Policy</label>
                <div className="flex space-x-2">
                  {['aggressive', 'normal', 'conservative'].map((policy) => (
                    <button
                      key={policy}
                      onClick={() => handlePolicyChange(policy)}
                      className={`rounded px-3 py-1 text-sm font-medium ${
                        monitoring?.policy === policy
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {policy.charAt(0).toUpperCase() + policy.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <label className="mb-2 block text-sm font-medium">Refresh Interval</label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="rounded border border-gray-300 px-3 py-1 text-sm"
                >
                  <option value={1000}>1 second</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleRunDiagnostics}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Run Diagnostics
                </button>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Last Cleanup:</span>
                <span className="font-mono">
                  {monitoring?.lastCleanup
                    ? new Date(monitoring.lastCleanup).toLocaleString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next Cleanup:</span>
                <span className="font-mono">
                  {monitoring?.nextCleanup
                    ? new Date(monitoring.nextCleanup).toLocaleString()
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContextManagerDashboard
