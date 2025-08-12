# 📚 GitHub Actions 包括的ルールブック v2.0

## 🎯 目的と価値提案

このルールブックは、PMPLearningManagementプロジェクトにおけるGitHub Actionsワークフローの設計、実装、管理に関する包括的なガイドラインを提供し、以下の価値を実現します：

- **一貫性**: 全ワークフローで統一された品質基準
- **効率性**: 再利用可能なコンポーネントによる開発高速化
- **保守性**: 明確な構造と文書化による長期的な管理容易性
- **セキュリティ**: ベストプラクティスに基づいた安全な実装
- **コスト最適化**: リソース使用の効率化とGitHub Actions使用料の削減

## 📋 目次

1. [ワークフロー設計原則](#ワークフロー設計原則)
2. [命名規則とファイル構造](#命名規則とファイル構造)
3. [ワークフロー実装標準](#ワークフロー実装標準)
4. [セキュリティガイドライン](#セキュリティガイドライン)
5. [パフォーマンス最適化](#パフォーマンス最適化)
6. [エラーハンドリングとリカバリー](#エラーハンドリングとリカバリー)
7. [監視とアラート](#監視とアラート)
8. [コスト管理](#コスト管理)
9. [テンプレートとツール](#テンプレートとツール)
10. [チェックリストと検証](#チェックリストと検証)

---

## 🏗️ ワークフロー設計原則

### 1. 単一責任の原則（SRP）

各ワークフローは**単一の明確な目的**を持つべきです。

```yaml
# ✅ 良い例: 単一目的
name: 🧪 単体テスト実行

# ❌ 悪い例: 複数目的の混在
name: テスト実行とデプロイとセキュリティ監査
```

### 2. モジュール化とコンポジション

複雑なワークフローは小さな再利用可能な部品に分解します。

```yaml
# 再利用可能なワークフローの呼び出し
jobs:
  setup:
    uses: ./.github/workflows/reusable-setup.yml
    with:
      node-version: '18'
```

### 3. 明示性の原則

暗黙的な動作よりも明示的な設定を優先します。

```yaml
# 明示的な設定
timeout-minutes: 30
continue-on-error: false
shell: bash
```

### 4. フェイルファスト原則

問題を早期に検出し、即座に失敗します。

```yaml
strategy:
  fail-fast: true
  matrix:
    node: [18, 20]
```

### 5. 冪等性の確保

同じ入力に対して常に同じ結果を生成します。

---

## 📝 命名規則とファイル構造

### ワークフローファイル命名規則

```
{優先度}-{カテゴリ}-{機能}-{環境}.yml
```

#### 優先度プレフィックス

| プレフィックス | 用途 | 実行優先度 |
|--------------|------|-----------|
| `00-` | テンプレート・サンプル | 実行されない |
| `01-` | クリティカルなCI/CD | 最高 |
| `02-` | テスト・品質保証 | 高 |
| `03-` | セキュリティ | 高 |
| `04-` | 監視・分析 | 中 |
| `05-` | 自動化・最適化 | 中 |
| `06-` | ドキュメント・レポート | 低 |
| `07-` | 実験的・開発中 | 最低 |

#### カテゴリ識別子

| カテゴリ | 識別子 | 用途 |
|---------|--------|------|
| デプロイメント | `deploy` | 本番・ステージング環境へのデプロイ |
| テスト | `test` | 単体・統合・E2Eテスト |
| セキュリティ | `security` | 脆弱性スキャン・監査 |
| パフォーマンス | `perf` | パフォーマンス測定・最適化 |
| 品質 | `quality` | コード品質・リンティング |
| 監視 | `monitor` | システム監視・ヘルスチェック |
| 通知 | `notify` | 通知・アラート |
| 自動化 | `auto` | 自動化タスク |

### ワークフロー名（name）の命名規則

```yaml
name: {絵文字} {日本語説明} | {英語補足}
```

#### カテゴリ別絵文字マッピング

| カテゴリ | 絵文字 | 使用例 |
|---------|--------|--------|
| デプロイ | 🚀 📦 | `🚀 本番デプロイ \| Production Deployment` |
| テスト | 🧪 🔬 | `🧪 単体テスト実行 \| Unit Tests` |
| セキュリティ | 🔒 🛡️ | `🔒 セキュリティ監査 \| Security Audit` |
| パフォーマンス | ⚡ 📊 | `⚡ パフォーマンス監視 \| Performance Monitor` |
| 品質 | ✨ 🎨 | `✨ コード品質チェック \| Code Quality` |
| 監視 | 👁️ 📡 | `👁️ システム監視 \| System Monitoring` |
| 通知 | 🔔 📢 | `🔔 ビルド通知 \| Build Notifications` |
| 自動化 | 🤖 ⚙️ | `🤖 自動マージ \| Auto Merge` |

---

## 🔧 ワークフロー実装標準

### 必須ヘッダーテンプレート

```yaml
# ====================================================================
# ワークフロー: {名前}
# バージョン: {x.y.z}
# 最終更新: {YYYY-MM-DD}
# ====================================================================
# 目的:
#   {このワークフローの主要な目的を1-2文で説明}
#
# トリガー:
#   - {トリガー条件1}
#   - {トリガー条件2}
#
# 依存関係:
#   - {依存するワークフローやリソース}
#
# 成果物:
#   - {生成される成果物}
#
# 実行時間: 約{N}分
# コスト見積: ${推定コスト}/実行
# ====================================================================
```

### トリガー設定標準

```yaml
on:
  # プッシュトリガー（保護ブランチのみ）
  push:
    branches: 
      - main
      - develop
    paths-ignore:
      - '**.md'
      - 'docs/**'
      
  # PRトリガー（ドラフトを除く）
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]
    
  # 定期実行（コスト最適化のため最小限に）
  schedule:
    - cron: '0 2 * * 1'  # 毎週月曜日 AM 2:00 UTC
    
  # 手動実行（必須）
  workflow_dispatch:
    inputs:
      debug:
        description: 'デバッグモード'
        type: boolean
        default: false
```

### 権限設定標準

```yaml
# 最小権限の原則
permissions:
  contents: read       # デフォルト: 読み取りのみ
  # 必要に応じて追加
  # actions: write     # ワークフロー制御が必要な場合のみ
  # checks: write      # チェック結果を書き込む場合のみ
  # pull-requests: write # PRにコメントする場合のみ
```

### ジョブ設定標準

```yaml
jobs:
  job-name:
    name: 🔹 {日本語名} | {English Name}
    runs-on: ubuntu-latest  # 特別な理由がない限りubuntu-latest使用
    timeout-minutes: 30      # 必須: タイムアウト設定
    
    # 環境設定（必要な場合）
    environment:
      name: production
      url: ${{ steps.deploy.outputs.url }}
    
    # 並行実行制御
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
    
    # 条件付き実行
    if: |
      github.event_name == 'push' && 
      !contains(github.event.head_commit.message, '[skip ci]')
```

### ステップ実装標準

```yaml
steps:
  # 1. チェックアウト（標準設定）
  - name: 📥 コードのチェックアウト
    uses: actions/checkout@v4
    with:
      fetch-depth: 0  # 履歴が必要な場合のみ
      
  # 2. キャッシュの復元
  - name: 📦 キャッシュの復元
    uses: actions/cache@v4
    with:
      path: |
        ~/.npm
        node_modules
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
        
  # 3. 環境セットアップ
  - name: 🔧 Node.js環境のセットアップ
    uses: actions/setup-node@v4
    with:
      node-version-file: '.nvmrc'  # または明示的なバージョン
      cache: 'npm'
      
  # 4. 依存関係のインストール
  - name: 📦 依存関係のインストール
    run: |
      npm ci --prefer-offline --no-audit
      
  # 5. ビルド/テスト/デプロイ
  - name: 🏗️ ビルド実行
    run: |
      npm run build
    env:
      NODE_ENV: production
      
  # 6. 成果物のアップロード
  - name: 📤 成果物のアップロード
    if: success()
    uses: actions/upload-artifact@v4
    with:
      name: build-artifacts
      path: dist/
      retention-days: 7  # コスト最適化
```

---

## 🔒 セキュリティガイドライン

### シークレット管理

#### 1. シークレットの分類と保管

| 分類 | 保管場所 | 例 |
|-----|---------|-----|
| 環境固有 | Environment Secrets | API_KEY_PROD, DB_PASSWORD_STAGING |
| リポジトリ共通 | Repository Secrets | GITHUB_TOKEN, NPM_TOKEN |
| 組織共通 | Organization Secrets | SLACK_WEBHOOK, SONAR_TOKEN |

#### 2. シークレット使用のベストプラクティス

```yaml
# ✅ 良い: 環境変数経由
env:
  API_KEY: ${{ secrets.API_KEY }}
run: |
  echo "API呼び出し中..."
  curl -H "Authorization: Bearer $API_KEY" https://api.example.com

# ❌ 悪い: 直接参照
run: |
  curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" https://api.example.com
```

#### 3. シークレットのローテーション

- 90日ごとの定期ローテーション
- 漏洩時の即座のローテーション
- ローテーション手順の文書化

### サードパーティアクションの使用

#### 1. アクションの検証基準

```yaml
# ✅ 推奨: 公式アクションまたは検証済みパブリッシャー
- uses: actions/checkout@v4
- uses: docker/setup-buildx-action@v3

# ⚠️ 注意: サードパーティの場合はSHA固定
- uses: third-party/action@8e5e7e5ab8b370d6c329ec480221e9aef88f2fc9

# ❌ 避ける: ブランチ参照
- uses: unknown/action@main
```

#### 2. アクションの監査チェックリスト

- [ ] 公式またはVerifiedパブリッシャーか
- [ ] 最新バージョンか
- [ ] 必要最小限の権限か
- [ ] ソースコードを確認したか
- [ ] 定期的な更新があるか

### コードインジェクション対策

```yaml
# セキュアな変数使用
- name: セキュアな処理
  env:
    PR_TITLE: ${{ github.event.pull_request.title }}
    COMMIT_MSG: ${{ github.event.head_commit.message }}
  run: |
    # 環境変数経由で安全に使用
    echo "PRタイトル: ${PR_TITLE}"
    echo "コミットメッセージ: ${COMMIT_MSG}"
    
    # サニタイズ処理
    SAFE_TITLE=$(echo "${PR_TITLE}" | sed 's/[^a-zA-Z0-9 -]//g')
    echo "処理済みタイトル: ${SAFE_TITLE}"
```

---

## ⚡ パフォーマンス最適化

### 実行時間の最適化

#### 1. 並列実行戦略

```yaml
strategy:
  matrix:
    include:
      - { os: ubuntu-latest, node: 18, name: 'Linux-18' }
      - { os: ubuntu-latest, node: 20, name: 'Linux-20' }
      - { os: macos-latest, node: 18, name: 'macOS-18' }
  max-parallel: 3  # 同時実行数の制限
```

#### 2. ジョブの依存関係最適化

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-key: ${{ steps.cache.outputs.key }}
  
  test:
    needs: setup
    strategy:
      matrix:
        suite: [unit, integration, e2e]
    runs-on: ubuntu-latest
    
  deploy:
    needs: test
    if: success() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
```

### キャッシング戦略

#### 1. 多層キャッシュ戦略

```yaml
- name: NPMキャッシュ
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      npm-${{ runner.os }}-
      npm-

- name: ビルドキャッシュ
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      dist/
    key: build-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      build-${{ runner.os }}-
```

#### 2. キャッシュサイズの最適化

```yaml
# キャッシュ前のクリーンアップ
- name: キャッシュ最適化
  run: |
    # 不要なファイルを削除
    find . -name "*.log" -delete
    find . -name ".DS_Store" -delete
    
    # node_modulesの最適化
    npm prune --production
```

### リソース使用の最適化

#### 1. ランナーの選択基準

| タスク | 推奨ランナー | 理由 |
|-------|------------|------|
| ビルド・テスト | ubuntu-latest | コスト効率が最高 |
| iOS/macOSビルド | macos-latest | 必須要件 |
| Windows固有テスト | windows-latest | 互換性テスト |
| 重い処理 | ubuntu-latest-4-cores | パフォーマンス |

#### 2. タイムアウトの適切な設定

```yaml
timeout-minutes: 30  # ジョブレベル
steps:
  - name: 長時間処理
    timeout-minutes: 10  # ステップレベル
    run: |
      timeout 300 npm run heavy-task || true  # コマンドレベル
```

---

## 🔄 エラーハンドリングとリカバリー

### エラーハンドリング戦略

#### 1. 基本的なエラーハンドリング

```yaml
- name: エラーハンドリング例
  id: build
  continue-on-error: true
  run: |
    npm run build || {
      echo "::error::ビルドに失敗しました"
      echo "build-failed=true" >> $GITHUB_OUTPUT
      exit 1
    }
    
- name: リトライロジック
  if: steps.build.outputs.build-failed == 'true'
  uses: nick-fields/retry@v3
  with:
    timeout_minutes: 5
    max_attempts: 3
    retry_wait_seconds: 30
    command: npm run build
```

#### 2. 条件付きエラーハンドリング

```yaml
- name: 条件付き処理
  run: |
    if [[ "${{ github.event_name }}" == "pull_request" ]]; then
      echo "::warning::PRでのエラーは警告として扱います"
      npm test || true
    else
      npm test
    fi
```

### リカバリー戦略

```yaml
# キャッシュ復元失敗時のフォールバック
- name: キャッシュ復元
  id: cache
  uses: actions/cache@v4
  continue-on-error: true
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    
- name: フォールバック処理
  if: steps.cache.outcome == 'failure' || steps.cache.outputs.cache-hit != 'true'
  run: |
    echo "::notice::キャッシュミス - クリーンインストール実行"
    npm ci
```

---

## 📊 監視とアラート

### メトリクス収集

```yaml
- name: パフォーマンスメトリクス収集
  if: always()
  run: |
    # 実行時間の記録
    DURATION=$((SECONDS))
    echo "::notice::実行時間: ${DURATION}秒"
    
    # メトリクスをアーティファクトとして保存
    cat > metrics.json <<EOF
    {
      "workflow": "${{ github.workflow }}",
      "duration": ${DURATION},
      "status": "${{ job.status }}",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
    EOF
    
- name: メトリクスアップロード
  uses: actions/upload-artifact@v4
  with:
    name: workflow-metrics
    path: metrics.json
    retention-days: 30
```

### アラート設定

```yaml
# Slack通知の例
- name: 失敗時のSlack通知
  if: failure() && github.ref == 'refs/heads/main'
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚨 ワークフロー失敗",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*ワークフロー:* ${{ github.workflow }}\\n*ブランチ:* ${{ github.ref }}\\n*実行者:* ${{ github.actor }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 💰 コスト管理

### コスト最適化戦略

#### 1. 実行時間の監視と制限

```yaml
# ワークフローレベルでの制限
env:
  MAX_RUNTIME_MINUTES: 60
  
jobs:
  monitor:
    timeout-minutes: ${{ fromJSON(env.MAX_RUNTIME_MINUTES) }}
    steps:
      - name: 実行時間チェック
        run: |
          if [ $SECONDS -gt 3600 ]; then
            echo "::error::実行時間が制限を超えました"
            exit 1
          fi
```

#### 2. アーティファクト管理

```yaml
# 保持期間の最適化
- uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: coverage/
    retention-days: 3  # 最小限の保持期間
    
# 定期的なクリーンアップ
- name: 古いアーティファクトの削除
  uses: actions/github-script@v7
  with:
    script: |
      const artifacts = await github.rest.actions.listArtifactsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      });
      
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7日前
      
      for (const artifact of artifacts.data.artifacts) {
        if (Date.parse(artifact.created_at) < cutoff) {
          await github.rest.actions.deleteArtifact({
            owner: context.repo.owner,
            repo: context.repo.repo,
            artifact_id: artifact.id,
          });
        }
      }
```

#### 3. ワークフロー実行の最適化

```yaml
# 不要な実行のスキップ
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/ISSUE_TEMPLATE/**'
    
# コミットメッセージによるスキップ
jobs:
  build:
    if: |
      !contains(github.event.head_commit.message, '[skip ci]') &&
      !contains(github.event.head_commit.message, '[ci skip]')
```

### コストレポート

```yaml
# 月次コストレポート生成
- name: コストレポート生成
  run: |
    # GitHub API使用状況取得
    curl -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
      https://api.github.com/repos/${{ github.repository }}/actions/runs \
      | jq '.workflow_runs | 
        map({
          name: .name,
          duration: .run_duration_ms,
          billable: .billable
        })' > cost-report.json
```

---

## 📁 再利用可能なコンポーネント

### Composite Actions

```yaml
# .github/actions/setup-node/action.yml
name: 'Setup Node.js Environment'
description: 'Node.js環境の標準セットアップ'

inputs:
  node-version:
    description: 'Node.jsバージョン'
    required: false
    default: '18'

runs:
  using: "composite"
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      shell: bash
      run: |
        npm ci --prefer-offline --no-audit
        
    - name: Verify setup
      shell: bash
      run: |
        node --version
        npm --version
```

### Reusable Workflows

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      test-suite:
        required: true
        type: string
      coverage-threshold:
        required: false
        type: number
        default: 80
    secrets:
      codecov-token:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node
      
      - name: Run tests
        run: |
          npm run test:${{ inputs.test-suite }}
          
      - name: Coverage check
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < ${{ inputs.coverage-threshold }}" | bc -l) )); then
            echo "::error::Coverage ${COVERAGE}% is below threshold ${{ inputs.coverage-threshold }}%"
            exit 1
          fi
```

---

## ✅ 実装チェックリスト

### 新規ワークフロー作成時

- [ ] ファイル名が命名規則に従っている
- [ ] ワークフロー名に適切な絵文字と説明がある
- [ ] 必須ヘッダーコメントが記載されている
- [ ] workflow_dispatchトリガーが含まれている
- [ ] 適切な権限設定がされている
- [ ] タイムアウトが設定されている
- [ ] エラーハンドリングが実装されている
- [ ] キャッシュ戦略が適用されている
- [ ] シークレットが安全に使用されている
- [ ] ドキュメントが更新されている

### ワークフロー更新時

- [ ] 変更の影響範囲を分析した
- [ ] バージョン番号を更新した
- [ ] 変更履歴をコメントに追加した
- [ ] テスト環境で検証した
- [ ] 関連ドキュメントを更新した
- [ ] レビューを受けた

### 定期レビュー時

- [ ] 実行時間の分析
- [ ] 成功率の確認
- [ ] コストの評価
- [ ] 依存関係の更新
- [ ] 不要なワークフローの削除
- [ ] ベストプラクティスの適用

---

## 📚 参考資料

### 公式ドキュメント
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides/best-practices)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides)

### 内部ドキュメント
- [WORKFLOW_STANDARDS.md](.github/workflows/WORKFLOW_STANDARDS.md)
- [プロジェクト固有のCI/CD実装ガイド](docs/CI_CD_IMPLEMENTATION.md)
- [IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md)

---

## 🔄 更新履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|----------|------|---------|-------|
| 2.0.0 | 2025-08-12 | 包括的ルールブック初版作成 | Claude Code |
| 1.0.0 | 2025-01-XX | 初期標準文書 | - |

---

## 📞 サポート

質問や提案がある場合は、以下の方法でサポートを受けられます：

1. GitHub Issueの作成
2. プロジェクトSlackチャンネル
3. 週次のDevOpsミーティング

---

*このドキュメントは継続的に改善されます。フィードバックを歓迎します。*