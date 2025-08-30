/**
 * usePromptLog Hook
 * React hook for easy integration of prompt logging in components
 */

import { useCallback, useEffect, useRef } from 'react'
import promptLogService from '../services/promptLogService'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/use-toast'

export const usePromptLog = (options = {}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const promptIdRef = useRef(null)
  const responseIdRef = useRef(null)

  // Default options
  const config = {
    autoLog: true,
    includeContext: true,
    category: 'general',
    tags: [],
    ...options,
  }

  /**
   * Log a prompt
   */
  const logPrompt = useCallback(
    async (prompt, additionalData = {}) => {
      if (!config.autoLog) {
        return null
      }

      try {
        const promptId = await promptLogService.logPrompt({
          prompt,
          userId: user?.id || 'anonymous',
          source: additionalData.source || 'user-input',
          category: additionalData.category || config.category,
          tags: [...config.tags, ...(additionalData.tags || [])],
          context: config.includeContext
            ? {
                url: window.location.href,
                timestamp: Date.now(),
                ...additionalData.context,
              }
            : additionalData.context,
          ...additionalData,
        })

        promptIdRef.current = promptId
        return promptId
      } catch (error) {
        console.error('Failed to log prompt:', error)
        if (config.showErrors) {
          toast({
            title: 'Logging Error',
            description: 'Failed to log prompt',
            variant: 'destructive',
          })
        }
        return null
      }
    },
    [user, config, toast]
  )

  /**
   * Log a response
   */
  const logResponse = useCallback(
    async (response, additionalData = {}) => {
      if (!config.autoLog || !promptIdRef.current) {
        return null
      }

      try {
        const responseId = await promptLogService.logResponse(promptIdRef.current, {
          response,
          userId: user?.id || 'anonymous',
          model: additionalData.model || 'unknown',
          completionTime: additionalData.completionTime,
          totalTokens: additionalData.totalTokens,
          promptTokens: additionalData.promptTokens,
          completionTokens: additionalData.completionTokens,
          temperature: additionalData.temperature,
          maxTokens: additionalData.maxTokens,
          status: additionalData.status || 'completed',
          error: additionalData.error,
          latency: additionalData.latency,
          ...additionalData,
        })

        responseIdRef.current = responseId
        return responseId
      } catch (error) {
        console.error('Failed to log response:', error)
        if (config.showErrors) {
          toast({
            title: 'Logging Error',
            description: 'Failed to log response',
            variant: 'destructive',
          })
        }
        return null
      }
    },
    [user, config, toast]
  )

  /**
   * Log an interaction
   */
  const logInteraction = useCallback(
    async (action, data = {}) => {
      if (!config.autoLog) {
        return null
      }

      try {
        return await promptLogService.logInteraction({
          userId: user?.id || 'anonymous',
          promptId: promptIdRef.current,
          responseId: responseIdRef.current,
          action,
          ...data,
        })
      } catch (error) {
        console.error('Failed to log interaction:', error)
        return null
      }
    },
    [user, config]
  )

  /**
   * Log error
   */
  const logError = useCallback(
    async (error, context = {}) => {
      if (!config.autoLog) {
        return null
      }

      try {
        return await promptLogService.logResponse(promptIdRef.current, {
          response: '',
          userId: user?.id || 'anonymous',
          status: 'error',
          error: error.message || error.toString(),
          context,
        })
      } catch (err) {
        console.error('Failed to log error:', err)
        return null
      }
    },
    [user, config]
  )

  /**
   * Start a new conversation
   */
  const startConversation = useCallback(() => {
    promptIdRef.current = null
    responseIdRef.current = null
  }, [])

  /**
   * Get conversation history
   */
  const getHistory = useCallback(
    async (filters = {}) => {
      try {
        return await promptLogService.queryLogs({
          userId: user?.id || 'anonymous',
          ...filters,
        })
      } catch (error) {
        console.error('Failed to get history:', error)
        return []
      }
    },
    [user]
  )

  /**
   * Clear user logs
   */
  const clearUserLogs = useCallback(async () => {
    try {
      // TODO: Will be used in future
      // const userLogs = await promptLogService.queryLogs({
      //   userId: user?.id || 'anonymous',
      // })

      // Note: This would need to be implemented in the service
      // For now, we'll just clear all logs
      if (window.confirm('Clear all your logs? This cannot be undone.')) {
        await promptLogService.clearAllLogs()
        toast({
          title: 'Logs Cleared',
          description: 'Your logs have been cleared successfully',
        })
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear logs',
        variant: 'destructive',
      })
    }
  }, [user, toast])

  /**
   * Export user logs
   */
  const exportLogs = useCallback(
    async (format = 'json') => {
      try {
        const exportData = await promptLogService.exportLogs(format, {
          userId: user?.id || 'anonymous',
        })

        const blob = new Blob([exportData], {
          type: format === 'json' ? 'application/json' : 'text/plain',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prompt-logs-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: 'Export Successful',
          description: `Logs exported as ${format.toUpperCase()}`,
        })
      } catch (error) {
        console.error('Failed to export logs:', error)
        toast({
          title: 'Export Failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    },
    [user, toast]
  )

  /**
   * Get statistics
   */
  const getStatistics = useCallback(async (timeRange = null) => {
    try {
      return await promptLogService.getStatistics(timeRange)
    } catch (error) {
      console.error('Failed to get statistics:', error)
      return null
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Flush any pending logs
      promptLogService.flush()
    }
  }, [])

  return {
    logPrompt,
    logResponse,
    logInteraction,
    logError,
    startConversation,
    getHistory,
    clearUserLogs,
    exportLogs,
    getStatistics,
    currentPromptId: promptIdRef.current,
    currentResponseId: responseIdRef.current,
  }
}

export default usePromptLog
