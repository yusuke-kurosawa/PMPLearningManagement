/**
 * データ移行ダッシュボードコンポーネント
 * @description LocalStorageからSupabaseへのデータ移行を管理するUIコンポーネント
 * @author Claude Code Actions
 * @version 1.0.0
 * @since 2025-08-17
 */

import React, { useState, useEffect } from 'react'
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  Clock,
  HardDrive,
  Wifi,
  WifiOff,
  Play,
  Pause,
  X,
} from 'lucide-react'
import { useProgressV2 } from '../../hooks/useProgressV2'
import { logger } from '../../services/logger'

// ========================================
// 型定義
// ========================================

interface MigrationSettings {
  includeProcessProgress: boolean
  includeStudySessions: boolean
  includeFlashCardSessions: boolean
  includeExamResults: boolean
  includeLearningGoals: boolean
  createBackup: boolean
  batchSize: number
}

interface DataMigrationDashboardProps {
  isOpen: boolean
  onClose: () => void
}

// ========================================
// メインコンポーネント
// ========================================

const DataMigrationDashboard: React.FC<DataMigrationDashboardProps> = ({ isOpen, onClose }) => {
  // ========================================
  // フック・状態管理
  // ========================================

  const {
    isAuthenticated,
    syncStatus,
    migrationStatus,
    migrateToSupabase,
    checkMigrationFeasibility,
    syncData,
    forcSync,
  } = useProgressV2({
    enableMigration: true,
    autoSync: true,
  })

  const [migrationSettings, setMigrationSettings] = useState<MigrationSettings>({
    includeProcessProgress: true,
    includeStudySessions: true,
    includeFlashCardSessions: true,
    includeExamResults: true,
    includeLearningGoals: true,
    createBackup: true,
    batchSize: 10,
  })

  const [feasibilityCheck, setFeasibilityCheck] = useState<{
    canMigrate: boolean
    issues: string[]
    dataSize: number
    recordCount: number
  } | null>(null)

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [isCheckingFeasibility, setIsCheckingFeasibility] = useState(false)

  // ========================================
  // エフェクト
  // ========================================

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      handleCheckFeasibility()
    }
  }, [isOpen, isAuthenticated])

  // ========================================
  // イベントハンドラー
  // ========================================

  const handleCheckFeasibility = async () => {
    setIsCheckingFeasibility(true)
    try {
      const result = await checkMigrationFeasibility()
      setFeasibilityCheck(result)
    } catch (error) {
      logger.error('Failed to check migration feasibility:', error)
    } finally {
      setIsCheckingFeasibility(false)
    }
  }

  const handleStartMigration = async () => {
    if (!feasibilityCheck?.canMigrate) {
      return
    }

    try {
      const success = await migrateToSupabase()
      if (success) {
        logger.info('Migration completed successfully')
      } else {
        logger.error('Migration failed')
      }
    } catch (error) {
      logger.error('Migration error:', error)
    }
  }

  const handleSyncData = async () => {
    try {
      await syncData()
    } catch (error) {
      logger.error('Sync failed:', error)
    }
  }

  const handleForceSync = async () => {
    try {
      await forcSync()
    } catch (error) {
      logger.error('Force sync failed:', error)
    }
  }

  const handleSettingChange = (key: keyof MigrationSettings, value: boolean | number) => {
    setMigrationSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // ========================================
  // ユーティリティ関数
  // ========================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes'
    }
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatProgress = (progress: number, total: number): string => {
    if (total === 0) {
      return '0%'
    }
    return `${Math.round((progress / total) * 100)}%`
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className='h-5 w-5 text-green-500' />
    ) : (
      <XCircle className='h-5 w-5 text-red-500' />
    )
  }

  // ========================================
  // レンダリング
  // ========================================

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl'>
        {/* ヘッダー */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <Database className='h-6 w-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>データ移行ダッシュボード</h2>
          </div>
          <button onClick={onClose} className='rounded-lg p-2 transition-colors hover:bg-gray-100'>
            <X className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        {/* コンテンツ */}
        <div className='max-h-[calc(90vh-80px)] overflow-y-auto p-6'>
          {/* 認証状態チェック */}
          {!isAuthenticated && (
            <div className='mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-yellow-600' />
                <span className='text-sm font-medium text-yellow-800'>
                  データ移行には認証が必要です
                </span>
              </div>
              <p className='mt-1 text-sm text-yellow-700'>
                アカウントにログインしてからデータ移行を実行してください。
              </p>
            </div>
          )}

          {/* 現在の状態 */}
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {/* 認証状態 */}
            <div className='rounded-lg bg-gray-50 p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <Shield className='h-5 w-5 text-gray-600' />
                <span className='text-sm font-medium text-gray-700'>認証状態</span>
              </div>
              <div className='flex items-center gap-2'>
                {getStatusIcon(isAuthenticated)}
                <span className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '認証済み' : '未認証'}
                </span>
              </div>
            </div>

            {/* オンライン状態 */}
            <div className='rounded-lg bg-gray-50 p-4'>
              <div className='mb-2 flex items-center gap-2'>
                {syncStatus.isOnline ? (
                  <Wifi className='h-5 w-5 text-gray-600' />
                ) : (
                  <WifiOff className='h-5 w-5 text-gray-600' />
                )}
                <span className='text-sm font-medium text-gray-700'>接続状態</span>
              </div>
              <div className='flex items-center gap-2'>
                {getStatusIcon(syncStatus.isOnline)}
                <span
                  className={`text-sm ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}
                >
                  {syncStatus.isOnline ? 'オンライン' : 'オフライン'}
                </span>
              </div>
            </div>

            {/* 同期状態 */}
            <div className='rounded-lg bg-gray-50 p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <RefreshCw
                  className={`h-5 w-5 text-gray-600 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
                />
                <span className='text-sm font-medium text-gray-700'>同期状態</span>
              </div>
              <div className='text-xs text-gray-600'>
                <div>保留中: {syncStatus.pendingChanges}件</div>
                {syncStatus.lastSyncTime && (
                  <div>最終同期: {new Date(syncStatus.lastSyncTime).toLocaleString('ja-JP')}</div>
                )}
              </div>
            </div>
          </div>

          {/* 移行実行可能性チェック */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>移行実行可能性チェック</h3>
              <button
                onClick={handleCheckFeasibility}
                disabled={isCheckingFeasibility || !isAuthenticated}
                className='flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingFeasibility ? 'animate-spin' : ''}`} />
                <span className='text-sm'>{isCheckingFeasibility ? '確認中...' : '再確認'}</span>
              </button>
            </div>

            {feasibilityCheck && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  {getStatusIcon(feasibilityCheck.canMigrate)}
                  <span
                    className={`font-medium ${feasibilityCheck.canMigrate ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {feasibilityCheck.canMigrate ? '移行実行可能' : '移行実行不可'}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-gray-600'>データサイズ:</span>
                    <span className='ml-2 font-medium'>
                      {formatBytes(feasibilityCheck.dataSize)}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>レコード数:</span>
                    <span className='ml-2 font-medium'>
                      {feasibilityCheck.recordCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {feasibilityCheck.issues.length > 0 && (
                  <div className='mt-3'>
                    <span className='text-sm font-medium text-gray-700'>問題:</span>
                    <ul className='mt-1 list-inside list-disc text-sm text-gray-600'>
                      {feasibilityCheck.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 移行進捗 */}
          {migrationStatus.isRunning && (
            <div className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <RefreshCw className='h-5 w-5 animate-spin text-blue-600' />
                <span className='font-medium text-blue-900'>移行実行中...</span>
              </div>

              <div className='space-y-2'>
                <div className='text-sm text-blue-800'>{migrationStatus.step}</div>

                <div className='h-2 w-full rounded-full bg-blue-200'>
                  <div
                    className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                    style={{
                      width: formatProgress(migrationStatus.progress, migrationStatus.total),
                    }}
                  />
                </div>

                <div className='text-xs text-blue-700'>
                  {migrationStatus.progress} / {migrationStatus.total} 完了 (
                  {formatProgress(migrationStatus.progress, migrationStatus.total)})
                </div>
              </div>

              {migrationStatus.errors.length > 0 && (
                <div className='mt-3'>
                  <span className='text-sm font-medium text-red-700'>エラー:</span>
                  <ul className='mt-1 list-inside list-disc text-sm text-red-600'>
                    {migrationStatus.errors.slice(-3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 移行設定 */}
          <div className='mb-6 rounded-lg border border-gray-200 bg-white p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-gray-900'>移行設定</h3>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700'
              >
                <Settings className='h-4 w-4' />
                {showAdvancedSettings ? '簡単設定' : '詳細設定'}
              </button>
            </div>

            <div className='space-y-3'>
              {/* 基本設定 */}
              <div className='grid grid-cols-2 gap-3'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={migrationSettings.includeProcessProgress}
                    onChange={(e) =>
                      handleSettingChange('includeProcessProgress', e.target.checked)
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>プロセス進捗</span>
                </label>

                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={migrationSettings.includeStudySessions}
                    onChange={(e) => handleSettingChange('includeStudySessions', e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>学習セッション</span>
                </label>

                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={migrationSettings.includeFlashCardSessions}
                    onChange={(e) =>
                      handleSettingChange('includeFlashCardSessions', e.target.checked)
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>フラッシュカード</span>
                </label>

                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={migrationSettings.includeExamResults}
                    onChange={(e) => handleSettingChange('includeExamResults', e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>模擬試験結果</span>
                </label>
              </div>

              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={migrationSettings.createBackup}
                  onChange={(e) => handleSettingChange('createBackup', e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700'>移行前にバックアップを作成</span>
              </label>

              {/* 詳細設定 */}
              {showAdvancedSettings && (
                <div className='mt-4 border-t border-gray-200 pt-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='-input'
                        className='mb-1 block text-sm font-medium text-gray-700'
                      >
                        バッチサイズ
                      </label>
                      <input
                        id='-input'
                        type='number'
                        min='1'
                        max='50'
                        value={migrationSettings.batchSize}
                        onChange={(e) => handleSettingChange('batchSize', parseInt(e.target.value))}
                        className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500'
                      />
                      <p className='mt-1 text-xs text-gray-500'>一度に処理するレコード数（1-50）</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className='flex flex-col gap-3 sm:flex-row'>
            {/* 移行実行 */}
            <button
              onClick={handleStartMigration}
              disabled={
                !isAuthenticated ||
                !syncStatus.isOnline ||
                !feasibilityCheck?.canMigrate ||
                migrationStatus.isRunning
              }
              className='flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Upload className='h-5 w-5' />
              <span>Supabaseに移行</span>
            </button>

            {/* 同期実行 */}
            <button
              onClick={handleSyncData}
              disabled={!isAuthenticated || !syncStatus.isOnline || syncStatus.isSyncing}
              className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <RefreshCw className={`h-5 w-5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              <span>データ同期</span>
            </button>

            {/* 強制同期 */}
            <button
              onClick={handleForceSync}
              disabled={!isAuthenticated || !syncStatus.isOnline}
              className='flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Play className='h-5 w-5' />
              <span>強制同期</span>
            </button>
          </div>

          {/* 注意事項 */}
          <div className='mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
            <div className='flex items-start gap-2'>
              <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600' />
              <div className='text-sm text-yellow-800'>
                <div className='mb-1 font-medium'>注意事項</div>
                <ul className='list-inside list-disc space-y-1'>
                  <li>移行処理は時間がかかる場合があります</li>
                  <li>移行中はブラウザを閉じないでください</li>
                  <li>移行前に必ずバックアップを取ることをお勧めします</li>
                  <li>移行完了後、ローカルデータは自動的には削除されません</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataMigrationDashboard
