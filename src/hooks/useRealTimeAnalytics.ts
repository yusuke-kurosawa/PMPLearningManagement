/**
 * Real-time Analytics Hook
 * Manages WebSocket connections, real-time metrics, and alert system
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from './use-toast'

export interface RealTimeMetrics {
  activeUsers: number
  completionRate: number
  engagementScore: number
  performanceTrend: 'improving' | 'declining' | 'stable'
  totalStudyTime: number
  newAchievements: number
  atRiskStudents: number
  systemHealth: number
  timestamp: Date
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  dismissed: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'engagement' | 'performance' | 'system' | 'achievement' | 'risk'
  actionUrl?: string
}

export interface AnalyticsEvent {
  type: string
  data: any
  timestamp: Date
}

interface UseRealTimeAnalyticsOptions {
  enableReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

interface UseRealTimeAnalyticsReturn {
  metrics: RealTimeMetrics | null
  alerts: Alert[]
  events: AnalyticsEvent[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connectionAttempts: number
  lastUpdate: Date | null
  connect: () => void
  disconnect: () => void
  subscribeToMetric: (metric: string, callback: (data: any) => void) => () => void
  unsubscribeFromMetric: (metric: string) => void
  dismissAlert: (alertId: string) => void
  clearAlerts: () => void
  sendAnalyticsEvent: (event: AnalyticsEvent) => void
}

export const useRealTimeAnalytics = (
  options: UseRealTimeAnalyticsOptions = {}
): UseRealTimeAnalyticsReturn => {
  const {
    enableReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
  } = options

  const { toast } = useToast()

  // WebSocket and connection state
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  // State
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Mock WebSocket URL - in production, this would come from environment variables
  const getWebSocketUrl = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      // Mock WebSocket for development
      return null
    }
    return process.env.REACT_APP_WS_URL || 'ws://localhost:8080/analytics'
  }, [])

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'metrics_update':
            setMetrics({
              ...data.payload,
              timestamp: new Date(data.timestamp),
            })
            setLastUpdate(new Date())
            break

          case 'alert':
            const newAlert: Alert = {
              ...data.payload,
              timestamp: new Date(data.timestamp),
              dismissed: false,
            }
            setAlerts((prev) => [newAlert, ...prev.slice(0, 99)]) // Keep max 100 alerts

            // Show toast notification for high priority alerts
            if (newAlert.priority === 'high' || newAlert.priority === 'critical') {
              toast({
                title: newAlert.title,
                description: newAlert.message,
                variant: newAlert.type === 'error' ? 'destructive' : 'default',
              })
            }
            break

          case 'event':
            const analyticsEvent: AnalyticsEvent = {
              ...data.payload,
              timestamp: new Date(data.timestamp),
            }
            setEvents((prev) => [analyticsEvent, ...prev.slice(0, 499)]) // Keep max 500 events
            break

          case 'subscription_data':
            const { metric, payload } = data
            const callbacks = subscriptionsRef.current.get(metric)
            if (callbacks) {
              callbacks.forEach((callback) => callback(payload))
            }
            break

          case 'pong':
            // Heartbeat response - connection is alive
            break

          default:
            console.warn('Unknown WebSocket message type:', data.type)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    },
    [toast]
  )

  // WebSocket connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsLoading(true)
    setError(null)

    const wsUrl = getWebSocketUrl()

    // Mock data for development
    if (!wsUrl) {
      setIsLoading(false)
      setIsConnected(true)

      // Generate mock data
      const generateMockMetrics = () => ({
        activeUsers: Math.floor(Math.random() * 100) + 20,
        completionRate: Math.floor(Math.random() * 40) + 60,
        engagementScore: Math.floor(Math.random() * 30) + 70,
        performanceTrend: ['improving', 'declining', 'stable'][
          Math.floor(Math.random() * 3)
        ] as const,
        totalStudyTime: Math.floor(Math.random() * 10000) + 5000,
        newAchievements: Math.floor(Math.random() * 10),
        atRiskStudents: Math.floor(Math.random() * 15),
        systemHealth: Math.floor(Math.random() * 10) + 90,
        timestamp: new Date(),
      })

      setMetrics(generateMockMetrics())
      setLastUpdate(new Date())

      // Mock periodic updates
      const mockInterval = setInterval(() => {
        setMetrics(generateMockMetrics())
        setLastUpdate(new Date())

        // Occasionally generate mock alerts
        if (Math.random() < 0.1) {
          const mockAlert: Alert = {
            id: crypto.randomUUID(),
            type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as const,
            title: ['System Update', 'Performance Alert', 'New Achievement'][
              Math.floor(Math.random() * 3)
            ],
            message: 'Mock alert for development testing',
            timestamp: new Date(),
            dismissed: false,
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const,
            category: ['system', 'performance', 'achievement'][
              Math.floor(Math.random() * 3)
            ] as const,
          }
          setAlerts((prev) => [mockAlert, ...prev.slice(0, 99)])
        }
      }, 15000)

      return () => {
        clearInterval(mockInterval)
        setIsConnected(false)
      }
    }

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsLoading(false)
        setError(null)
        setConnectionAttempts(0)

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, heartbeatInterval)

        toast({
          title: 'Connected',
          description: 'Real-time analytics connected successfully.',
        })
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        setIsConnected(false)
        setIsLoading(false)

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }

        if (enableReconnect && connectionAttempts < maxReconnectAttempts && !event.wasClean) {
          setConnectionAttempts((prev) => prev + 1)
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection error')
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setIsLoading(false)
    }
  }, [
    getWebSocketUrl,
    handleMessage,
    enableReconnect,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    heartbeatInterval,
    toast,
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionAttempts(0)
  }, [])

  // Metric subscriptions
  const subscribeToMetric = useCallback((metric: string, callback: (data: any) => void) => {
    if (!subscriptionsRef.current.has(metric)) {
      subscriptionsRef.current.set(metric, new Set())
    }

    subscriptionsRef.current.get(metric)!.add(callback)

    // Send subscription request to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          metric,
        })
      )
    }

    // Return unsubscribe function
    return () => {
      const callbacks = subscriptionsRef.current.get(metric)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(metric)

          // Send unsubscribe request to server
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'unsubscribe',
                metric,
              })
            )
          }
        }
      }
    }
  }, [])

  const unsubscribeFromMetric = useCallback((metric: string) => {
    subscriptionsRef.current.delete(metric)

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          metric,
        })
      )
    }
  }, [])

  // Alert management
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert))
    )
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Event sending
  const sendAnalyticsEvent = useCallback((event: AnalyticsEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'analytics_event',
          payload: event,
        })
      )
    }

    // Also store locally for offline scenarios
    setEvents((prev) => [event, ...prev.slice(0, 499)])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    metrics,
    alerts: alerts.filter((alert) => !alert.dismissed),
    events,
    isConnected,
    isLoading,
    error,
    connectionAttempts,
    lastUpdate,
    connect,
    disconnect,
    subscribeToMetric,
    unsubscribeFromMetric,
    dismissAlert,
    clearAlerts,
    sendAnalyticsEvent,
  }
}
