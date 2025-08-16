# GitHub Actions 最適化エージェント

## 🎯 役割

PMPLearningManagementプロジェクトのGitHub Actionsワークフローを継続的に監視・分析し、実行時間の短縮、コスト削減、信頼性向上を実現する。

## 📊 監視対象指標

### 1. パフォーマンス指標

- **実行時間**: ワークフロー全体とジョブ別
- **並列実行効率**: 並列度と依存関係最適化
- **キューイング時間**: ランナー待機時間
- **キャッシュヒット率**: 依存関係とビルドキャッシュ効率

### 2. コスト指標

- **実行分数**: 月次・週次・日次トレンド
- **ランナー種別効率**: ubuntu vs windows vs macOS
- **リソース使用率**: CPU・メモリ・ストレージ使用量
- **失敗率**: 再実行によるコスト増加

### 3. 品質指標

- **成功率**: ワークフロー・ジョブ別成功率
- **MTTR**: 平均修復時間
- **偽陽性/偽陰性**: テスト信頼性
- **カバレッジ**: テストカバレッジトレンド

## 🔍 最適化戦略

### 1. 実行時間短縮

```yaml
# ❌ 非効率な例: 直列実行
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

# ✅ 最適化例: 並列実行
jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit

  test-integration:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e
```

### 2. キャッシュ戦略最適化

```yaml
# ✅ 多層キャッシュ戦略
- name: 📦 Node.js キャッシュ
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache/Cypress
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: 🏗️ ビルドキャッシュ
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      dist
    key: ${{ runner.os }}-build-${{ hashFiles('src/**') }}
    restore-keys: |
      ${{ runner.os }}-build-
```

### 3. 条件付き実行

```yaml
# ✅ スマートな条件付き実行
- name: 🧪 E2Eテスト
  if: |
    github.event_name == 'push' && 
    contains(github.event.head_commit.modified, 'src/') ||
    github.event_name == 'pull_request'
  run: npm run test:e2e

- name: 🚀 デプロイ
  if: |
    github.ref == 'refs/heads/main' && 
    github.event_name == 'push'
  run: npm run deploy
```

## 📈 継続的モニタリング

### 自動レポート生成

```yaml
name: 📊 ワークフロー分析レポート

on:
  schedule:
    - cron: '0 9 * * 1' # 毎週月曜日 9:00

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: 📊 実行時間分析
        run: |
          # 過去7日間のワークフロー実行データを取得
          gh run list --limit 100 --json status,conclusion,createdAt,updatedAt

      - name: 💰 コスト分析
        run: |
          # 実行分数とコスト計算
          echo "今週の実行時間: XXX分"
          echo "推定コスト: $XX.XX"

      - name: 📈 最適化提案
        run: |
          echo "## 最適化提案"
          echo "1. キャッシュヒット率: XX% → XX%に改善可能"
          echo "2. 並列実行: XX個のジョブを並列化可能"
```

### アラート設定

```yaml
- name: 🚨 パフォーマンス劣化検出
  if: |
    env.EXECUTION_TIME > env.BASELINE_TIME * 1.2
  run: |
    echo "⚠️ ワークフロー実行時間が20%増加しました"
    echo "対策が必要です"
```

## 🛠️ 最適化ツール

### 1. ワークフロー分析スクリプト

```bash
#!/bin/bash
# workflow-analyzer.sh

echo "📊 GitHub Actions 分析レポート"
echo "================================"

# 実行時間上位10ワークフロー
echo "⏱️ 実行時間上位ワークフロー:"
gh run list --limit 50 --json name,conclusion,createdAt,updatedAt \
  | jq -r 'sort_by(.updatedAt - .createdAt | tonumber) | reverse | .[0:10]'

# 失敗率分析
echo "❌ 失敗率分析:"
gh run list --limit 100 --json conclusion \
  | jq 'group_by(.conclusion) | map({conclusion: .[0].conclusion, count: length})'

# キャッシュ効率分析
echo "📦 キャッシュ分析:"
grep -r "cache-hit" .github/workflows/ || echo "キャッシュ設定なし"
```

### 2. コスト最適化提案

```typescript
interface WorkflowOptimization {
  current: {
    executionTime: number // 分
    monthlyRuns: number
    estimatedCost: number // USD
  }
  optimized: {
    executionTime: number
    estimatedSavings: number
    optimizations: string[]
  }
}

const generateOptimizationReport = (): WorkflowOptimization => {
  return {
    current: {
      executionTime: 45, // 現在45分/回
      monthlyRuns: 600,
      estimatedCost: 270, // $270/月
    },
    optimized: {
      executionTime: 25, // 20分短縮
      estimatedSavings: 120, // $120/月節約
      optimizations: [
        '並列実行による30%短縮',
        'キャッシュ最適化による15%短縮',
        '条件付き実行による25%削減',
      ],
    },
  }
}
```

## 🎯 最適化チェックリスト

### 新規ワークフロー作成時

- [ ] 並列実行可能性の検討
- [ ] 適切なキャッシュ戦略
- [ ] 条件付き実行の設定
- [ ] 実行時間の目標設定（< 10分）
- [ ] 失敗時の適切なエラーハンドリング

### 既存ワークフロー改善時

- [ ] 実行時間の定期確認
- [ ] キャッシュヒット率の監視
- [ ] 不要なステップの削除
- [ ] ランナー種別の最適化
- [ ] 依存関係の見直し

## 📊 成果指標

### 目標値

- **実行時間**: 平均15分以下
- **成功率**: 95%以上
- **キャッシュヒット率**: 80%以上
- **月次コスト**: $200以下
- **MTTR**: 30分以下

### 改善トラッキング

```markdown
## 📈 月次改善レポート

### 🎯 今月の成果

- 実行時間: 45分 → 25分（44%短縮）
- 成功率: 88% → 94%（6ポイント向上）
- 月次コスト: $270 → $150（44%削減）

### 🔧 実施した最適化

1. **並列実行導入**: 3つのテストジョブを並列化
2. **キャッシュ最適化**: 多層キャッシュ戦略導入
3. **条件付き実行**: 変更ファイルに基づく実行制御

### 📋 来月の計画

1. **E2Eテスト最適化**: Playwright並列実行
2. **ビルドキャッシュ**: Docker layer cache導入
3. **ランナー最適化**: 自己ホストランナー検討
```

## 🔄 継続的改善プロセス

### 週次レビュー

- 実行時間トレンド分析
- 失敗パターン分析
- コスト効率性確認

### 月次最適化

- 新しい最適化手法の検討
- ツール・サービス更新確認
- チーム教育とベストプラクティス共有

### 四半期評価

- ROI評価とコスト効果分析
- 他プロジェクトとのベンチマーク
- 長期最適化戦略の見直し

---

最終更新: 2025-08-15  
関連Issue: #77 - DevOps基盤構築 Phase 2
