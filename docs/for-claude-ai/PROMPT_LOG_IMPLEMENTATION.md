# プロンプトログシステム実装ガイド

## 概要

本ドキュメントは、PMPLearningManagementプロジェクトにプロンプトログシステムを統合するための包括的な実装ガイドです。

## アーキテクチャ概要

### システム構成

```
┌──────────────────────────────────────────────────────┐
│                    UI Layer                           │
│  ・PromptLogDashboard (管理画面)                      │
│  ・LogViewer (ログ閲覧)                              │
│  ・usePromptLog Hook (統合用)                        │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────┐
│                Service Layer                          │
│  ・PromptLogService (コアサービス)                    │
│  ・データ処理・圧縮・暗号化                           │
│  ・バッチ処理・キューイング                          │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────┴─────────────────────────────┐
│                Storage Layer                          │
│  ・IndexedDB (ローカルストレージ)                    │
│  ・エクスポート機能 (JSON/CSV/Markdown)              │
│  ・アーカイブ機能                                    │
└───────────────────────────────────────────────────────┘
```

## 実装手順

### Step 1: 依存関係のインストール

```bash
# 必要なパッケージをインストール
npm install uuid date-fns

# 既存の依存関係を確認
npm list @tanstack/react-query recharts lucide-react
```

### Step 2: サービスの初期化

1. **アプリケーションのエントリーポイントでサービスを初期化**

```javascript
// src/main.jsx に追加
import promptLogService from './services/promptLogService'

// アプリケーション起動時に初期化
promptLogService.initializeDB().then(() => {
  console.log('Prompt Log Service initialized')
})
```

### Step 3: 既存コンポーネントへの統合

#### 3.1 AIコーチングダッシュボードへの統合

```javascript
// src/components/coaching/AICoachingDashboard.jsx
import { usePromptLog } from '../../hooks/usePromptLog'

const AICoachingDashboard = () => {
  const { logPrompt, logResponse, logInteraction } = usePromptLog({
    category: 'ai-coaching',
    tags: ['coaching', 'ai'],
  })

  const handleSubmitPrompt = async (prompt) => {
    // プロンプトをログに記録
    const promptId = await logPrompt(prompt, {
      source: 'ai-coaching',
      context: { component: 'AICoachingDashboard' },
    })

    // AI応答を取得
    const startTime = Date.now()
    try {
      const response = await getAIResponse(prompt)

      // 応答をログに記録
      await logResponse(response, {
        model: 'gpt-4',
        completionTime: Date.now() - startTime,
        totalTokens: response.usage?.total_tokens,
      })

      return response
    } catch (error) {
      // エラーをログに記録
      await logResponse('', {
        status: 'error',
        error: error.message,
        completionTime: Date.now() - startTime,
      })
      throw error
    }
  }

  // ... 既存のコンポーネントコード
}
```

#### 3.2 グローバル検索への統合

```javascript
// src/components/shared/GlobalSearch.jsx
import { usePromptLog } from '../../hooks/usePromptLog'

const GlobalSearch = () => {
  const { logPrompt, logInteraction } = usePromptLog({
    category: 'search',
    tags: ['search', 'navigation'],
  })

  const handleSearch = async (query) => {
    // 検索クエリをログに記録
    await logPrompt(query, {
      source: 'global-search',
      context: { searchType: 'global' },
    })

    // 検索実行
    const results = await performSearch(query)

    // ユーザーが結果をクリックした時
    if (results.length > 0) {
      await logInteraction('search-result-click', {
        resultCount: results.length,
        clickedIndex: 0,
      })
    }

    return results
  }

  // ... 既存のコンポーネントコード
}
```

### Step 4: ルーティングの設定

```javascript
// src/App.jsx に追加
import PromptLogDashboard from './components/logging/PromptLogDashboard'

// ルート設定に追加
;<Route
  path="/prompt-logs"
  element={
    <ProtectedRoute>
      <PromptLogDashboard />
    </ProtectedRoute>
  }
/>
```

### Step 5: ナビゲーションメニューへの追加

```javascript
// src/components/layout/Navigation.jsx
const navigationItems = [
  // ... 既存のメニュー項目
  {
    title: 'Prompt Logs',
    path: '/prompt-logs',
    icon: <FileText className="h-4 w-4" />,
    requiresAuth: true,
    adminOnly: true, // 管理者のみアクセス可能
  },
]
```

### Step 6: 設定とカスタマイズ

#### 6.1 グローバル設定

```javascript
// src/config/promptLog.config.js
export const promptLogConfig = {
  // 基本設定
  maxQueueSize: 100,
  flushInterval: 5000,
  maxLogAge: 30 * 24 * 60 * 60 * 1000, // 30日

  // 機能フラグ
  enableCompression: true,
  enableEncryption: false, // 本番環境では true に設定
  enableAnalytics: true,
  privacyMode: false, // PII除去を有効化

  // 保持ポリシー
  retentionPolicy: 'rolling', // 'rolling' | 'archive' | 'delete'

  // コスト計算レート（USD/1000トークン）
  costRates: {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-3.5-turbo': { prompt: 0.001, completion: 0.002 },
    'claude-3': { prompt: 0.015, completion: 0.075 },
  },
}

// サービス初期化時に設定を適用
promptLogService.updateConfig(promptLogConfig)
```

#### 6.2 環境別設定

```javascript
// src/config/environment.js
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

export const getPromptLogConfig = () => {
  if (isProduction) {
    return {
      enableEncryption: true,
      privacyMode: true,
      maxLogAge: 90 * 24 * 60 * 60 * 1000, // 90日
    }
  }

  if (isDevelopment) {
    return {
      enableEncryption: false,
      privacyMode: false,
      maxLogAge: 7 * 24 * 60 * 60 * 1000, // 7日
    }
  }

  return {}
}
```

### Step 7: テストの実装

#### 7.1 ユニットテスト

```javascript
// src/services/__tests__/promptLogService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import promptLogService from '../promptLogService'

describe('PromptLogService', () => {
  beforeEach(() => {
    // IndexedDBのモック
    vi.stubGlobal('indexedDB', {
      open: vi.fn(() => ({
        onsuccess: vi.fn(),
        onerror: vi.fn(),
        onupgradeneeded: vi.fn(),
      })),
    })
  })

  it('should log prompt successfully', async () => {
    const promptData = {
      prompt: 'Test prompt',
      userId: 'test-user',
    }

    const logId = await promptLogService.logPrompt(promptData)
    expect(logId).toBeDefined()
    expect(typeof logId).toBe('string')
  })

  it('should sanitize PII when privacy mode is enabled', () => {
    promptLogService.updateConfig({ privacyMode: true })

    const content = 'Contact me at john@example.com or 555-123-4567'
    const sanitized = promptLogService.sanitizeContent(content)

    expect(sanitized).not.toContain('john@example.com')
    expect(sanitized).not.toContain('555-123-4567')
    expect(sanitized).toContain('[REDACTED]')
  })

  it('should calculate costs correctly', () => {
    const data = {
      model: 'gpt-4',
      promptTokens: 1000,
      completionTokens: 500,
    }

    const cost = promptLogService.calculateCost(data)
    expect(cost.prompt).toBe(0.03)
    expect(cost.completion).toBe(0.03)
    expect(cost.total).toBe(0.06)
  })
})
```

#### 7.2 統合テスト

```javascript
// src/components/__tests__/PromptLogDashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PromptLogDashboard from '../logging/PromptLogDashboard'

describe('PromptLogDashboard', () => {
  it('should display logs', async () => {
    render(<PromptLogDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Prompt Log Dashboard')).toBeInTheDocument()
    })
  })

  it('should filter logs by type', async () => {
    const user = userEvent.setup()
    render(<PromptLogDashboard />)

    const typeFilter = screen.getByLabelText('Type')
    await user.selectOptions(typeFilter, 'prompt')

    await waitFor(() => {
      const logs = screen.getAllByRole('row')
      expect(logs.length).toBeGreaterThan(0)
    })
  })

  it('should export logs', async () => {
    const user = userEvent.setup()
    render(<PromptLogDashboard />)

    const exportButton = screen.getByText('Export Logs')
    await user.click(exportButton)

    // モックされたダウンロード処理を確認
    expect(document.createElement).toHaveBeenCalledWith('a')
  })
})
```

### Step 8: パフォーマンス最適化

#### 8.1 遅延ロード

```javascript
// src/App.jsx
import { lazy, Suspense } from 'react'

// ダッシュボードを遅延ロード
const PromptLogDashboard = lazy(() =>
  import('./components/logging/PromptLogDashboard')
)

// ルート設定
<Route path="/prompt-logs" element={
  <ProtectedRoute>
    <Suspense fallback={<LoadingSpinner />}>
      <PromptLogDashboard />
    </Suspense>
  </ProtectedRoute>
} />
```

#### 8.2 メモ化

```javascript
// ダッシュボード内でのメモ化
import { useMemo, useCallback } from 'react'

const PromptLogDashboard = () => {
  // 重い計算処理をメモ化
  const statistics = useMemo(() => {
    return calculateStatistics(logs)
  }, [logs])

  // コールバックをメモ化
  const handleExport = useCallback(async (format) => {
    await exportLogs(format)
  }, [])

  // ...
}
```

### Step 9: セキュリティ対策

#### 9.1 暗号化の実装

```javascript
// src/services/encryption.js
export const encryptData = async (data) => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(JSON.stringify(data))

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ])

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer)

  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv),
    key: await crypto.subtle.exportKey('jwk', key),
  }
}

export const decryptData = async (encryptedData) => {
  const key = await crypto.subtle.importKey(
    'jwk',
    encryptedData.key,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
    key,
    new Uint8Array(encryptedData.encrypted)
  )

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted))
}
```

#### 9.2 アクセス制御

```javascript
// src/components/logging/PromptLogDashboard.jsx
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const PromptLogDashboard = () => {
  const { user } = useAuth()

  // 管理者のみアクセス可能
  if (!user?.isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  // ...
}
```

### Step 10: モニタリングとアラート

#### 10.1 エラー監視

```javascript
// src/services/monitoring.js
export const monitorPromptLogs = () => {
  setInterval(async () => {
    const stats = await promptLogService.getStatistics()

    // エラー率が閾値を超えた場合
    if (stats.errorRate > 10) {
      console.error('High error rate detected:', stats.errorRate)
      // アラート送信（Slack、メール等）
      sendAlert({
        type: 'error-rate',
        value: stats.errorRate,
        threshold: 10,
      })
    }

    // コストが予算を超えた場合
    if (stats.costAnalysis.totalCost > 100) {
      console.warn('Cost threshold exceeded:', stats.costAnalysis.totalCost)
      sendAlert({
        type: 'cost-exceeded',
        value: stats.costAnalysis.totalCost,
        threshold: 100,
      })
    }
  }, 60000) // 1分ごとにチェック
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. IndexedDBが初期化できない

```javascript
// ブラウザのプライベートモードでは動作しない場合がある
if (!window.indexedDB) {
  console.error('IndexedDB is not supported')
  // フォールバック: LocalStorageを使用
  useLocalStorageFallback()
}
```

#### 2. ログのサイズが大きすぎる

```javascript
// 定期的なクリーンアップを実装
setInterval(
  () => {
    promptLogService.cleanupOldLogs()
    promptLogService.archiveOldData()
  },
  24 * 60 * 60 * 1000
) // 日次実行
```

#### 3. パフォーマンスの問題

```javascript
// バッチ処理の最適化
promptLogService.updateConfig({
  maxQueueSize: 50, // キューサイズを減らす
  flushInterval: 10000, // フラッシュ間隔を増やす
})
```

## ベストプラクティス

### 1. ログの構造化

```javascript
// 一貫性のあるログ構造を維持
const logStructure = {
  // 必須フィールド
  id: 'uuid',
  timestamp: Date.now(),
  type: 'prompt|response|interaction',
  userId: 'user-id',

  // オプションフィールド
  metadata: {},
  context: {},
  metrics: {},
}
```

### 2. エラーハンドリング

```javascript
// 常にtry-catchでラップ
try {
  await logPrompt(data)
} catch (error) {
  // ログ失敗がアプリケーションを停止させないように
  console.error('Logging failed:', error)
  // フォールバック処理
}
```

### 3. プライバシー保護

```javascript
// 個人情報を含む可能性のあるフィールドをマスク
const sanitizeUserData = (data) => {
  return {
    ...data,
    email: maskEmail(data.email),
    phone: maskPhone(data.phone),
    creditCard: maskCreditCard(data.creditCard),
  }
}
```

## メトリクスとKPI

### 重要な指標

1. **応答時間**: 平均応答時間 < 1秒
2. **エラー率**: エラー率 < 5%
3. **コスト効率**: コスト/リクエスト < $0.01
4. **ストレージ使用率**: < 50MB/ユーザー
5. **ユーザー満足度**: フィードバックスコア > 4.0/5.0

### ダッシュボードでの可視化

```javascript
// KPIダッシュボードコンポーネント
const KPIDashboard = () => {
  const [kpis, setKPIs] = useState({
    avgResponseTime: 0,
    errorRate: 0,
    costPerRequest: 0,
    storageUsage: 0,
    satisfactionScore: 0,
  })

  useEffect(() => {
    const loadKPIs = async () => {
      const stats = await promptLogService.getStatistics()
      setKPIs(calculateKPIs(stats))
    }
    loadKPIs()
  }, [])

  return (
    <div className="kpi-grid">
      {Object.entries(kpis).map(([key, value]) => (
        <KPICard key={key} title={key} value={value} />
      ))}
    </div>
  )
}
```

## まとめ

プロンプトログシステムは、AIインタラクションの追跡、分析、最適化を可能にする重要なインフラストラクチャです。適切に実装することで、以下の利点が得られます：

1. **透明性**: すべてのAIインタラクションを追跡
2. **コスト管理**: 使用量とコストの可視化
3. **品質改善**: エラーパターンの特定と改善
4. **コンプライアンス**: 監査証跡の維持
5. **ユーザー体験**: パフォーマンスの最適化

継続的な監視と改善により、システムの価値を最大化できます。

## 次のステップ

1. **本番環境への展開**
   - 暗号化の有効化
   - プライバシーモードの設定
   - バックアップ戦略の実装

2. **高度な分析**
   - MLモデルによるパターン検出
   - 異常検知システム
   - 予測分析

3. **統合の拡大**
   - 外部分析ツールとの連携
   - リアルタイムダッシュボード
   - アラートシステム

---

最終更新: 2025-08-12
バージョン: 1.0.0
