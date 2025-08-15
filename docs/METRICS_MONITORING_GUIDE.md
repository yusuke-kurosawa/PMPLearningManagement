# 📊 DevOps メトリクス監視ガイド

## 概要

PMPLearningManagementプロジェクトの包括的なメトリクス監視システムの実装ガイドです。

## 🎯 監視目標

### 主要KPI
- **ワークフロー成功率**: 95%以上
- **平均実行時間**: 15分以内
- **リソース使用率**: 80%以下
- **コード品質スコア**: 90点以上

## 📈 実装済みメトリクス

### 1. GitHub Actions メトリクス
```json
{
  "total_runs": 150,
  "success_runs": 142,
  "failed_runs": 8,
  "success_rate": "94.7%",
  "avg_duration_minutes": "8.5"
}
```

### 2. リポジトリメトリクス
```json
{
  "commits_last_30_days": 120,
  "open_issues": 15,
  "open_prs": 5,
  "ts_files": 211,
  "js_files": 0
}
```

### 3. パフォーマンスメトリクス
```json
{
  "build_time_seconds": "45.2",
  "bundle_size_mb": "2.8",
  "lighthouse_score": 95
}
```

### 4. 品質メトリクス
```json
{
  "eslint_errors": 0,
  "eslint_warnings": 27,
  "test_coverage": {
    "lines": 85.2,
    "statements": 84.5,
    "functions": 82.1,
    "branches": 78.3
  }
}
```

## 🔄 ワークフロー

### メトリクス収集ワークフロー
```yaml
# .github/workflows/metrics-monitoring.yml
schedule:
  - cron: '*/30 * * * *'  # 30分ごと
```

### DevOpsダッシュボード
```yaml
# .github/workflows/devops-dashboard.yml
schedule:
  - cron: '0 8 * * *'     # 毎日8:00
  - cron: '0 9 * * 1'     # 週次レポート（月曜9:00）
```

## 🚨 アラート設定

### アラート閾値
| メトリクス | 警告レベル | 危険レベル |
|-----------|-----------|-----------|
| ワークフロー失敗率 | 10% | 20% |
| CPU使用率 | 70% | 80% |
| メモリ使用率 | 70% | 80% |
| ビルド時間 | 10分 | 15分 |
| ESLintエラー | 5個 | 10個 |

### アラート通知方法
1. **GitHub Issue**: 自動作成
2. **Slack通知**: (将来実装)
3. **メール通知**: (将来実装)

## 📊 ダッシュボード

### アクセス方法
1. **GitHub Actions タブ**
   - ワークフロー実行履歴
   - リアルタイムステータス

2. **Artifacts**
   - HTMLダッシュボード
   - JSONメトリクスデータ

3. **週次レポート**
   - 自動生成Issue
   - 詳細分析レポート

## 🛠️ ローカル実行

### メトリクス収集スクリプト
```bash
# メトリクス収集
node scripts/collect-metrics.js

# 出力ファイル
cat devops-metrics.json
```

### カスタムメトリクス追加
```javascript
// scripts/collect-metrics.js に追加
async collectCustomMetrics() {
  // カスタムメトリクス実装
  this.metrics.custom = {
    // メトリクスデータ
  };
}
```

## 📈 分析機能

### トレンド分析
- 日別成功率推移
- 実行時間トレンド
- リソース使用率推移

### 異常検知
- 実行時間の異常値
- 失敗パターン検出
- リソース使用スパイク

### 予測分析
- 成功率予測
- リソース使用予測
- 改善効果予測

## 🔮 将来の拡張

### Phase 5 計画
1. **機械学習による予測**
   - 失敗予測モデル
   - 最適化提案AI

2. **外部ツール連携**
   - Grafana統合
   - Datadog連携
   - New Relic統合

3. **高度な可視化**
   - リアルタイムダッシュボード
   - カスタムグラフ
   - ヒートマップ

## 📝 トラブルシューティング

### よくある問題

#### メトリクス収集失敗
```bash
# GitHub CLIの認証確認
gh auth status

# 権限確認
gh api user
```

#### アラート未送信
```bash
# ワークフロー実行ログ確認
gh run view <run-id>

# Issue作成権限確認
gh issue create --title "Test" --body "Test"
```

## 🎯 ベストプラクティス

### メトリクス管理
1. **定期的な閾値見直し**
   - 月次で閾値を評価
   - 実績に基づく調整

2. **ノイズ削減**
   - 重要アラートのみ通知
   - グループ化とサマリー

3. **アクション可能な情報**
   - 具体的な改善提案
   - 自動修復の実装

## 📚 関連ドキュメント

- [DevOps Foundation Report](../DEVOPS-FOUNDATION-FINAL-REPORT.md)
- [CI/CD最適化ガイド](.claude/prompts/ci-cd-optimization.md)
- [パフォーマンス最適化](.claude/prompts/performance-optimization.md)

---

📅 最終更新: 2025-08-15  
🤖 Generated with [Claude Code](https://claude.ai/code)