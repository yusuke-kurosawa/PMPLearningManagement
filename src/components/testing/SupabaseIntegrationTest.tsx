/**
 * Supabase統合テストコンポーネント
 * @description 学習進捗のSupabase統合機能をテストするためのコンポーネント
 * @author Claude Code Actions
 * @version 1.0.0
 * @since 2025-08-17
 */

import React, { useState } from 'react'
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Users,
  FileText,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { useProgressV2 } from '../../hooks/useProgressV2'
import { logger } from '../../services/logger'

// ========================================
// 型定義
// ========================================

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  duration?: number
}

interface TestSuite {
  name: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'completed'
}

// ========================================
// メインコンポーネント
// ========================================

const SupabaseIntegrationTest = () => {
  const {
    isAuthenticated,
    syncStatus,
    getProcessProgress,
    updateProcessProgress,
    recordStudySession,
    recordFlashCardSession,
    recordExamResult,
    getFlashCardStats,
    getExamStats,
    syncData,
    migrateToSupabase,
    checkMigrationFeasibility,
  } = useProgressV2({
    enableMigration: true,
    autoSync: false, // テスト中は自動同期を無効化
  })

  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: '基本機能テスト',
      status: 'pending',
      tests: [
        { name: '認証状態確認', status: 'pending', message: '' },
        { name: '同期状態確認', status: 'pending', message: '' },
        { name: 'プロセス進捗取得', status: 'pending', message: '' },
        { name: 'プロセス進捗更新', status: 'pending', message: '' },
      ],
    },
    {
      name: 'データ記録テスト',
      status: 'pending',
      tests: [
        { name: '学習セッション記録', status: 'pending', message: '' },
        { name: 'フラッシュカードセッション記録', status: 'pending', message: '' },
        { name: '模擬試験結果記録', status: 'pending', message: '' },
      ],
    },
    {
      name: '統計取得テスト',
      status: 'pending',
      tests: [
        { name: 'フラッシュカード統計取得', status: 'pending', message: '' },
        { name: '模擬試験統計取得', status: 'pending', message: '' },
      ],
    },
    {
      name: '同期・移行テスト',
      status: 'pending',
      tests: [
        { name: 'データ同期実行', status: 'pending', message: '' },
        { name: '移行実行可能性チェック', status: 'pending', message: '' },
      ],
    },
  ])

  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null)

  // ========================================
  // テスト実行関数
  // ========================================

  const updateTestResult = (
    suiteName: string,
    testName: string,
    status: TestResult['status'],
    message: string,
    duration?: number
  ) => {
    setTestSuites((prev) =>
      prev.map((suite) =>
        suite.name === suiteName
          ? {
              ...suite,
              tests: suite.tests.map((test) =>
                test.name === testName ? { ...test, status, message, duration } : test
              ),
            }
          : suite
      )
    )
  }

  const updateSuiteStatus = (suiteName: string, status: TestSuite['status']) => {
    setTestSuites((prev) =>
      prev.map((suite) => (suite.name === suiteName ? { ...suite, status } : suite))
    )
  }

  const runTest = async (
    suiteName: string,
    testName: string,
    testFunction: () => Promise<{ success: boolean; message: string }>
  ) => {
    const startTime = Date.now()
    updateTestResult(suiteName, testName, 'running', 'テスト実行中...')

    try {
      const result = await testFunction()
      const duration = Date.now() - startTime

      updateTestResult(
        suiteName,
        testName,
        result.success ? 'success' : 'error',
        result.message,
        duration
      )

      return result.success
    } catch (error) {
      const duration = Date.now() - startTime
      updateTestResult(
        suiteName,
        testName,
        'error',
        `エラー: ${(error as Error).message}`,
        duration
      )
      return false
    }
  }

  // ========================================
  // 個別テスト関数
  // ========================================

  const testAuthentication = async () => {
    return {
      success: true,
      message: `認証状態: ${isAuthenticated ? '認証済み' : '未認証'}`,
    }
  }

  const testSyncStatus = async () => {
    return {
      success: true,
      message: `オンライン: ${syncStatus.isOnline}, 保留中: ${syncStatus.pendingChanges}件`,
    }
  }

  const testGetProcessProgress = async () => {
    const progress = await getProcessProgress('p1')
    return {
      success: progress !== null,
      message: progress
        ? `プロセス進捗取得成功: 完了=${progress.completed}, 理解度=${progress.understanding}`
        : 'プロセス進捗取得失敗',
    }
  }

  const testUpdateProcessProgress = async () => {
    const success = await updateProcessProgress('p1', {
      completed: true,
      understanding: 85,
      notes: 'テスト更新',
    })
    return {
      success,
      message: success ? 'プロセス進捗更新成功' : 'プロセス進捗更新失敗',
    }
  }

  const testRecordStudySession = async () => {
    const success = await recordStudySession({
      date: new Date().toISOString(),
      duration: 30,
      processCount: 1,
      type: 'reading',
      focusArea: 'integration',
    })
    return {
      success,
      message: success ? '学習セッション記録成功' : '学習セッション記録失敗',
    }
  }

  const testRecordFlashCardSession = async () => {
    const success = await recordFlashCardSession({
      totalCards: 10,
      correctAnswers: 8,
      duration: 15,
      sessionType: 'itto',
      targetArea: 'integration',
    })
    return {
      success,
      message: success
        ? 'フラッシュカードセッション記録成功'
        : 'フラッシュカードセッション記録失敗',
    }
  }

  const testRecordExamResult = async () => {
    const success = await recordExamResult({
      timestamp: new Date().toISOString(),
      examType: 'quick',
      passed: true,
      results: {
        score: 75,
        correct: 15,
        total: 20,
        domainScores: { integration: 80, scope: 70 },
        timeSpent: 45,
      },
    })
    return {
      success,
      message: success ? '模擬試験結果記録成功' : '模擬試験結果記録失敗',
    }
  }

  const testGetFlashCardStats = async () => {
    const stats = await getFlashCardStats()
    return {
      success: stats !== null,
      message: stats
        ? `フラッシュカード統計取得成功: セッション数=${stats.totalSessions}, 正解率=${stats.averageAccuracy}%`
        : 'フラッシュカード統計取得失敗',
    }
  }

  const testGetExamStats = async () => {
    const stats = await getExamStats()
    return {
      success: stats !== null,
      message: stats
        ? `模擬試験統計取得成功: 受験回数=${stats.totalExams}, 平均点=${stats.averageScore}`
        : '模擬試験統計取得失敗',
    }
  }

  const testSyncData = async () => {
    const success = await syncData()
    return {
      success,
      message: success ? 'データ同期成功' : 'データ同期失敗',
    }
  }

  const testMigrationFeasibility = async () => {
    const result = await checkMigrationFeasibility()
    return {
      success: true,
      message: `移行可能: ${result.canMigrate}, データサイズ: ${Math.round(result.dataSize / 1024)}KB, レコード数: ${result.recordCount}`,
    }
  }

  // ========================================
  // テストスイート実行
  // ========================================

  const runTestSuite = async (suiteName: string) => {
    updateSuiteStatus(suiteName, 'running')

    const testMappings: Record<
      string,
      Record<string, () => Promise<{ success: boolean; message: string }>>
    > = {
      基本機能テスト: {
        認証状態確認: testAuthentication,
        同期状態確認: testSyncStatus,
        プロセス進捗取得: testGetProcessProgress,
        プロセス進捗更新: testUpdateProcessProgress,
      },
      データ記録テスト: {
        学習セッション記録: testRecordStudySession,
        フラッシュカードセッション記録: testRecordFlashCardSession,
        模擬試験結果記録: testRecordExamResult,
      },
      統計取得テスト: {
        フラッシュカード統計取得: testGetFlashCardStats,
        模擬試験統計取得: testGetExamStats,
      },
      '同期・移行テスト': {
        データ同期実行: testSyncData,
        移行実行可能性チェック: testMigrationFeasibility,
      },
    }

    const tests = testMappings[suiteName] || {}
    let allPassed = true

    for (const [testName, testFunction] of Object.entries(tests)) {
      const passed = await runTest(suiteName, testName, testFunction)
      if (!passed) {
        allPassed = false
      }
      // テスト間で少し待機
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    updateSuiteStatus(suiteName, 'completed')
    return allPassed
  }

  const runAllTests = async () => {
    setIsRunningTests(true)

    try {
      for (const suite of testSuites) {
        await runTestSuite(suite.name)
      }
      logger.info('All tests completed')
    } catch (error) {
      logger.error('Test execution failed:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  // ========================================
  // ユーティリティ関数
  // ========================================

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />
      case 'running':
        return <RefreshCw className='h-4 w-4 animate-spin text-blue-500' />
      default:
        return <AlertTriangle className='h-4 w-4 text-gray-400' />
    }
  }

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case '基本機能テスト':
        return <Database className='h-5 w-5' />
      case 'データ記録テスト':
        return <FileText className='h-5 w-5' />
      case '統計取得テスト':
        return <BarChart3 className='h-5 w-5' />
      case '同期・移行テスト':
        return <Users className='h-5 w-5' />
      default:
        return <Play className='h-5 w-5' />
    }
  }

  // ========================================
  // レンダリング
  // ========================================

  return (
    <div className='mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg'>
      <div className='mb-6'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>Supabase統合テスト</h1>
        <p className='text-gray-600'>学習進捗管理のSupabase統合機能をテストします</p>
      </div>

      {/* 実行ボタン */}
      <div className='mb-6 flex gap-4'>
        <button
          onClick={runAllTests}
          disabled={isRunningTests}
          className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <Play className='h-4 w-4' />
          全テスト実行
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <span>認証状態:</span>
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? '認証済み' : '未認証'}
          </span>
        </div>
      </div>

      {/* テストスイート一覧 */}
      <div className='space-y-4'>
        {testSuites.map((suite) => (
          <div key={suite.name} className='rounded-lg border border-gray-200'>
            <div
              className='flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50'
              onClick={() => setSelectedSuite(selectedSuite === suite.name ? null : suite.name)}
            >
              <div className='flex items-center gap-3'>
                {getSuiteIcon(suite.name)}
                <span className='font-medium text-gray-900'>{suite.name}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    suite.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : suite.status === 'running'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {suite.status === 'pending'
                    ? '待機中'
                    : suite.status === 'running'
                      ? '実行中'
                      : '完了'}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  runTestSuite(suite.name)
                }}
                disabled={suite.status === 'running' || isRunningTests}
                className='rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              >
                実行
              </button>
            </div>

            {selectedSuite === suite.name && (
              <div className='space-y-3 border-t border-gray-200 p-4'>
                {suite.tests.map((test) => (
                  <div key={test.name} className='flex items-center gap-3 py-2'>
                    {getStatusIcon(test.status)}
                    <div className='flex-1'>
                      <div className='text-sm font-medium text-gray-900'>{test.name}</div>
                      <div className='text-xs text-gray-600'>
                        {test.message}
                        {test.duration && ` (${test.duration}ms)`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* システム情報 */}
      <div className='mt-8 rounded-lg bg-gray-50 p-4'>
        <h3 className='mb-2 font-medium text-gray-900'>システム情報</h3>
        <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
          <div>
            <div>認証状態: {isAuthenticated ? '認証済み' : '未認証'}</div>
            <div>オンライン状態: {syncStatus.isOnline ? 'オンライン' : 'オフライン'}</div>
          </div>
          <div>
            <div>保留中の変更: {syncStatus.pendingChanges}件</div>
            <div>同期中: {syncStatus.isSyncing ? 'はい' : 'いいえ'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupabaseIntegrationTest
