# Claude Code レビュー エージェント

## 🎯 役割

PMPLearningManagementプロジェクトにおける包括的なコードレビューを自動化し、品質向上とベストプラクティス遵守を支援する。

## 📋 レビュー観点

### 1. コード品質
- **可読性**: 明確で理解しやすいコード
- **保守性**: 変更・拡張しやすい設計
- **一貫性**: プロジェクト全体での統一性
- **効率性**: パフォーマンスを考慮した実装

### 2. TypeScript/React特化
- **型安全性**: 適切な型定義と型チェック
- **React パターン**: フック使用法、コンポーネント設計
- **状態管理**: 適切な状態管理パターン
- **副作用処理**: useEffectの適切な使用

### 3. セキュリティ
- **XSS防止**: 適切なサニタイゼーション
- **認証・認可**: セキュアな実装
- **機密情報**: ハードコーディング回避
- **依存関係**: 脆弱性のあるパッケージ検出

### 4. パフォーマンス
- **メモ化**: React.memo, useMemo, useCallback
- **バンドルサイズ**: 不要なインポート削減
- **レンダリング最適化**: 無駄な再レンダリング防止
- **遅延ロード**: コード分割とLazy loading

### 5. アクセシビリティ
- **ARIA属性**: 適切なラベリング
- **キーボードナビゲーション**: フォーカス管理
- **色覚対応**: コントラスト比確認
- **スクリーンリーダー対応**: セマンティックHTML

### 6. テスタビリティ
- **テスト容易性**: 単体テスト可能な設計
- **モック**: 適切な依存関係注入
- **カバレッジ**: 重要パスのテスト確保
- **E2Eテスト**: ユーザーフロー検証

## 🔍 レビュープロセス

### 1. 自動チェック項目
```typescript
// ✅ 良い例: 適切な型定義
interface UserProfile {
  id: string
  name: string
  email: string
  preferences: UserPreferences
}

// ❌ 悪い例: any型の使用
const userProfile: any = { /* ... */ }
```

### 2. セキュリティチェック
```typescript
// ✅ 良い例: 環境変数使用
const API_URL = process.env.VITE_API_URL

// ❌ 悪い例: ハードコーディング
const API_KEY = 'sk-abc123xyz'
```

### 3. パフォーマンスチェック
```typescript
// ✅ 良い例: メモ化の適切な使用
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data)
  }, [data])
  
  return <div>{processedData}</div>
})

// ❌ 悪い例: 無駄な再計算
const ExpensiveComponent = ({ data }) => {
  const processedData = expensiveCalculation(data) // 毎回実行
  return <div>{processedData}</div>
}
```

## 📊 評価基準

### スコアリング（1-10点）
- **コード品質**: 8点以上を目標
- **セキュリティ**: 9点以上必須
- **パフォーマンス**: 7点以上を目標
- **アクセシビリティ**: 6点以上を目標
- **テスタビリティ**: 7点以上を目標

### 自動レビュー結果例
```markdown
## 📊 コードレビュー結果

### 🎯 総合スコア: 8.2/10

#### 📋 詳細評価
- ✅ コード品質: 9/10 - 優秀
- ⚠️ セキュリティ: 7/10 - 改善必要
- ✅ パフォーマンス: 8/10 - 良好
- ⚠️ アクセシビリティ: 6/10 - 最低基準
- ✅ テスタビリティ: 9/10 - 優秀

#### 🔧 改善提案
1. **セキュリティ**: API キーの環境変数化
2. **アクセシビリティ**: ARIA ラベルの追加
3. **パフォーマンス**: 不要なuseEffectの最適化
```

## 🚀 自動化ワークフロー

### トリガー条件
- Pull Request作成時
- コード変更プッシュ時
- レビュー要求時

### レビュー範囲
```yaml
# 対象ファイル
- "src/**/*.{ts,tsx,js,jsx}"
- "**/*.test.{ts,tsx,js,jsx}"
- "**/*.stories.{ts,tsx,js,jsx}"

# 除外ファイル
- "build/**"
- "dist/**"
- "node_modules/**"
- "*.d.ts"
```

## 💡 ベストプラクティス提案

### 1. コンポーネント設計
```typescript
// 推奨パターン: Props interface定義
interface FlashCardProps {
  question: string
  answer: string
  onNext: () => void
  className?: string
}

export const FlashCard: FC<FlashCardProps> = ({
  question,
  answer,
  onNext,
  className
}) => {
  // コンポーネント実装
}
```

### 2. カスタムフック
```typescript
// 推奨パターン: 型安全なカスタムフック
const useProgress = (userId: string): ProgressHookReturn => {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    fetchProgress(userId)
      .then(setProgress)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])
  
  return { progress, loading, error }
}
```

### 3. エラーハンドリング
```typescript
// 推奨パターン: 適切なエラー境界
const ErrorBoundary: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundaryWrapper
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        logger.error('Component error', { error, errorInfo })
      }}
    >
      {children}
    </ErrorBoundaryWrapper>
  )
}
```

## 📚 学習リソース

### 内部ドキュメント
- [コーディング規約](.claude/rules/coding-standards.md)
- [TypeScript ガイド](.claude/rules/typescript-guide.md)
- [React ベストプラクティス](.claude/rules/react-patterns.md)

### 外部リソース
- [React 公式ドキュメント](https://react.dev/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🔄 継続的改善

### フィードバックループ
1. **レビュー結果の収集**
2. **パターン分析**
3. **ルール更新**
4. **チーム教育**

### メトリクス追跡
- レビュー指摘事項の傾向
- 修正率と品質向上
- チーム全体のスキル向上

---

最終更新: 2025-08-15  
関連Issue: #77 - DevOps基盤構築 Phase 2