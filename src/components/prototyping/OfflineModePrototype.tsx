/**
 * Offline Mode Prototype
 * PWAオフライン機能のUX改善プロトタイプ
 *
 * 主な機能:
 * - オフライン/オンライン状態の可視化
 * - 同期ステータスの表示
 * - キャッシュ管理インターフェース
 * - オフライン利用可能機能の通知
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  HardDrive,
  Clock,
  Database,
  Activity,
} from 'lucide-react'

interface CachedContent {
  id: string
  name: string
  type: 'content' | 'data' | 'media'
  size: number
  lastUpdated: string
  isAvailableOffline: boolean
}

interface SyncQueueItem {
  id: string
  action: string
  timestamp: string
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  retryCount: number
}

const OfflineModePrototype: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle')
  const [showOfflineNotification, setShowOfflineNotification] = useState(false)
  const [cacheUsage, setCacheUsage] = useState({ used: 45, total: 250 })

  const [cachedContent] = useState<CachedContent[]>([
    {
      id: '1',
      name: 'PMBOK知識エリア',
      type: 'content',
      size: 12.5,
      lastUpdated: '2025-09-28 09:30',
      isAvailableOffline: true,
    },
    {
      id: '2',
      name: 'フラッシュカード',
      type: 'data',
      size: 8.2,
      lastUpdated: '2025-09-28 10:15',
      isAvailableOffline: true,
    },
    {
      id: '3',
      name: '学習進捗データ',
      type: 'data',
      size: 2.1,
      lastUpdated: '2025-09-28 11:00',
      isAvailableOffline: true,
    },
    {
      id: '4',
      name: '視覚化アセット',
      type: 'media',
      size: 15.8,
      lastUpdated: '2025-09-27 14:20',
      isAvailableOffline: true,
    },
    {
      id: '5',
      name: 'AI学習プラン',
      type: 'data',
      size: 6.4,
      lastUpdated: '2025-09-28 08:00',
      isAvailableOffline: false,
    },
  ])

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([
    {
      id: '1',
      action: '学習進捗データ (5件)',
      timestamp: '2025-09-28 11:05',
      status: 'pending',
      retryCount: 0,
    },
    {
      id: '2',
      action: 'フラッシュカード評価 (12件)',
      timestamp: '2025-09-28 11:03',
      status: 'pending',
      retryCount: 0,
    },
    {
      id: '3',
      action: '模擬試験結果 (1件)',
      timestamp: '2025-09-28 10:45',
      status: 'pending',
      retryCount: 0,
    },
  ])

  // オンライン/オフライン切り替えシミュレーション
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)
    if (!isOnline) {
      // オフライン→オンライン: 自動同期開始
      startSync()
    } else {
      // オンライン→オフライン: 通知表示
      setShowOfflineNotification(true)
      setTimeout(() => setShowOfflineNotification(false), 5000)
    }
  }

  // 同期処理シミュレーション
  const startSync = () => {
    setSyncStatus('syncing')

    // 順次同期処理
    let completed = 0
    const interval = setInterval(() => {
      completed++
      setSyncQueue((prev) =>
        prev.map((item, index) =>
          index < completed ? { ...item, status: 'completed' as const } : item
        )
      )

      if (completed >= syncQueue.length) {
        clearInterval(interval)
        setSyncStatus('completed')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    }, 1500)
  }

  // オフライン利用可能な機能リスト
  const offlineFeatures = [
    { name: 'PMBOK知識エリア閲覧', available: true },
    { name: 'フラッシュカード学習', available: true },
    { name: '学習進捗記録', available: true },
    { name: 'オフライン模擬試験', available: true },
    { name: 'AIコーチング', available: false },
    { name: 'リアルタイムランキング', available: false },
    { name: 'コミュニティ投稿', available: false },
  ]

  useEffect(() => {
    // ブラウザのオンライン/オフラインイベント監視（実際の実装）
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getConnectionBadge = () => {
    if (isOnline) {
      return (
        <Badge className='bg-green-500'>
          <Wifi className='mr-1 h-3 w-3' />
          オンライン
        </Badge>
      )
    }
    return (
      <Badge variant='destructive'>
        <WifiOff className='mr-1 h-3 w-3' />
        オフライン
      </Badge>
    )
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className='h-5 w-5 animate-spin text-blue-500' />
      case 'completed':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />
      default:
        return <Cloud className='h-5 w-5 text-gray-400' />
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-6xl space-y-6'>
        {/* ヘッダー */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              PWAオフラインモード
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              ネットワーク接続なしでも学習を継続できます
            </p>
          </div>
          {getConnectionBadge()}
        </div>

        {/* オフライン通知 */}
        {showOfflineNotification && !isOnline && (
          <Alert className='border-orange-500 bg-orange-50 dark:bg-orange-900/20'>
            <AlertCircle className='h-4 w-4 text-orange-500' />
            <AlertTitle className='text-orange-900 dark:text-orange-100'>
              オフラインモードに切り替わりました
            </AlertTitle>
            <AlertDescription className='text-orange-700 dark:text-orange-200'>
              インターネット接続なしで学習を続けられます。
              保存済みコンテンツとデータは引き続き利用可能です。 次回接続時に自動的に同期されます。
            </AlertDescription>
          </Alert>
        )}

        {/* 同期完了通知 */}
        {syncStatus === 'completed' && (
          <Alert className='border-green-500 bg-green-50 dark:bg-green-900/20'>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
            <AlertTitle className='text-green-900 dark:text-green-100'>
              同期が完了しました
            </AlertTitle>
            <AlertDescription className='text-green-700 dark:text-green-200'>
              オフライン中のデータがすべてクラウドに保存されました。
            </AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* 接続ステータス */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>接続ステータス</span>
                {isOnline ? (
                  <Wifi className='h-6 w-6 text-green-500' />
                ) : (
                  <WifiOff className='h-6 w-6 text-red-500' />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Activity className='h-5 w-5 text-blue-500' />
                    <span className='font-medium text-gray-900 dark:text-white'>現在の状態</span>
                  </div>
                  <Badge variant={isOnline ? 'default' : 'secondary'}>
                    {isOnline ? 'オンライン' : 'オフライン'}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>最終同期</span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {syncStatus === 'completed' ? '今' : '2分前'}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>同期待ちアイテム</span>
                    <span className='font-medium text-gray-900 dark:text-white'>
                      {syncQueue.filter((item) => item.status === 'pending').length}件
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-300'>オフライン対応率</span>
                    <span className='font-medium text-green-600'>85%</span>
                  </div>
                </div>
              </div>

              <Button onClick={toggleOnlineStatus} variant='outline' className='w-full'>
                {isOnline ? (
                  <>
                    <CloudOff className='mr-2 h-4 w-4' />
                    オフライン状態をシミュレート
                  </>
                ) : (
                  <>
                    <Cloud className='mr-2 h-4 w-4' />
                    オンライン状態に戻す
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* キャッシュ使用状況 */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>キャッシュ使用状況</span>
                <HardDrive className='h-6 w-6 text-purple-500' />
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='mb-2 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-300'>使用容量</span>
                  <span className='font-medium text-gray-900 dark:text-white'>
                    {cacheUsage.used}MB / {cacheUsage.total}MB
                  </span>
                </div>
                <Progress value={(cacheUsage.used / cacheUsage.total) * 100} className='h-2' />
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div className='rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20'>
                  <div className='text-xs text-gray-600 dark:text-gray-300'>コンテンツ</div>
                  <div className='text-lg font-bold text-blue-600'>12.5MB</div>
                </div>
                <div className='rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20'>
                  <div className='text-xs text-gray-600 dark:text-gray-300'>データ</div>
                  <div className='text-lg font-bold text-green-600'>16.7MB</div>
                </div>
                <div className='rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/20'>
                  <div className='text-xs text-gray-600 dark:text-gray-300'>メディア</div>
                  <div className='text-lg font-bold text-purple-600'>15.8MB</div>
                </div>
              </div>

              <Button variant='outline' className='w-full' size='sm'>
                <Trash2 className='mr-2 h-4 w-4' />
                キャッシュをクリア
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 同期キュー */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center'>
                {getSyncStatusIcon()}
                <span className='ml-2'>同期キュー</span>
              </div>
              {isOnline && syncStatus === 'idle' && (
                <Button size='sm' onClick={startSync}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  今すぐ同期
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {syncQueue.length > 0 ? (
              <div className='space-y-2'>
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700'
                  >
                    <div className='flex items-center space-x-3'>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className='h-5 w-5 text-green-500' />
                      ) : item.status === 'syncing' ? (
                        <RefreshCw className='h-5 w-5 animate-spin text-blue-500' />
                      ) : (
                        <Clock className='h-5 w-5 text-gray-400' />
                      )}
                      <div>
                        <div className='font-medium text-gray-900 dark:text-white'>
                          {item.action}
                        </div>
                        <div className='text-xs text-gray-500'>{item.timestamp}</div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === 'completed'
                          ? 'default'
                          : item.status === 'syncing'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {item.status === 'completed'
                        ? '完了'
                        : item.status === 'syncing'
                          ? '同期中'
                          : '待機中'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center text-gray-500'>同期待ちのアイテムはありません</div>
            )}
          </CardContent>
        </Card>

        {/* オフライン利用可能機能 */}
        <Card>
          <CardHeader>
            <CardTitle>オフライン利用可能な機能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {offlineFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    feature.available
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      feature.available
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {feature.name}
                  </span>
                  {feature.available ? (
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                  ) : (
                    <AlertCircle className='h-5 w-5 text-gray-400' />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* キャッシュ済みコンテンツ */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center'>
                <Database className='mr-2 h-5 w-5 text-blue-500' />
                キャッシュ済みコンテンツ
              </div>
              <Button variant='outline' size='sm'>
                <Download className='mr-2 h-4 w-4' />
                すべてダウンロード
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {cachedContent.map((content) => (
                <div
                  key={content.id}
                  className='flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700'
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`rounded-full p-2 ${
                        content.isAvailableOffline
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {content.isAvailableOffline ? (
                        <CheckCircle2 className='h-4 w-4 text-green-600' />
                      ) : (
                        <Download className='h-4 w-4 text-gray-400' />
                      )}
                    </div>
                    <div>
                      <div className='font-medium text-gray-900 dark:text-white'>
                        {content.name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {content.size}MB • 更新: {content.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <Badge variant='outline'>{content.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* プロトタイプ情報 */}
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
          <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>プロトタイプ情報</h3>
          <p className='text-sm text-blue-700 dark:text-blue-200'>
            このプロトタイプは、PWAオフライン機能のUX改善を検証するためのものです。
            実際の実装では、Service Worker、Cache API、IndexedDBを使用して
            完全なオフライン対応を実現します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default OfflineModePrototype
