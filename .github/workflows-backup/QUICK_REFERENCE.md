# 🎯 GitHub Actions ワークフロー クイックリファレンス

## 📊 カテゴリ別クイックビュー

### 🚀 CORE（毎日使用）
```yaml
core-01-deploy.yml         # 本番デプロイ → mainブランチpush時
core-02-pr-validation.yml  # PR検証 → PR作成・更新時  
core-03-build-test.yml     # ビルド&テスト → 全push・PR時
```

### 🧪 TEST（品質保証）
```yaml
test-01-unit-integration.yml  # 基本テスト → 全push・PR
test-02-parallel.yml          # 並列実行 → main/develop push
test-03-advanced.yml          # 高度テスト → 週末定期
test-04-integration.yml       # 統合テスト → main push
test-05-data-management.yml   # データ管理 → 毎日0時
test-06-chaos.yml             # カオステスト → 週次
```

### 🔒 SECURITY（セキュリティ）
```yaml
sec-01-vulnerability-scan.yml  # 脆弱性スキャン → 毎日3時
sec-02-zero-trust.yml          # ゼロトラスト → 毎日3時
sec-03-infrastructure.yml      # インフラ監査 → 週次水曜
sec-04-compliance.yml          # コンプライアンス → 毎日2時
sec-05-governance.yml          # ガバナンス → 週次
```

### 📊 MONITOR（監視）
```yaml
mon-01-performance.yml      # パフォーマンス → 6時間毎
mon-02-observability.yml    # 可観測性 → 設定変更時
mon-03-monitoring-setup.yml # 監視設定 → 設定変更時
mon-04-quality-gates.yml    # 品質ゲート → PR・push時
mon-05-ai-analytics.yml     # AI分析 → 日次
```

---

## 🎮 よく使うコマンド

### 基本操作
```bash
# ワークフロー一覧
gh workflow list

# ワークフロー実行
gh workflow run [workflow-file]

# 実行状況確認
gh run list --workflow=[workflow-file]

# ログ確認
gh run view [RUN_ID] --log
```

### カテゴリ別実行
```bash
# COREワークフロー全実行
for wf in core-*.yml; do gh workflow run $wf; done

# TESTワークフロー状況確認
gh run list --workflow=test-* --limit 10

# SECURITYアラート確認
gh api /repos/{owner}/{repo}/security/alerts
```

### 緊急対応
```bash
# ワークフロー無効化
gh workflow disable [workflow-file]

# 全ワークフロー停止
gh run list --status in_progress --json databaseId | jq '.[].databaseId' | xargs -I {} gh run cancel {}

# ロールバック
gh workflow run rollback.yml
```

---

## 🔥 トラブルシューティング

### ケース別対応表

| 症状 | 確認コマンド | 対処法 |
|------|------------|--------|
| ワークフローが動かない | `gh workflow list` | 権限・ブランチ設定確認 |
| テスト失敗 | `gh run view --log` | 環境変数・依存関係確認 |
| デプロイ失敗 | `gh secret list` | トークン・権限確認 |
| 実行が遅い | `gh run list --json` | キャッシュ・並列化検討 |
| セキュリティアラート | `gh api /security` | 脆弱性パッチ適用 |

---

## 📈 パフォーマンス目標

| ワークフロー | 目標時間 | アラート閾値 |
|-------------|---------|-------------|
| core-01-deploy | <5分 | >10分 |
| core-02-pr-validation | <3分 | >5分 |
| test-01-unit-integration | <5分 | >10分 |
| test-02-parallel | <3分 | >5分 |
| sec-01-vulnerability-scan | <2分 | >5分 |
| mon-01-performance | <1分 | >3分 |

---

## 🔄 定期実行スケジュール

### 毎日
- `02:00` - sec-04-compliance（コンプライアンス）
- `03:00` - sec-01-vulnerability-scan（脆弱性）
- `03:00` - sec-02-zero-trust（ゼロトラスト）
- `00:00` - test-05-data-management（データ管理）
- `*/6h` - mon-01-performance（パフォーマンス）

### 週次
- `水 02:00` - sec-03-infrastructure（インフラ監査）
- `月 00:00` - dev-03-dependency-health（依存関係）
- `土日` - test-03-advanced（高度テスト）

### 月次
- `1日` - notify-02-benchmark（ベンチマーク）
- `1日` - adv-04-green-devops（ESG）

---

## 🚀 ワンライナー集

```bash
# 今日の失敗ワークフロー
gh run list --status failure --created ">$(date -d '1 day ago' '+%Y-%m-%d')"

# PR待ちの確認
gh pr list --state open --json number,title,checks | jq '.[] | select(.checks | any(.conclusion == "failure"))'

# カバレッジ確認
gh workflow run test-01-unit-integration.yml && sleep 60 && gh run view --log | grep "Coverage:"

# 実行時間TOP5
gh run list --limit 100 --json name,updatedAt,createdAt | jq -r '.[] | "\(.name): \((.updatedAt | fromdate) - (.createdAt | fromdate))秒"' | sort -rn -k2 | head -5

# セキュリティサマリー
gh api /repos/{owner}/{repo}/vulnerability-alerts --jq '.[] | .security_advisory.summary'
```

---

## 📱 モバイル用コマンド（短縮版）

```bash
# 状態確認
alias ghs='gh run list --limit 5'

# デプロイ
alias ghd='gh workflow run core-01-deploy.yml'

# テスト実行
alias ght='gh workflow run test-01-unit-integration.yml'

# ログ確認（最新）
alias ghl='gh run list --limit 1 --json databaseId | jq -r ".[0].databaseId" | xargs gh run view --log'
```

---

## 🎨 ビジュアルステータス

```
🟢 正常 | 🟡 警告 | 🔴 エラー | ⚫ 停止中

[CORE]
🟢 deploy | 🟢 pr-validation | 🟢 build-test

[TEST] 
🟢 unit | 🟡 parallel | 🟢 advanced | 🟢 integration

[SECURITY]
🟢 scan | 🟢 zero-trust | 🟢 infra | 🔴 compliance

[MONITOR]
🟢 performance | 🟢 observability | 🟡 quality
```

---

## 💡 Pro Tips

1. **バッチ実行**: 複数ワークフローを一括実行
```bash
echo "core-01 core-02 test-01" | xargs -n1 -I{} gh workflow run {}-*.yml
```

2. **条件付き実行**: 特定条件でのみ実行
```bash
[[ $(date +%u) -eq 1 ]] && gh workflow run weekly-report.yml
```

3. **並列ログ監視**: 複数ワークフローのログを同時監視
```bash
gh run list --status in_progress --json databaseId | jq -r '.[].databaseId' | xargs -P4 -I{} gh run watch {}
```

4. **自動リトライ**: 失敗時の自動再実行
```bash
gh run list --status failure --limit 1 --json databaseId,workflowName | jq -r '"\(.workflowName)"' | xargs gh workflow run
```

5. **メトリクス収集**: 実行統計の取得
```bash
gh api /repos/{owner}/{repo}/actions/runs --jq '[.workflow_runs[] | {name: .name, conclusion: .conclusion}] | group_by(.name) | map({name: .[0].name, success: (map(select(.conclusion == "success")) | length), total: length})'
```