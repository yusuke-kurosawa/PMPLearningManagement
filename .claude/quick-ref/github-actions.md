# GitHub Actions Quick Reference 📚

## 🎯 よく使うアクション一覧

### 基本アクション
```yaml
# リポジトリのチェックアウト
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # 全履歴を取得（必要な場合）

# Node.js環境のセットアップ
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

# Python環境のセットアップ
- uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'

# キャッシュの管理
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# アーティファクトのアップロード
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7

# アーティファクトのダウンロード
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

### デプロイメント関連
```yaml
# GitHub Pagesへのデプロイ
- uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist

# AWS CLIのセットアップ
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-northeast-1

# Docker Buildx
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: user/app:latest
```

### テスト・品質管理
```yaml
# コードカバレッジ
- uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info

# SonarCloud スキャン
- uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

# Lighthouse CI
- uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      https://example.com
    uploadArtifacts: true
```

### セキュリティ
```yaml
# CodeQL 分析
- uses: github/codeql-action/init@v3
  with:
    languages: javascript, python

# Snyk脆弱性スキャン
- uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

# Trivy コンテナスキャン
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'docker.io/my-app:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## 📋 シンタックスリファレンス

### トリガー設定
```yaml
on:
  # プッシュトリガー
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'
  
  # プルリクエストトリガー
  pull_request:
    branches: [ main ]
    types: [ opened, synchronize, reopened ]
  
  # スケジュール実行
  schedule:
    - cron: '0 2 * * *'  # 毎日午前2時（UTC）
  
  # 手動実行
  workflow_dispatch:
    inputs:
      environment:
        description: 'デプロイ環境'
        required: true
        default: 'staging'
        type: choice
        options:
          - development
          - staging
          - production
  
  # 他のワークフロー完了時
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
```

### 条件式
```yaml
# 基本的な条件
if: github.event_name == 'push'
if: github.ref == 'refs/heads/main'
if: contains(github.event.head_commit.message, '[skip ci]') == false

# ステップの実行結果による条件
if: success()  # 前のステップが成功
if: failure()  # 前のステップが失敗
if: always()   # 常に実行
if: cancelled()  # キャンセルされた場合

# 複雑な条件
if: |
  github.event_name == 'push' &&
  github.ref == 'refs/heads/main' &&
  !contains(github.event.head_commit.message, '[skip ci]')

# ジョブの実行結果を参照
if: needs.build.result == 'success'
```

### 環境変数とコンテキスト
```yaml
env:
  # グローバル環境変数
  NODE_VERSION: '18'
  
jobs:
  build:
    env:
      # ジョブレベル環境変数
      BUILD_ENV: production
    
    steps:
      - name: ステップ
        env:
          # ステップレベル環境変数
          STEP_VAR: value
        run: |
          # GitHubコンテキスト
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "SHA: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
          echo "Event: ${{ github.event_name }}"
          
          # ランナーコンテキスト
          echo "OS: ${{ runner.os }}"
          echo "Arch: ${{ runner.arch }}"
          
          # ジョブコンテキスト
          echo "Status: ${{ job.status }}"
          
          # ステップコンテキスト
          echo "Step output: ${{ steps.previous-step.outputs.result }}"
```

### マトリクス戦略
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [16, 18, 20]
    include:
      - os: ubuntu-latest
        node: 18
        experimental: true
    exclude:
      - os: windows-latest
        node: 16
  fail-fast: false  # 一つ失敗しても他を継続
  max-parallel: 2   # 並列実行数の制限
```

### 出力とアーティファクト
```yaml
jobs:
  generate:
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=1.0.0" >> $GITHUB_OUTPUT
  
  use:
    needs: generate
    steps:
      - run: echo "Version is ${{ needs.generate.outputs.version }}"
```

### シークレットとセキュアな値
```yaml
# Organization/Repository secrets
env:
  API_KEY: ${{ secrets.API_KEY }}

# Environment secrets
environment: production
env:
  PROD_KEY: ${{ secrets.PROD_KEY }}

# GitHub token (自動提供)
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

# マスキング
- run: |
    echo "::add-mask::$SECRET_VALUE"
    echo "This is masked: $SECRET_VALUE"
```

## 🔧 トラブルシューティング

### よくあるエラーと解決方法

#### 1. Permission denied
```yaml
# 解決: 適切な権限を付与
permissions:
  contents: write
  pull-requests: write
```

#### 2. Resource not accessible by integration
```yaml
# 解決: GITHUB_TOKENの権限確認
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

#### 3. Cannot find module
```yaml
# 解決: 依存関係のインストール
- run: npm ci  # npm installではなくciを使用
```

#### 4. Timeout
```yaml
# 解決: タイムアウト時間を延長
timeout-minutes: 60
```

#### 5. Out of memory
```yaml
# 解決: Node.jsのメモリ制限を増やす
- run: node --max-old-space-size=4096 build.js
```

### デバッグテクニック

#### デバッグログの有効化
```yaml
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
```

#### ワークフローの一時停止
```yaml
- name: デバッグ用一時停止
  uses: mxschmitt/action-tmate@v3
  if: ${{ github.event_name == 'workflow_dispatch' }}
```

#### 変数の確認
```yaml
- name: 環境変数の確認
  run: |
    echo "All env vars:"
    env | sort
    
    echo "GitHub context:"
    echo '${{ toJSON(github) }}'
    
    echo "Runner context:"
    echo '${{ toJSON(runner) }}'
```

## 📊 パフォーマンス最適化

### キャッシュ戦略
```yaml
# 依存関係のキャッシュ
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.cache
      node_modules
    key: deps-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      deps-${{ runner.os }}-

# ビルド成果物のキャッシュ
- uses: actions/cache@v4
  with:
    path: |
      dist/
      .next/
    key: build-${{ github.sha }}
    restore-keys: |
      build-
```

### ジョブの並列化
```yaml
jobs:
  # 独立したジョブは自動的に並列実行
  lint:
    runs-on: ubuntu-latest
    # ...
  
  test:
    runs-on: ubuntu-latest
    # ...
  
  # 依存関係がある場合
  deploy:
    needs: [lint, test]
    runs-on: ubuntu-latest
    # ...
```

### 条件付き実行
```yaml
# 変更がない場合はスキップ
- name: Check for changes
  id: changes
  uses: dorny/paths-filter@v2
  with:
    filters: |
      src:
        - 'src/**'
      tests:
        - 'tests/**'

- name: Run tests
  if: steps.changes.outputs.src == 'true' || steps.changes.outputs.tests == 'true'
  run: npm test
```

## 🎨 ベストプラクティス

### 1. 再利用可能なワークフロー
```yaml
# .github/workflows/reusable-build.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18'

# 使用側
jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
```

### 2. 複合アクション
```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
description: 'Setup Node.js and install dependencies'
runs:
  using: "composite"
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
      shell: bash
```

### 3. 環境保護ルール
```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    # 環境の保護ルールが自動適用される
```

## 📝 プロジェクト固有の設定

### PMPLearningManagement標準設定
```yaml
# 標準的なNode.jsセットアップ
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

# 標準的なインストールコマンド
- name: Install dependencies
  run: npm ci

# 標準的なビルドコマンド
- name: Build project
  run: npm run build

# 標準的なテストコマンド
- name: Run tests
  run: npm test

# GitHub Pagesデプロイ
- name: Deploy to GitHub Pages
  run: npm run deploy
```

---

*このクイックリファレンスは、GitHub Actionsワークフロー開発時の即座の参照用です。詳細な情報は公式ドキュメントを参照してください。*