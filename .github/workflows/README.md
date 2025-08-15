# 🚀 GitHub Actions ワークフロー

このディレクトリには、PMPLearningManagementプロジェクトのCI/CDパイプラインを構成するGitHub Actionsワークフローが含まれています。

## 📊 現在の構成（2025-08-15）

### アクティブワークフロー（7個）

| #   | ファイル名                | 説明                    | トリガー           | 実行頻度 |
| --- | ------------------------- | ----------------------- | ------------------ | -------- |
| 01  | `01-core-ci-cd.yml`       | メインCI/CDパイプライン | push, PR, schedule | 高       |
| 02  | `02-claude-pr-review.yml` | Claude AIコードレビュー | PR                 | 中       |
| 03  | `03-security-scan.yml`    | セキュリティスキャン    | push, PR, schedule | 高       |
| 04  | `04-deploy.yml`           | GitHub Pagesデプロイ    | push to main       | 中       |
| 05  | `05-idd-compliance.yml`   | IDD準拠チェック         | PR                 | 高       |
| 06  | `06-idd-main.yml`         | IDD メイン機能          | multiple           | 高       |
| 07  | `07-idd-metrics.yml`      | メトリクス収集          | schedule           | 低       |

### アーカイブ済み（`archive/` - 44個）

過去のワークフローは `archive/` ディレクトリに保管されています。

## 🎯 ワークフロー詳細

### 01. Core CI/CD (`01-core-ci-cd.yml`)

**目的**: ビルド、テスト、品質チェックの統合パイプライン

**主要ステップ**:

```yaml
jobs:
  setup: # 環境構築
  lint: # ESLintチェック
  typecheck: # TypeScript型チェック
  test: # 単体テスト
  build: # プロダクションビルド
  e2e: # E2Eテスト（条件付き）
```

**実行条件**:

- `push`: main, developブランチ
- `pull_request`: 全PR
- `schedule`: 毎日AM2:00（JST 11:00）

### 02. Claude PR Review (`02-claude-pr-review.yml`)

**目的**: AIによる自動コードレビュー

**機能**:

- コード品質分析
- セキュリティ脆弱性検出
- ベストプラクティス提案
- 改善案の自動コメント

**設定可能項目**:

```yaml
env:
  CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
  REVIEW_LEVEL: 'detailed' # basic | detailed | comprehensive
  AUTO_APPROVE: 'false' # 自動承認の有効化
```

### 03. Security Scan (`03-security-scan.yml`)

**目的**: 包括的なセキュリティチェック

**スキャン項目**:

- 依存関係の脆弱性（npm audit）
- コードセキュリティ（CodeQL）
- シークレット検出
- OWASP Top 10準拠

**アラート**:

- 高severity以上でIssue自動作成
- Slackへの即時通知

### 04. Deploy (`04-deploy.yml`)

**目的**: GitHub Pagesへの自動デプロイ

**プロセス**:

1. プロダクションビルド
2. 最適化（圧縮、画像最適化）
3. PWA設定更新
4. GitHub Pagesデプロイ
5. Lighthouse実行

**環境**:

```yaml
environment:
  name: production
  url: https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

### 05. IDD Compliance (`05-idd-compliance.yml`)

**目的**: Issue-Driven Development準拠検証

**チェック項目**:

- PR本文のIssue参照
- コミットメッセージ形式
- ブランチ名規則
- ラベル設定

**準拠率目標**: 99%以上

### 06. IDD Main (`06-idd-main.yml`)

**目的**: IDD関連の主要機能実行

**機能**:

- Issue自動処理
- ラベル管理
- マイルストーン更新
- プロジェクトボード同期

### 07. IDD Metrics (`07-idd-metrics.yml`)

**目的**: 開発メトリクスの収集と分析

**収集データ**:

- Issue解決時間
- PR マージ時間
- コード品質メトリクス
- チーム生産性指標

**レポート生成**: 週次・月次

## 🔧 ワークフロー管理

### 命名規則

```
<番号>-<カテゴリ>-<機能>.yml
```

- **番号**: 実行優先度・重要度順（01が最高）
- **カテゴリ**: 機能分類（core, claude, security, deploy, idd）
- **機能**: 具体的な機能名

### 共通設定

```yaml
# 標準ヘッダーテンプレート
# ================================================================
# ワークフロー名: [名前]
# カテゴリ: [カテゴリ]
# 目的: [目的]
# トリガー: [トリガー]
# 依存関係: [依存関係]
# 作成日: YYYY-MM-DD
# 最終更新: YYYY-MM-DD
# Issue: #XXX
# ================================================================
```

### 環境変数

```yaml
env:
  NODE_VERSION: '18'
  TIMEZONE: 'Asia/Tokyo'
  CACHE_VERSION: 'v1'
```

## 📈 パフォーマンス最適化

### キャッシュ戦略

```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 並列実行

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]
```

### 条件付き実行

```yaml
- name: E2Eテスト
  if: github.event_name == 'pull_request' && github.event.pull_request.draft == false
  run: npm run test:e2e
```

## 🔍 デバッグとトラブルシューティング

### デバッグモード有効化

```yaml
- name: デバッグ情報出力
  if: runner.debug == '1'
  run: |
    echo "Event: ${{ toJSON(github.event) }}"
    echo "Context: ${{ toJSON(github) }}"
```

### ローカルテスト

```bash
# actを使用したローカル実行
act push -W .github/workflows/01-core-ci-cd.yml

# 特定のジョブのみ実行
act -j test
```

### よくある問題と解決策

| 問題           | 原因                  | 解決策              |
| -------------- | --------------------- | ------------------- |
| キャッシュミス | package-lock.json変更 | キャッシュキー更新  |
| タイムアウト   | 処理時間超過          | タイムアウト値調整  |
| 権限エラー     | トークン権限不足      | permissions設定追加 |

## 📊 メトリクス

### 実行統計（週間平均）

| ワークフロー  | 実行回数 | 成功率 | 平均時間 |
| ------------- | -------- | ------ | -------- |
| Core CI/CD    | 150+     | 95%    | 8分      |
| Claude Review | 80+      | 98%    | 2分      |
| Security Scan | 100+     | 92%    | 5分      |
| Deploy        | 20+      | 99%    | 3分      |

### コスト最適化

- **実行時間削減**: 40%（最適化前比）
- **並列度向上**: 3倍
- **キャッシュヒット率**: 85%

## 🚀 今後の改善計画

### 短期（1-2週間）

- [ ] セルフホストランナー導入検討
- [ ] マトリックステストの最適化
- [ ] 通知システムの改善

### 中期（1-2ヶ月）

- [ ] カナリアデプロイメント実装
- [ ] A/Bテスト自動化
- [ ] パフォーマンス自動計測

### 長期（3-6ヶ月）

- [ ] マルチクラウド対応
- [ ] AIによる自動最適化
- [ ] 完全自動リリース

## 📚 関連ドキュメント

### プロジェクト内

- [GitHub Actions規則](../../.claude/rules/github-actions.md)
- [最適化レポート](./OPTIMIZATION_REPORT.md)
- [カスタムアクション](../actions/README.md)

### 外部リソース

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Workflow syntax](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [Context and expression syntax](https://docs.github.com/actions/learn-github-actions/contexts)

## 🔐 セキュリティ

### シークレット管理

- GitHub Secretsで管理
- 環境別に分離
- 定期的なローテーション

### 権限管理

```yaml
permissions:
  contents: read # リポジトリ読み取り
  pull-requests: write # PR書き込み
  issues: write # Issue書き込み
```

---

**最終更新**: 2025-08-15  
**管理者**: PMPLearningManagement Team  
**Issue**: #94 - プロジェクト全体の品質改善
