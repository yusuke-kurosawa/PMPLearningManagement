/**
 * Offline Study Mode Component
 * Advanced PWA feature for complete offline learning experience
 */

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { usePWA } from '../providers/PWAProvider'
import {
  Download,
  Wifi,
  WifiOff,
  BookOpen,
  Brain,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Smartphone,
  Battery,
  HardDrive,
  Trash2,
  Settings,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react'

interface OfflineContent {
  id: string
  name: string
  type: 'pmbok' | 'exam' | 'glossary' | 'flashcards'
  size: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  lastAccessed?: Date
}

interface OfflineStudyStats {
  totalContent: number
  downloadedContent: number
  availableOffline: number
  storageUsed: number
  storageAvailable: number
  lastSync: Date | null
}

const OfflineStudyMode: React.FC = () => {
  const { toast } = useToast()
  const { isOnline, getStorageUsage, syncWhenOnline, capabilities } = usePWA()

  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([])
  const [studyStats, setStudyStats] = useState<OfflineStudyStats>({
    totalContent: 0,
    downloadedContent: 0,
    availableOffline: 0,
    storageUsed: 0,
    storageAvailable: 0,
    lastSync: null,
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [selectedContent, setSelectedContent] = useState<string[]>([])
  const [offlineMode, setOfflineMode] = useState(!isOnline)

  useEffect(() => {
    initializeOfflineStudy()
    setupServiceWorkerListener()
    updateStorageStats()
  }, [])

  useEffect(() => {
    setOfflineMode(!isOnline)
  }, [isOnline])

  const initializeOfflineStudy = async () => {
    const content: OfflineContent[] = [
      {
        id: 'pmbok-processes',
        name: 'PMBOK 49 Processes',
        type: 'pmbok',
        size: 2.5 * 1024 * 1024, // 2.5MB
        priority: 'high',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'itto-mappings',
        name: 'ITTO Mappings',
        type: 'pmbok',
        size: 1.8 * 1024 * 1024,
        priority: 'high',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'exam-fundamentals',
        name: 'Fundamental Exam Questions',
        type: 'exam',
        size: 3.2 * 1024 * 1024,
        priority: 'medium',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'exam-practice',
        name: 'Practice Exam Sets',
        type: 'exam',
        size: 8.5 * 1024 * 1024,
        priority: 'medium',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'glossary-basic',
        name: 'PMP Glossary (Basic)',
        type: 'glossary',
        size: 0.8 * 1024 * 1024,
        priority: 'high',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'glossary-extended',
        name: 'Extended Glossary',
        type: 'glossary',
        size: 1.5 * 1024 * 1024,
        priority: 'low',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'flashcards-core',
        name: 'Core Flashcards',
        type: 'flashcards',
        size: 1.2 * 1024 * 1024,
        priority: 'medium',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'flashcards-advanced',
        name: 'Advanced Flashcards',
        type: 'flashcards',
        size: 2.1 * 1024 * 1024,
        priority: 'low',
        status: 'pending',
        progress: 0,
      },
    ]

    // Check what's already downloaded
    const downloadedContent = await getDownloadedContent()
    const updatedContent = content.map((item) => {
      const downloaded = downloadedContent.find((d) => d.id === item.id)
      return downloaded ? { ...item, ...downloaded } : item
    })

    setOfflineContent(updatedContent)
    updateStats(updatedContent)
  }

  const getDownloadedContent = async (): Promise<OfflineContent[]> => {
    // In real implementation, this would check IndexedDB
    try {
      const stored = localStorage.getItem('offline-content-status')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const updateStats = (content: OfflineContent[]) => {
    const stats = content.reduce(
      (acc, item) => ({
        totalContent: acc.totalContent + 1,
        downloadedContent: acc.downloadedContent + (item.status === 'completed' ? 1 : 0),
        availableOffline: acc.availableOffline + (item.status === 'completed' ? item.size : 0),
        storageUsed: acc.storageUsed + (item.status === 'completed' ? item.size : 0),
      }),
      {
        totalContent: 0,
        downloadedContent: 0,
        availableOffline: 0,
        storageUsed: 0,
        storageAvailable: 100 * 1024 * 1024, // 100MB available
        lastSync: studyStats.lastSync,
      }
    )

    setStudyStats(stats)
  }

  const setupServiceWorkerListener = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    }
  }

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case 'PROGRESSIVE_CACHE_UPDATE':
        updateDownloadProgress(data.results)
        break
      case 'OFFLINE_STATUS':
        updateOfflineStatus(data)
        break
      case 'SYNC_COMPLETE':
        handleSyncComplete(data)
        break
    }
  }

  const updateDownloadProgress = (results: any[]) => {
    setOfflineContent((prev) =>
      prev.map((item) => {
        const result = results.find((r) => r.url.includes(item.id))
        if (result) {
          return {
            ...item,
            status:
              result.status === 'cached'
                ? 'completed'
                : result.status === 'error'
                  ? 'error'
                  : 'downloading',
            progress: result.status === 'cached' ? 100 : item.progress,
          }
        }
        return item
      })
    )
  }

  const updateOfflineStatus = (status: any) => {
    setStudyStats((prev) => ({
      ...prev,
      storageUsed: status.offlineContentCount * 1024 * 1024, // Estimate
      lastSync: status.timestamp ? new Date(status.timestamp) : null,
    }))
  }

  const handleSyncComplete = (data: any) => {
    toast({
      title: 'Sync Complete',
      description: `${data.itemCount} items synchronized successfully`,
    })
  }

  const updateStorageStats = async () => {
    if (capabilities.hasStorageQuota) {
      const usage = await getStorageUsage()
      if (usage) {
        setStudyStats((prev) => ({
          ...prev,
          storageUsed: usage.usage || 0,
          storageAvailable: usage.quota || 0,
        }))
      }
    }
  }

  const downloadContent = async (contentIds: string[]) => {
    if (!isOnline) {
      toast({
        title: 'Offline Mode',
        description: 'Please connect to the internet to download content',
        variant: 'destructive',
      })
      return
    }

    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const contentToDownload = offlineContent.filter((c) => contentIds.includes(c.id))
      const totalSize = contentToDownload.reduce((sum, c) => sum + c.size, 0)
      let downloadedSize = 0

      // Update status to downloading
      setOfflineContent((prev) =>
        prev.map((item) =>
          contentIds.includes(item.id)
            ? { ...item, status: 'downloading' as const, progress: 0 }
            : item
        )
      )

      // Simulate progressive download
      for (const content of contentToDownload) {
        // Send message to service worker to cache specific URLs
        const urls = getUrlsForContent(content.id)

        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          registration.active?.postMessage({
            type: 'PRIORITIZE_CONTENT',
            urls,
            priority: content.priority,
          })
        }

        // Simulate download progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))

          setOfflineContent((prev) =>
            prev.map((item) => (item.id === content.id ? { ...item, progress: i } : item))
          )

          downloadedSize += content.size * 0.1
          setDownloadProgress((downloadedSize / totalSize) * 100)
        }

        // Mark as completed
        setOfflineContent((prev) =>
          prev.map((item) =>
            item.id === content.id ? { ...item, status: 'completed' as const, progress: 100 } : item
          )
        )
      }

      // Store in localStorage for persistence
      const updatedContent = offlineContent.map((item) =>
        contentIds.includes(item.id)
          ? { ...item, status: 'completed' as const, progress: 100 }
          : item
      )

      localStorage.setItem('offline-content-status', JSON.stringify(updatedContent))
      updateStats(updatedContent)

      toast({
        title: 'Download Complete',
        description: `${contentIds.length} content packages downloaded successfully`,
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: 'Download Failed',
        description: 'Some content failed to download. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const getUrlsForContent = (contentId: string): string[] => {
    const urlMap: Record<string, string[]> = {
      'pmbok-processes': ['/data/pmbok/processes.json', '/data/pmbok/process-groups.json'],
      'itto-mappings': ['/data/pmbok/itto.json', '/data/pmbok/itto-detailed.json'],
      'exam-fundamentals': ['/data/exam-questions/fundamentals.json'],
      'exam-practice': [
        '/data/exam-questions/practice-set-1.json',
        '/data/exam-questions/practice-set-2.json',
      ],
      'glossary-basic': ['/data/glossary.json'],
      'glossary-extended': ['/data/glossary-extended.json'],
      'flashcards-core': ['/data/flashcards/core.json'],
      'flashcards-advanced': ['/data/flashcards/advanced.json'],
    }

    return urlMap[contentId] || []
  }

  const downloadSelectedContent = () => {
    if (selectedContent.length === 0) {
      toast({
        title: 'No Content Selected',
        description: 'Please select content to download',
      })
      return
    }

    downloadContent(selectedContent)
  }

  const downloadEssentials = () => {
    const essentials = offlineContent
      .filter((c) => c.priority === 'high' && c.status !== 'completed')
      .map((c) => c.id)

    downloadContent(essentials)
  }

  const clearOfflineContent = async () => {
    try {
      localStorage.removeItem('offline-content-status')

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        registration.active?.postMessage({
          type: 'CLEAR_OFFLINE_CACHE',
          cacheType: 'all',
        })
      }

      setOfflineContent((prev) =>
        prev.map((item) => ({
          ...item,
          status: 'pending' as const,
          progress: 0,
        }))
      )

      toast({
        title: 'Content Cleared',
        description: 'All offline content has been removed',
      })
    } catch (error) {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear offline content',
        variant: 'destructive',
      })
    }
  }

  const syncOfflineData = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.active?.postMessage({
        type: 'SYNC_OFFLINE_DATA',
      })

      toast({
        title: 'Sync Started',
        description: 'Your offline data is being synchronized',
      })
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B'
    }
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getContentIcon = (type: OfflineContent['type']) => {
    switch (type) {
      case 'pmbok':
        return BookOpen
      case 'exam':
        return Target
      case 'glossary':
        return Database
      case 'flashcards':
        return Brain
      default:
        return BookOpen
    }
  }

  const getStatusColor = (status: OfflineContent['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'downloading':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: OfflineContent['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle
      case 'downloading':
        return RefreshCw
      case 'error':
        return AlertCircle
      default:
        return Clock
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 dark:bg-gray-900'>
      <div className='mx-auto max-w-6xl space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Offline Study Mode</h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              Download content for complete offline learning experience
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Badge
              variant={offlineMode ? 'destructive' : 'default'}
              className='flex items-center gap-1'
            >
              {offlineMode ? <WifiOff className='h-3 w-3' /> : <Wifi className='h-3 w-3' />}
              {offlineMode ? 'Offline' : 'Online'}
            </Badge>

            {capabilities.hasStorageQuota && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                <HardDrive className='h-3 w-3' />
                {formatBytes(studyStats.storageUsed)} used
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900'>
                <Download className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {studyStats.downloadedContent}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  of {studyStats.totalContent} downloaded
                </div>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2 dark:bg-green-900'>
                <Database className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {formatBytes(studyStats.availableOffline)}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>available offline</div>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-purple-100 p-2 dark:bg-purple-900'>
                <Smartphone className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {Math.round((studyStats.storageUsed / studyStats.storageAvailable) * 100)}%
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>storage used</div>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-orange-100 p-2 dark:bg-orange-900'>
                <Clock className='h-5 w-5 text-orange-600 dark:text-orange-400' />
              </div>
              <div>
                <div className='text-sm font-bold text-gray-900 dark:text-white'>
                  {studyStats.lastSync ? studyStats.lastSync.toLocaleDateString() : 'Never'}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>last sync</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Download Progress */}
        {isDownloading && (
          <Card className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Downloading Content...
                </h3>
                <Badge variant='outline'>{Math.round(downloadProgress)}%</Badge>
              </div>
              <Progress value={downloadProgress} className='h-2' />
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Preparing content for offline use. This may take a few minutes.
              </p>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className='flex flex-wrap gap-3'>
          <Button
            onClick={downloadEssentials}
            disabled={isDownloading || !isOnline}
            className='flex items-center gap-2'
          >
            <Download className='h-4 w-4' />
            Download Essentials
          </Button>

          <Button
            variant='outline'
            onClick={downloadSelectedContent}
            disabled={isDownloading || !isOnline || selectedContent.length === 0}
            className='flex items-center gap-2'
          >
            <Play className='h-4 w-4' />
            Download Selected ({selectedContent.length})
          </Button>

          <Button
            variant='outline'
            onClick={syncOfflineData}
            disabled={!isOnline}
            className='flex items-center gap-2'
          >
            <RefreshCw className='h-4 w-4' />
            Sync Data
          </Button>

          <Button
            variant='outline'
            onClick={clearOfflineContent}
            className='flex items-center gap-2'
          >
            <Trash2 className='h-4 w-4' />
            Clear All
          </Button>
        </div>

        {/* Content List */}
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Study Content
          </h3>

          <div className='space-y-3'>
            {offlineContent.map((content) => {
              const ContentIcon = getContentIcon(content.type)
              const StatusIcon = getStatusIcon(content.status)

              return (
                <div
                  key={content.id}
                  className={`
                    flex items-center gap-4 rounded-lg border p-4
                    ${
                      selectedContent.includes(content.id)
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    }
                    cursor-pointer transition-colors
                  `}
                  onClick={() => {
                    if (content.status === 'pending') {
                      setSelectedContent((prev) =>
                        prev.includes(content.id)
                          ? prev.filter((id) => id !== content.id)
                          : [...prev, content.id]
                      )
                    }
                  }}
                >
                  <input
                    type='checkbox'
                    checked={selectedContent.includes(content.id)}
                    onChange={() => {}}
                    disabled={content.status !== 'pending'}
                    className='h-4 w-4'
                  />

                  <div className='flex flex-1 items-center gap-3'>
                    <div className='rounded-lg bg-gray-100 p-2 dark:bg-gray-700'>
                      <ContentIcon className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                    </div>

                    <div className='flex-1'>
                      <div className='font-medium text-gray-900 dark:text-white'>
                        {content.name}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        {formatBytes(content.size)} • Priority: {content.priority}
                      </div>

                      {content.status === 'downloading' && (
                        <div className='mt-2'>
                          <Progress value={content.progress} className='h-1' />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={content.priority === 'high' ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {content.priority}
                    </Badge>

                    <StatusIcon
                      className={`h-5 w-5 ${getStatusColor(content.status)} ${
                        content.status === 'downloading' ? 'animate-spin' : ''
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Offline Study Tips */}
        <Card className='p-6'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Offline Study Tips
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <div className='flex items-start gap-3'>
                <Battery className='mt-1 h-5 w-5 text-green-600' />
                <div>
                  <h4 className='font-medium text-gray-900 dark:text-white'>
                    Battery Optimization
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Enable battery saver mode for longer study sessions
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Database className='mt-1 h-5 w-5 text-blue-600' />
                <div>
                  <h4 className='font-medium text-gray-900 dark:text-white'>Smart Caching</h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Most accessed content is automatically prioritized
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-start gap-3'>
                <RefreshCw className='mt-1 h-5 w-5 text-purple-600' />
                <div>
                  <h4 className='font-medium text-gray-900 dark:text-white'>Auto Sync</h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Progress syncs automatically when connected
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <Settings className='mt-1 h-5 w-5 text-orange-600' />
                <div>
                  <h4 className='font-medium text-gray-900 dark:text-white'>Background Updates</h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Content updates happen in the background
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OfflineStudyMode
