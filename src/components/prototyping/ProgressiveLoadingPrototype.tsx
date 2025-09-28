/**
 * Progressive Loading Prototype
 * バンドルサイズ最適化のUX改善プロトタイプ
 *
 * 主な機能:
 * - プログレッシブローディング表示
 * - リアルタイム進捗フィードバック
 * - 部分利用可能状態の通知
 * - パフォーマンスメトリクス表示
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { CheckCircle2, Loader2, Clock, Zap, Download, TrendingUp, AlertCircle } from 'lucide-react'

interface LoadingModule {
  id: string
  name: string
  displayName: string
  size: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'loading' | 'loaded' | 'error'
  progress: number
  estimatedTime: number
  features: string[]
}

interface PerformanceMetrics {
  totalSize: number
  loadedSize: number
  loadTime: number
  estimatedTotal: number
  dataUsage: number
}

const ProgressiveLoadingPrototype: React.FC = () => {
  const [modules, setModules] = useState<LoadingModule[]>([
    {
      id: 'core',
      name: 'core',
      displayName: 'コア機能',
      size: 450,
      priority: 'critical',
      status: 'pending',
      progress: 0,
      estimatedTime: 2,
      features: ['ナビゲーション', '基本UI', 'ルーティング'],
    },
    {
      id: 'pmbok',
      name: 'pmbok',
      displayName: 'PMBOK知識エリア',
      size: 280,
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedTime: 3,
      features: ['プロセス一覧', 'ITTO表示', 'マトリックスビュー'],
    },
    {
      id: 'visualization',
      name: 'visualization',
      displayName: '視覚化機能',
      size: 320,
      priority: 'medium',
      status: 'pending',
      progress: 0,
      estimatedTime: 4,
      features: ['ネットワーク図', 'サンキーダイアグラム', 'ヒートマップ'],
    },
    {
      id: 'learning',
      name: 'learning',
      displayName: '学習機能',
      size: 180,
      priority: 'high',
      status: 'pending',
      progress: 0,
      estimatedTime: 2,
      features: ['フラッシュカード', '進捗トラッキング', '用語集'],
    },
    {
      id: 'ai',
      name: 'ai',
      displayName: 'AI機能',
      size: 220,
      priority: 'low',
      status: 'pending',
      progress: 0,
      estimatedTime: 5,
      features: ['AIコーチング', '個別プラン', 'リアルタイムフィードバック'],
    },
  ])

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalSize: 0,
    loadedSize: 0,
    loadTime: 0,
    estimatedTotal: 16,
    dataUsage: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [canStart, setCanStart] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 総合進捗率を計算
  const overallProgress = React.useMemo(() => {
    const totalWeight = modules.reduce((sum, mod) => sum + mod.size, 0)
    const loadedWeight = modules.reduce((sum, mod) => sum + mod.size * (mod.progress / 100), 0)
    return totalWeight > 0 ? (loadedWeight / totalWeight) * 100 : 0
  }, [modules])

  // クリティカル・ハイプライオリティモジュールの完了チェック
  const criticalModulesLoaded = React.useMemo(() => {
    return modules
      .filter((mod) => mod.priority === 'critical' || mod.priority === 'high')
      .every((mod) => mod.status === 'loaded')
  }, [modules])

  // ロード開始
  const startLoading = () => {
    setIsLoading(true)
    setCanStart(false)

    // プライオリティ順にソート
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 }
    const sortedModules = [...modules].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    // 順次ロード（実際のアプリではパラレルロードも）
    let delay = 0
    sortedModules.forEach((module, index) => {
      setTimeout(() => {
        loadModule(module.id)
      }, delay)
      delay += module.estimatedTime * 500 // シミュレーション用の遅延
    })
  }

  // 個別モジュールのロード
  const loadModule = (moduleId: string) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, status: 'loading' as const } : mod))
    )

    // プログレス更新シミュレーション
    let progress = 0
    const module = modules.find((m) => m.id === moduleId)
    if (!module) {
      return
    }

    const interval = setInterval(() => {
      progress += 10
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === moduleId
            ? {
                ...mod,
                progress,
                status: progress >= 100 ? ('loaded' as const) : ('loading' as const),
              }
            : mod
        )
      )

      // メトリクス更新
      setMetrics((prev) => ({
        ...prev,
        loadedSize: prev.loadedSize + module.size / 10,
        loadTime: prev.loadTime + module.estimatedTime / 10,
        dataUsage: prev.dataUsage + module.size / 10,
      }))

      if (progress >= 100) {
        clearInterval(interval)
      }
    }, module.estimatedTime * 50)
  }

  // クリティカルモジュールがロードされたら「開始可能」状態に
  useEffect(() => {
    if (criticalModulesLoaded && isLoading) {
      setCanStart(true)
    }
  }, [criticalModulesLoaded, isLoading])

  // 全モジュールの総サイズ計算
  useEffect(() => {
    const total = modules.reduce((sum, mod) => sum + mod.size, 0)
    setMetrics((prev) => ({ ...prev, totalSize: total }))
  }, [modules])

  const getStatusIcon = (status: LoadingModule['status']) => {
    switch (status) {
      case 'loaded':
        return <CheckCircle2 className='h-5 w-5 text-green-500' />
      case 'loading':
        return <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
      case 'error':
        return <AlertCircle className='h-5 w-5 text-red-500' />
      default:
        return <Clock className='h-5 w-5 text-gray-400' />
    }
  }

  const getPriorityBadge = (priority: LoadingModule['priority']) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    } as const

    return (
      <Badge variant={variants[priority]} className='text-xs'>
        {priority}
      </Badge>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* ヘッダー */}
        <div className='text-center'>
          <div className='mb-2 flex items-center justify-center'>
            <Zap className='mr-2 h-8 w-8 text-blue-600' />
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              PMP Learning Management
            </h1>
          </div>
          <p className='text-gray-600 dark:text-gray-300'>プログレッシブローディング中...</p>
        </div>

        {/* 総合進捗カード */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>読み込み状況</span>
              <span className='text-2xl font-bold text-blue-600'>
                {Math.round(overallProgress)}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Progress value={overallProgress} className='h-3' />

            {/* パフォーマンスメトリクス */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20'>
                <div className='mb-1 text-xs text-gray-600 dark:text-gray-300'>データ使用量</div>
                <div className='text-lg font-bold text-blue-600'>
                  {Math.round(metrics.loadedSize)} KB
                </div>
                <div className='text-xs text-gray-500'>/ {metrics.totalSize} KB</div>
              </div>

              <div className='rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20'>
                <div className='mb-1 text-xs text-gray-600 dark:text-gray-300'>経過時間</div>
                <div className='text-lg font-bold text-green-600'>
                  {Math.round(metrics.loadTime)}秒
                </div>
                <div className='text-xs text-gray-500'>/ 推定{metrics.estimatedTotal}秒</div>
              </div>

              <div className='rounded-lg bg-purple-50 p-3 text-center dark:bg-purple-900/20'>
                <div className='mb-1 text-xs text-gray-600 dark:text-gray-300'>完了</div>
                <div className='text-lg font-bold text-purple-600'>
                  {modules.filter((m) => m.status === 'loaded').length}
                </div>
                <div className='text-xs text-gray-500'>/ {modules.length} モジュール</div>
              </div>

              <div className='rounded-lg bg-amber-50 p-3 text-center dark:bg-amber-900/20'>
                <div className='mb-1 text-xs text-gray-600 dark:text-gray-300'>読み込み速度</div>
                <div className='text-lg font-bold text-amber-600'>
                  {metrics.loadTime > 0 ? Math.round(metrics.loadedSize / metrics.loadTime) : 0}{' '}
                  KB/s
                </div>
                <div className='text-xs text-gray-500'>平均</div>
              </div>
            </div>

            {/* 早期アクセス通知 */}
            {canStart && overallProgress < 100 && (
              <div className='rounded-lg border-2 border-green-500 bg-green-50 p-4 dark:bg-green-900/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <CheckCircle2 className='mr-3 h-6 w-6 text-green-500' />
                    <div>
                      <h3 className='font-semibold text-green-900 dark:text-green-100'>
                        基本機能は準備完了！
                      </h3>
                      <p className='text-sm text-green-700 dark:text-green-200'>
                        残りの機能は背景でロード中です。今すぐ学習を開始できます。
                      </p>
                    </div>
                  </div>
                  <Button size='sm' className='bg-green-600 hover:bg-green-700'>
                    今すぐ開始
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* モジュール詳細 */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>モジュール詳細</CardTitle>
              <Button variant='ghost' size='sm' onClick={() => setShowDetails(!showDetails)}>
                {showDetails ? '簡易表示' : '詳細表示'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {modules.map((module) => (
                <div
                  key={module.id}
                  className='rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-gray-700'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex flex-1 items-center space-x-3'>
                      {getStatusIcon(module.status)}
                      <div className='flex-1'>
                        <div className='mb-1 flex items-center space-x-2'>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {module.displayName}
                          </span>
                          {getPriorityBadge(module.priority)}
                          <Badge variant='outline' className='text-xs'>
                            {module.size} KB
                          </Badge>
                        </div>

                        <Progress value={module.progress} className='mb-2 h-2' />

                        {showDetails && (
                          <div className='mt-2 space-y-1'>
                            <p className='text-xs text-gray-600 dark:text-gray-300'>
                              含まれる機能:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {module.features.map((feature, idx) => (
                                <Badge key={idx} variant='secondary' className='text-xs'>
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='ml-4 text-right'>
                      <div className='text-sm font-medium text-gray-900 dark:text-white'>
                        {module.progress}%
                      </div>
                      {module.status === 'loading' && (
                        <div className='text-xs text-gray-500'>
                          残り{' '}
                          {Math.ceil((((100 - module.progress) / 10) * module.estimatedTime) / 10)}
                          秒
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* コントロールボタン */}
        {!isLoading && (
          <div className='flex justify-center space-x-4'>
            <Button size='lg' onClick={startLoading} className='bg-blue-600 hover:bg-blue-700'>
              <Download className='mr-2 h-5 w-5' />
              ロード開始
            </Button>
            <Button size='lg' variant='outline'>
              完全ロード待機
            </Button>
          </div>
        )}

        {overallProgress === 100 && (
          <div className='rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6 text-center dark:from-green-900/20 dark:to-blue-900/20'>
            <CheckCircle2 className='mx-auto mb-4 h-12 w-12 text-green-500' />
            <h2 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              すべての機能が利用可能です！
            </h2>
            <p className='mb-4 text-gray-600 dark:text-gray-300'>PMP学習を始めましょう。</p>
            <Button size='lg' className='bg-green-600 hover:bg-green-700'>
              <TrendingUp className='mr-2 h-5 w-5' />
              学習を開始
            </Button>
          </div>
        )}

        {/* 開発者情報 */}
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
          <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>プロトタイプ情報</h3>
          <p className='text-sm text-blue-700 dark:text-blue-200'>
            このプロトタイプは、バンドルサイズ最適化のUX改善を検証するためのものです。
            実際の実装では、React.lazy()、Suspense、Code Splittingを使用して
            段階的な読み込みを実現します。
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProgressiveLoadingPrototype
