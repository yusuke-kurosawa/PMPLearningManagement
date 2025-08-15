# GitHub Actions 運用ガイド

## 📖 概要

このドキュメントは、PMPLearningManagementプロジェクトのGitHub Actions運用に関する包括的なガイドです。

## 🏗️ アーキテクチャ

### ワークフローアーキテクチャ

```
GitHub Actions アーキテクチャ
├── CI/CD Pipeline
│   ├── ci-core-pipeline.yml      # メインCI/CD
│   ├── ci-pr-validation.yml      # PR検証
│   └── cd-production-deploy.yml  # 本番デプロイ
│
├── Security & Quality
│   ├── security-scan.yml         # セキュリティスキャン
│   ├── security-dependency.yml   # 依存関係監査
│   └── quality-gates.yml         # 品質ゲート
│
├── IDD (Issue-Driven Development)
│   ├── idd-compliance.yml        # IDD準拠チェック
│   ├── idd-metrics.yml           # メトリクス収集
│   └── idd-automation.yml        # 自動化処理
│
├── AI Support
│   ├── ai-claude-review.yml      # Claude AIレビュー
│   ├── ai-assistant.yml          # AI支援機能
│   └── ai-monitoring.yml         # AI監視
│
└── Maintenance & Automation
    ├── maintenance-deps.yml      # 依存関係管理
    ├── automation-notify.yml    # 通知自動化
    └── governance-audit.yml     # ガバナンス監査
```

## 📋 ワークフロー一覧

### 🔍 CI関連ワークフロー

| ワークフロー名         | トリガー       | 目的                    | 重要度 |
| ---------------------- | -------------- | ----------------------- | ------ |
| `ci-core-pipeline.yml` | push, PR       | メインCI/CDパイプライン | 🔴 高  |
| `ci-pr-validation.yml` | PR             | プルリクエスト検証      | 🔴 高  |
| `ci-test-data.yml`     | 手動, schedule | テストデータ管理        | 🟡 中  |

### 🚀 CD関連ワークフロー

| ワークフロー名             | トリガー     | 目的         | 重要度 |
| -------------------------- | ------------ | ------------ | ------ |
| `cd-production-deploy.yml` | push to main | 本番デプロイ | 🔴 高  |

### 🔒 セキュリティ関連ワークフロー

| ワークフロー名            | トリガー     | 目的                 | 重要度 |
| ------------------------- | ------------ | -------------------- | ------ |
| `security-scan.yml`       | schedule, PR | セキュリティスキャン | 🔴 高  |
| `security-dependency.yml` | schedule     | 依存関係監査         | 🟡 中  |
| `security-compliance.yml` | PR           | コンプライアンス監査 | 🟡 中  |

### 📋 IDD関連ワークフロー

| ワークフロー名       | トリガー   | 目的            | 重要度 |
| -------------------- | ---------- | --------------- | ------ |
| `idd-compliance.yml` | PR, push   | IDD準拠チェック | 🔴 高  |
| `idd-metrics.yml`    | schedule   | メトリクス収集  | 🟡 中  |
| `idd-automation.yml` | issues, PR | 自動化処理      | 🟡 中  |

### 🤖 AI支援ワークフロー

| ワークフロー名         | トリガー | 目的                    | 重要度 |
| ---------------------- | -------- | ----------------------- | ------ |
| `ai-claude-review.yml` | PR       | Claude AIコードレビュー | 🟡 中  |
| `ai-assistant.yml`     | issues   | AI支援機能              | 🟢 低  |
| `ai-monitoring.yml`    | schedule | AI機能監視              | 🟢 低  |

## 🧩 Composite Actions

再利用可能なComposite Actionsを活用して効率化を図ります。

### 📦 共通Actions

| Action名       | パス                             | 目的                        |
| -------------- | -------------------------------- | --------------------------- |
| Node.js Setup  | `.github/actions/setup-node`     | Node.js環境統一セットアップ |
| Quality Check  | `.github/actions/quality-check`  | コード品質チェック統合      |
| Security Audit | `.github/actions/security-audit` | セキュリティ監査統合        |
| IDD Validator  | `.github/actions/idd-validator`  | IDD検証統合                 |

### 使用例

```yaml
# Node.js環境のセットアップ
- name: 🏗️ Setup Node.js Environment
  uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    install-deps: true
    production-only: false

# コード品質チェック
- name: 🔍 Code Quality Check
  uses: ./.github/actions/quality-check
  with:
    run-eslint: true
    run-typescript: true
    run-prettier: true
    eslint-max-warnings: 0

# セキュリティ監査
- name: 🔒 Security Audit
  uses: ./.github/actions/security-audit
  with:
    audit-level: 'moderate'
    run-dependency-audit: true
    run-code-scan: true

# IDD検証
- name: 📋 IDD Validation
  uses: ./.github/actions/idd-validator
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    check-commit-messages: true
    check-pr-title: true
```

## 🔧 設定とカスタマイズ

### 環境変数

| 変数名          | 説明                   | デフォルト値 |
| --------------- | ---------------------- | ------------ |
| `NODE_VERSION`  | Node.jsバージョン      | `18`         |
| `CACHE_VERSION` | キャッシュバージョン   | `v1`         |
| `AUDIT_LEVEL`   | セキュリティ監査レベル | `moderate`   |

### シークレット

| シークレット名          | 説明                   | 必須 |
| ----------------------- | ---------------------- | ---- |
| `GITHUB_TOKEN`          | GitHub API トークン    | ✅   |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI トークン | ❌   |
| `CLAUDE_API_KEY`        | Claude API キー        | ❌   |

## 📊 監視とメトリクス

### 主要メトリクス

1. **ワークフロー実行時間**
   - 目標: CI < 5分, CD < 10分
   - 監視: 実行時間トレンド

2. **成功率**
   - 目標: > 95%
   - 監視: 失敗原因の分析

3. **IDD準拠率**
   - 目標: > 90%
   - 監視: 週次レポート

### ダッシュボード

```bash
# メトリクス確認
npm run workflow:metrics

# 成功率レポート
npm run workflow:success-rate

# IDD準拠レポート
npm run idd:report
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. ビルドエラー

```yaml
# 解決策: Node.jsバージョン確認
- name: Debug Node.js version
  run: |
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
```

#### 2. キャッシュエラー

```yaml
# 解決策: キャッシュクリア
- name: Clear cache
  run: npm cache clean --force
```

#### 3. 権限エラー

```yaml
# 解決策: permissions設定
permissions:
  contents: read
  actions: write
  pull-requests: write
```

## 🔄 メンテナンス

### 定期メンテナンス

1. **月次**
   - ワークフロー成功率レビュー
   - 実行時間最適化
   - 依存関係更新

2. **四半期**
   - ワークフロー整理
   - メトリクス分析
   - セキュリティ監査

### アップデート手順

1. **Actionsバージョン更新**

```bash
# 依存関係確認
npm run workflow:check-updates

# 段階的更新
npm run workflow:update
```

2. **新機能追加**

```bash
# ワークフロー分析
npm run workflow:analyze

# 最適化実行
npm run workflow:optimize
```

## 📚 ベストプラクティス

### 1. ワークフロー設計

- **単一責任**: 各ワークフローは明確な目的を持つ
- **再利用性**: Composite Actionsで共通処理を統一
- **失敗時対応**: 適切なエラーハンドリングとログ出力

### 2. パフォーマンス

- **並列実行**: 独立したjobは並列で実行
- **キャッシュ活用**: node_modules、ビルド成果物をキャッシュ
- **条件実行**: 必要な場合のみワークフロー実行

### 3. セキュリティ

- **最小権限**: 必要最小限のpermissionsを設定
- **シークレット管理**: 機密情報は適切にシークレット化
- **定期監査**: セキュリティスキャンを定期実行

### 4. 品質管理

- **統一基準**: ESLint、Prettier、TypeScriptで統一
- **自動化**: 品質チェックをCI/CDに組み込み
- **継続改善**: メトリクスベースの継続的改善

## 📝 ログとデバッグ

### ログレベル設定

```yaml
env:
  ACTIONS_STEP_DEBUG: true # デバッグログ有効化
  RUNNER_DEBUG: 1 # ランナーデバッグ有効化
```

### デバッグコマンド

```bash
# ワークフロー状態確認
gh run list --limit 10

# 特定ワークフローの詳細確認
gh run view <run-id>

# ログダウンロード
gh run download <run-id>
```

## 🔗 関連ドキュメント

- [IDD実装ステータス](./IDD_IMPLEMENTATION_STATUS.md)
- [ワークフロー命名規則](./WORKFLOW_NAMING_RULES.md)
- [DevOpsベストプラクティス](./DEVOPS_BEST_PRACTICES.md)
- [セキュリティガイドライン](./SECURITY_GUIDELINES.md)

---

**最終更新**: 2025-08-14  
**作成者**: DevOps自動化システム  
**Issue**: #88 - ESLint警告ゼロ達成とTypeScript完全移行
